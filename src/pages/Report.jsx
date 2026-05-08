import {
  AlertTriangle,
  Building2,
  Camera,
  CheckCircle2,
  CircleHelp,
  FileQuestion,
  ImagePlus,
  Landmark,
  Loader2,
  LocateFixed,
  MapPin,
  MapPinned,
  Pencil,
  PlusCircle,
  Route as RouteIcon,
  School,
  Send,
  Stethoscope,
  Trash2,
  UsersRound,
  Zap
} from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { categories } from "../utils/categories.js";
import { crisisTypes, damageLevels, debrisOptions } from "../utils/crisisOptions.js";
import { drcLocations, provinces } from "../utils/drcLocations.js";
import { resolveDrcCoordinates, resolveDrcLocation } from "../utils/geoLocation.js";
import { languageOptions } from "../utils/languageOptions.js";
import { buildReportFormData, listOfflineReports, saveOfflineReport, syncOfflineReports } from "../utils/offlineReports.js";
import { getReportCopy } from "../utils/reportI18n.js";

const ReportMap = lazy(() => import("../components/ReportMap.jsx"));

const initialForm = {
  title: "",
  description: "",
  category: "",
  infrastructureType: "",
  infrastructureName: "",
  assetId: "",
  language: "en",
  crisisType: "flood",
  damageLevel: "partial",
  debris: "unknown",
  locationDescription: "",
  accessBlocked: false,
  servicesDisrupted: false,
  livelihoodsAffected: false,
  peopleAtRisk: false,
  reporterName: "",
  reporterContact: "",
  reporterOrganization: "",
  reporterRole: "community_member",
  reporterConsent: false,
  crisisId: "kinshasa-flood-response",
  province: "Kinshasa",
  commune: "Gombe"
};

const maxImages = 3;
const maxImageSize = 5 * 1024 * 1024;
const infrastructureFlow = ["residential", "commercial", "government", "utility", "transport", "communication", "health", "education", "public_space", "other"];

const infrastructureIcons = {
  residential: Building2,
  commercial: FileQuestion,
  government: Landmark,
  utility: Zap,
  transport: RouteIcon,
  communication: UsersRound,
  health: Stethoscope,
  education: School,
  public_space: UsersRound,
  other: CircleHelp
};

async function compressImage(file) {
  if (!file.type.startsWith("image/")) return file;
  const imageUrl = URL.createObjectURL(file);
  const image = new Image();
  image.src = imageUrl;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(imageUrl);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg", lastModified: Date.now() });
}

export default function Report() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [crises, setCrises] = useState([]);
  const [selectedFootprint, setSelectedFootprint] = useState(null);
  const [dynamicArea, setDynamicArea] = useState(null);
  const autoLocateStarted = useRef(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const copy = getReportCopy(form.language);

  const previews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images]
  );

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  useEffect(() => {
    if (autoLocateStarted.current) return;
    autoLocateStarted.current = true;
    useGps({ revealMapOnSuccess: false });
    refreshOfflineCount();
    api("/crises").then((items) => {
      setCrises(items);
      if (items?.[0]?.slug) setForm((current) => ({ ...current, crisisId: items[0].slug }));
    }).catch(() => {});
  }, []);

  async function refreshOfflineCount() {
    if (!("indexedDB" in window)) return;
    const items = await listOfflineReports().catch(() => []);
    setOfflineCount(items.length);
  }

  function update(field, value) {
    setSuccess(null);
    setErrors((current) => ({ ...current, [field]: "" }));
    let nextProvince = form.province;
    let nextCommune = form.commune;

      setForm((current) => {
      if (field === "province") {
        nextProvince = value;
        nextCommune = drcLocations[value]?.[0] || current.commune || "";
        return { ...current, province: nextProvince, commune: nextCommune };
      }
      if (field === "commune") nextCommune = value;
      return { ...current, [field]: value };
    });

    if (field === "province" || field === "commune") {
      syncManualLocation(nextProvince, nextCommune);
    }
  }

  function updateBoolean(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function syncManualLocation(province, commune) {
    if (!province || !commune) return;
    const nextLocation = await resolveDrcCoordinates(province, commune);
    if (!nextLocation) return;
    setLocation(nextLocation);
    setErrors((current) => ({ ...current, location: "" }));
    setLocationStatus(`Location resolved: ${province} / ${commune}`);
  }

  async function applyLocation(nextLocation, source = "map") {
    setLocation(nextLocation);
    setSelectedFootprint(null);
    setErrors((current) => ({ ...current, location: "" }));
    setLocationStatus(source === "gps" ? "Resolving GPS location..." : "Resolving selected point...");

    const resolved = await resolveDrcLocation(nextLocation.lat, nextLocation.lng);
    if (resolved.province) {
      setDynamicArea(resolved);
      setForm((current) => ({
        ...current,
        province: resolved.province,
        commune: resolved.commune || drcLocations[resolved.province]?.[0] || current.commune
      }));
      setLocationStatus(`Location resolved: ${resolved.country ? `${resolved.country} / ` : ""}${resolved.province}${resolved.commune ? ` / ${resolved.commune}` : ""}`);
      return;
    }
    setDynamicArea(null);
    setLocationStatus("Location selected. Please verify the administrative area.");
  }

  function useGps(options = {}) {
    const { revealMapOnSuccess = true } = options;
    if (!navigator.geolocation) {
      setMapVisible(true);
      setLocationStatus("GPS is not available on this device.");
      return;
    }

    setLocating(true);
    setLocationStatus("Getting GPS location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await applyLocation({ lat: position.coords.latitude, lng: position.coords.longitude }, "gps");
        setMapVisible(revealMapOnSuccess);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setMapVisible(true);
        setLocationStatus("GPS permission denied or unavailable. Select the point on the map.");
      }
    );
  }

  function selectInfrastructure(key) {
    setForm((current) => ({ ...current, category: key, infrastructureType: key }));
    setErrors((current) => ({ ...current, category: "" }));
  }

  const provinceOptions = useMemo(() => Array.from(new Set([form.province, ...provinces].filter(Boolean))), [form.province]);
  const communeOptions = useMemo(
    () => Array.from(new Set([form.commune, ...(drcLocations[form.province] || [])].filter(Boolean))),
    [form.commune, form.province]
  );

  async function addImages(fileList) {
    const files = Array.from(fileList || []);
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setErrors((current) => ({ ...current, images: "Only image files are accepted." }));
        return false;
      }
      return true;
    });
    const compressedFiles = [];

    for (const file of validFiles) {
      const compressed = await compressImage(file).catch(() => file);
      if (compressed.size > maxImageSize) {
        setErrors((current) => ({ ...current, images: "Each image must be 5 MB or less after compression." }));
      } else {
        compressedFiles.push(compressed);
      }
    }

    setImages((current) => [...current, ...compressedFiles].slice(0, maxImages));
    if (files.length + images.length > maxImages) {
      setErrors((current) => ({ ...current, images: "Maximum 3 images." }));
    }
  }

  function removeImage(index) {
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function validate() {
    const nextErrors = {};
    if (!form.category) nextErrors.category = "Select the affected infrastructure.";
    if (!form.crisisType) nextErrors.crisisType = "Select the crisis type.";
    if (!form.damageLevel) nextErrors.damageLevel = "Select the damage level.";
    if (images.length === 0) nextErrors.images = "Add at least one photo.";
    if (form.title.trim().length < 3) nextErrors.title = "Add a short report title.";
    if (form.description.trim().length < 10) nextErrors.description = "Add at least 10 characters of field context.";
    if (!location) nextErrors.location = "Choose a GPS position or select the location on the map.";
    return nextErrors;
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setMessage(copy.required);
      return;
    }

    setSubmitting(true);
    setMessage("");
    const payload = {
      fields: {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        infrastructureType: form.infrastructureType || form.category,
        infrastructureName: form.infrastructureName.trim(),
        assetId: form.assetId.trim(),
        language: form.language,
        crisisType: form.crisisType,
        damageLevel: form.damageLevel,
        debris: form.debris,
        locationDescription: form.locationDescription.trim(),
        accessBlocked: String(form.accessBlocked),
        servicesDisrupted: String(form.servicesDisrupted),
        livelihoodsAffected: String(form.livelihoodsAffected),
        peopleAtRisk: String(form.peopleAtRisk),
        reporterName: form.reporterName.trim(),
        reporterContact: form.reporterContact.trim(),
        reporterOrganization: form.reporterOrganization.trim(),
        reporterRole: form.reporterRole,
        reporterConsent: String(form.reporterConsent),
        channel: "web",
        collectionTime: new Date().toISOString(),
        appVersion: "web-mvp",
        crisisId: form.crisisId,
        buildingFootprintId: selectedFootprint?.id || form.assetId.trim() || `${form.province}-${form.commune}-${location.lat.toFixed(5)}-${location.lng.toFixed(5)}`,
        buildingFootprintName: selectedFootprint?.name || form.infrastructureName.trim(),
        buildingFootprintSource: selectedFootprint?.source || (form.assetId.trim() ? "user-provided" : "gps-derived-prototype"),
        buildingFootprintGeometry: selectedFootprint?.geometry ? JSON.stringify(selectedFootprint.geometry) : "",
        province: form.province,
        commune: form.commune,
        address: dynamicArea?.addressText || `${form.commune}, ${form.province}`,
        lat: String(location.lat),
        lng: String(location.lng)
      },
      images
    };
    const body = buildReportFormData(payload);

    try {
      await api(isAuthenticated ? "/reports" : "/reports/guest", { method: "POST", body });
      setSuccess(true);
      setForm(initialForm);
      setImages([]);
      setLocation(null);
              setSelectedFootprint(null);
              setDynamicArea(null);
      setMapVisible(false);
      setErrors({});
      autoLocateStarted.current = false;
    } catch (err) {
      if ("indexedDB" in window) {
        await saveOfflineReport(payload);
        await refreshOfflineCount();
        setSuccess("offline");
        setForm(initialForm);
        setImages([]);
        setLocation(null);
        setSelectedFootprint(null);
        setMapVisible(false);
        setErrors({});
      } else {
        setMessage(err.message || "Unable to submit the crisis report.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function syncSavedReports() {
    setSyncingOffline(true);
    setMessage("");
    try {
      const result = await syncOfflineReports({ authenticated: isAuthenticated });
      await refreshOfflineCount();
      setMessage(`${result.synced.length} offline report(s) synced. ${result.failed.length} still pending.`);
    } catch (error) {
      setMessage(error.message || "Unable to sync offline reports.");
    } finally {
      setSyncingOffline(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center px-0 py-8 sm:px-4">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 size={34} />
          </div>
          <h1 className="mt-2 text-xl font-semibold text-text">{success === "offline" ? copy.savedOfflineTitle : copy.submittedTitle}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {success === "offline"
              ? copy.savedOfflineText
              : copy.submittedText}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/app/map" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white">
              {copy.viewMap}
            </Link>
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
            >
              <PlusCircle size={18} />
              {copy.newReport}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (!form.category) {
    return (
      <div className="mx-auto w-full max-w-[1080px] space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{copy.pageKicker}</p>
          <h1 className="font-heading text-2xl font-black text-text md:text-3xl">{copy.categoryTitle}</h1>
          <p className="max-w-3xl text-sm font-medium text-slate-500 md:text-base">
            {copy.categoryIntro}
          </p>
        </div>
        <Card className="space-y-4 p-4 md:p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {infrastructureFlow.map((key) => {
              const item = categories[key];
              const Icon = infrastructureIcons[key] || CircleHelp;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectInfrastructure(key)}
                  className="min-h-[132px] rounded-xl border border-slate-200 bg-white p-4 text-left text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50 active:scale-[0.98]"
                >
                  <Icon size={24} style={{ color: item?.color || "#16a34a" }} />
                  <span className="mt-4 block text-sm font-black">{item?.label || key}</span>
                  <span className="mt-1 block text-xs font-semibold text-slate-500">{copy.openForm}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-[1080px] space-y-4 pb-[calc(10rem+env(safe-area-inset-bottom))] md:pb-8">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{copy.pageKicker}</p>
        <h1 className="font-heading text-2xl font-black text-text md:text-3xl">{copy.pageTitle}</h1>
        <p className="max-w-3xl text-sm font-medium text-slate-500 md:text-base">
          {copy.pageIntro}
        </p>
      </div>

      {message && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{message}</p>}
      {offlineCount > 0 && (
        <Card className="flex flex-col gap-3 border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-amber-900">{offlineCount} {offlineCount > 1 ? copy.offlineWaitingPlural : copy.offlineWaiting}</p>
            <p className="text-xs font-semibold text-amber-800">{copy.syncIntro}</p>
          </div>
          <Button type="button" variant="ghost" onClick={syncSavedReports} disabled={syncingOffline}>
            {syncingOffline ? copy.syncing : copy.syncNow}
          </Button>
        </Card>
      )}

      <Card className="space-y-4 p-4 md:p-5">
        <div>
          <h2 className="font-heading text-lg font-black text-text">{copy.classificationTitle}</h2>
          <p className="text-sm font-semibold text-slate-500">
            {categories[form.category]?.label}
            <button type="button" onClick={() => update("category", "")} className="ml-2 font-black text-primary underline">{copy.changeCategory}</button>
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{copy.classificationIntro}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">{copy.crisisWorkspace}</span>
            <select value={form.crisisId} onChange={(event) => update("crisisId", event.target.value)} className="form-field">
              {crises.length === 0 ? <option value="kinshasa-flood-response">Kinshasa Flood Response</option> : null}
              {crises.map((crisis) => (
                <option key={crisis.slug} value={crisis.slug}>{crisis.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">{copy.crisisType}</span>
            <select value={form.crisisType} onChange={(event) => update("crisisType", event.target.value)} className="form-field">
              {Object.entries(crisisTypes).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">{copy.damageLevel}</span>
            <select value={form.damageLevel} onChange={(event) => update("damageLevel", event.target.value)} className="form-field">
              {Object.entries(damageLevels).map(([key, item]) => (
                <option key={key} value={key}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">{copy.languageLabel}</span>
            <select value={form.language} onChange={(event) => update("language", event.target.value)} className="form-field">
              {Object.entries(languageOptions).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
          <AlertTriangle className="mr-2 inline text-primary" size={17} />
          {copy.damageHint} {damageLevels[form.damageLevel]?.description}
        </div>
        <label>
          <span className="mb-1 block text-sm font-semibold text-slate-700">{copy.debris}</span>
          <select value={form.debris} onChange={(event) => update("debris", event.target.value)} className="form-field">
            {Object.entries(debrisOptions).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>
      </Card>

      <Card className="space-y-4 p-4 md:p-5">
        <div>
          <h2 className="font-heading text-lg font-black text-text">{copy.photoTitle}</h2>
          <p className="text-sm font-semibold text-slate-500">{copy.photoIntro}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button type="button" variant="success" size="lg" onClick={() => cameraInputRef.current?.click()} className="w-full">
            <Camera size={19} />
            {copy.takePhoto}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => galleryInputRef.current?.click()} className="w-full">
            <ImagePlus size={19} />
            {copy.uploadImage}
          </Button>
        </div>
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => addImages(event.target.files)} />
        <input ref={galleryInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={(event) => addImages(event.target.files)} />
        {errors.images && <p className="text-xs font-bold text-red-600">{errors.images}</p>}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {previews.map((preview, index) => (
              <div key={`${preview.file.name}-${index}`} className="relative overflow-hidden rounded-xl border border-slate-100">
                <img src={preview.url} alt="" className="h-32 w-full object-cover" />
                <button type="button" onClick={() => removeImage(index)} className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-danger shadow-sm">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-4 p-4 md:p-5">
        <div>
          <h2 className="font-heading text-lg font-black text-text">{copy.detailsTitle}</h2>
          <p className="text-sm font-semibold text-slate-500">{copy.detailsIntro}</p>
        </div>
        <input
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder={copy.titlePlaceholder}
          className={`form-field ${errors.title ? "border-red-300" : ""}`}
        />
        {errors.title && <p className="text-xs font-bold text-red-600">{errors.title}</p>}
        <textarea
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder={copy.descriptionPlaceholder}
          rows={4}
          className={`form-field ${errors.description ? "border-red-300" : ""}`}
        />
        {errors.description && <p className="text-xs font-bold text-red-600">{errors.description}</p>}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            value={form.infrastructureName}
            onChange={(event) => update("infrastructureName", event.target.value)}
            placeholder={copy.infrastructureName}
            className="form-field"
          />
          <input
            value={form.assetId}
            onChange={(event) => update("assetId", event.target.value)}
            placeholder={copy.assetId}
            className="form-field"
          />
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-black text-text">{copy.modularTitle}</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {[
              ["accessBlocked", copy.accessBlocked],
              ["servicesDisrupted", copy.servicesDisrupted],
              ["livelihoodsAffected", copy.livelihoodsAffected],
              ["peopleAtRisk", copy.peopleAtRisk]
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 rounded-lg bg-white p-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(event) => updateBoolean(key, event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-black text-text">{copy.reporterTitle}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{copy.reporterIntro}</p>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={form.reporterName}
              onChange={(event) => update("reporterName", event.target.value)}
              placeholder={copy.reporterName}
              className="form-field"
            />
            <input
              value={form.reporterContact}
              onChange={(event) => update("reporterContact", event.target.value)}
              placeholder={copy.reporterContact}
              className="form-field"
            />
            <input
              value={form.reporterOrganization}
              onChange={(event) => update("reporterOrganization", event.target.value)}
              placeholder={copy.reporterOrganization}
              className="form-field"
            />
            <select value={form.reporterRole} onChange={(event) => update("reporterRole", event.target.value)} className="form-field">
              <option value="community_member">Community member</option>
              <option value="local_leader">Local leader</option>
              <option value="ngo">NGO</option>
              <option value="government">Government</option>
              <option value="responder">Responder</option>
              <option value="other">Other</option>
            </select>
          </div>
          <label className="mt-3 flex items-center gap-2 rounded-lg bg-white p-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.reporterConsent}
              onChange={(event) => updateBoolean("reporterConsent", event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            {copy.reporterConsent}
          </label>
        </div>
      </Card>

      <Card className="space-y-4 p-4 md:p-5">
        <div>
          <h2 className="font-heading text-lg font-black text-text">{copy.locationTitle}</h2>
          <p className="text-sm font-semibold text-slate-500">{copy.locationIntro}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">{copy.region}</span>
            <select value={form.province} onChange={(event) => update("province", event.target.value)} className="form-field">
              {provinceOptions.map((province) => (
                <option value={province} key={province}>{province}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">{copy.localArea}</span>
            <select value={form.commune} onChange={(event) => update("commune", event.target.value)} className="form-field">
              {communeOptions.map((commune) => (
                <option value={commune} key={commune}>{commune}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Button type="button" onClick={() => useGps({ revealMapOnSuccess: false })} variant="ghost" className="w-full" disabled={locating}>
            <LocateFixed size={18} />
            {locating ? copy.locating : copy.useGps}
          </Button>
          <Button type="button" onClick={() => setMapVisible(true)} variant="ghost" className="w-full">
            <Pencil size={18} />
            {copy.selectOnMap}
          </Button>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-600">
          {location ? (
            <span className="flex items-center gap-2 text-text">
              <MapPin size={17} className="text-primary" />
              {dynamicArea?.country ? `${dynamicArea.country} / ` : ""}{form.province} / {form.commune} - {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </span>
          ) : (
            locationStatus || copy.noLocation
          )}
        </div>
        <input
          value={form.locationDescription}
          onChange={(event) => update("locationDescription", event.target.value)}
          placeholder={copy.locationFallback}
          className="form-field"
        />
        {errors.location && <p className="text-xs font-bold text-red-600">{errors.location}</p>}
        {selectedFootprint && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">
            {copy.selectedBuilding}: {selectedFootprint.name} - {selectedFootprint.id}
          </div>
        )}
        {mapVisible && (
          <Suspense fallback={<div className="flex h-[300px] items-center justify-center rounded-xl border bg-slate-50 text-sm font-bold text-slate-500">Loading map...</div>}>
            <ReportMap
              height="min(500px, 55vh)"
              onPick={(nextLocation) => applyLocation(nextLocation, "map")}
              pickedLocation={location}
              onFootprintPick={setSelectedFootprint}
              pickedFootprint={selectedFootprint}
              footprintAreaLabel={`${form.province}-${form.commune}`}
            />
          </Suspense>
        )}
      </Card>

      <Card className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-bold text-slate-500">
          {copy.footer}
        </p>
        <Button type="submit" variant="success" size="lg" className="w-full sm:w-auto" disabled={submitting}>
          {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          {submitting ? copy.submitting : copy.submit}
        </Button>
      </Card>
    </form>
  );
}
