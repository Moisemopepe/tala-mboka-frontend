import { CheckCircle2, ImagePlus, Loader2, LocateFixed, MapPin, Pencil, PlusCircle, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import ReportMap from "../components/ReportMap.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { categories } from "../utils/categories.js";
import { drcLocations, provinces } from "../utils/drcLocations.js";
import { resolveDrcCoordinates, resolveDrcLocation } from "../utils/geoLocation.js";

const initialForm = {
  title: "",
  description: "",
  category: "road",
  province: "Kinshasa",
  commune: "Gombe"
};

const maxImages = 3;
const maxImageSize = 5 * 1024 * 1024;

export default function Report() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [locationStatusType, setLocationStatusType] = useState("idle");
  const [mapVisible, setMapVisible] = useState(false);
  const [manualSyncing, setManualSyncing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const autoLocateStarted = useRef(false);
  const fieldRefs = {
    title: useRef(null),
    description: useRef(null),
    category: useRef(null),
    location: useRef(null)
  };

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
  }, []);

  async function syncManualLocation(province, commune) {
    if (!province || !commune) return;

    setManualSyncing(true);
    const nextLocation = await resolveDrcCoordinates(province, commune);
    setManualSyncing(false);

    if (!nextLocation) return;

    setSuccess(null);
    setLocation(nextLocation);
    setErrors((current) => ({ ...current, location: "" }));
    setLocationStatus(`Position détectée: ${province} + ${commune}`);
    setLocationStatusType("success");
  }

  function update(field, value) {
    setSuccess(null);
    setErrors((current) => ({ ...current, [field]: "" }));
    let nextProvince = form.province;
    let nextCommune = form.commune;

    setForm((current) => {
      if (field === "province") {
        nextProvince = value;
        nextCommune = drcLocations[value]?.[0] || "";
        return { ...current, province: nextProvince, commune: nextCommune };
      }
      if (field === "commune") {
        nextCommune = value;
      }
      return { ...current, [field]: value };
    });

    if (field === "province" || field === "commune") {
      syncManualLocation(nextProvince, nextCommune);
    }
  }

  function validate() {
    const nextErrors = {};
    if (form.title.trim().length < 3) nextErrors.title = "Le titre doit contenir au moins 3 caracteres.";
    if (form.description.trim().length < 10) {
      nextErrors.description = "La description doit contenir au moins 10 caracteres.";
    }
    if (!form.category) nextErrors.category = "Choisissez une categorie.";
    if (!location) nextErrors.location = "Choisissez une position GPS ou cliquez sur la carte.";
    return nextErrors;
  }

  function focusFirstError(nextErrors) {
    const firstKey = Object.keys(nextErrors)[0];
    const target = fieldRefs[firstKey]?.current;
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    target?.focus?.();
  }

  async function applyLocation(nextLocation, source = "map") {
    setSuccess(null);
    setLocation(nextLocation);
    setErrors((current) => ({ ...current, location: "" }));
    setLocationStatus(source === "gps" ? "Localisation en cours..." : "Recherche province et commune...");
    setLocationStatusType("loading");

    const resolved = await resolveDrcLocation(nextLocation.lat, nextLocation.lng);

    if (resolved.province && resolved.commune) {
      setForm((current) => ({ ...current, province: resolved.province, commune: resolved.commune }));
      setLocationStatus(`Position détectée: ${resolved.province} + ${resolved.commune}`);
      setLocationStatusType("success");
      return;
    }

    if (resolved.province) {
      setForm((current) => ({
        ...current,
        province: resolved.province,
        commune: drcLocations[resolved.province]?.[0] || current.commune
      }));
      setLocationStatus(`Position détectée: ${resolved.province}. Vérifiez la commune.`);
      setLocationStatusType("success");
      return;
    }

    setLocationStatus("Position sélectionnée. Vérifiez la province et la commune.");
    setLocationStatusType("success");
  }

  function useGps(options = {}) {
    const { revealMapOnSuccess = true } = options;
    if (!navigator.geolocation) {
      setMapVisible(true);
      setLocationStatus("Impossible de détecter votre position");
      setLocationStatusType("error");
      return;
    }

    setLocating(true);
    setLocationStatus("Localisation en cours...");
    setLocationStatusType("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await applyLocation({ lat: position.coords.latitude, lng: position.coords.longitude }, "gps");
        setMapVisible(revealMapOnSuccess);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setMapVisible(true);
        setLocationStatus("Impossible de détecter votre position");
        setLocationStatusType("error");
      }
    );
  }

  function addImages(fileList) {
    const files = Array.from(fileList || []);
    const nextErrors = {};
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        nextErrors.images = "Ajoutez uniquement des images.";
        return false;
      }
      if (file.size > maxImageSize) {
        nextErrors.images = "Chaque image doit faire 5MB maximum.";
        return false;
      }
      return true;
    });

    setImages((current) => [...current, ...validFiles].slice(0, maxImages));
    setErrors((current) => ({
      ...current,
      images: files.length + images.length > maxImages ? "Maximum 3 images." : nextErrors.images || ""
    }));
  }

  function removeImage(index) {
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }

    setSubmitting(true);
    setMessage("");
    setSuccess(null);

    const body = new FormData();
    body.append("title", form.title.trim());
    body.append("description", form.description.trim());
    body.append("category", form.category);
    body.append("province", form.province);
    body.append("commune", form.commune);
    body.append("address", `${form.commune}, ${form.province}`);
    body.append("lat", location.lat);
    body.append("lng", location.lng);
    images.forEach((image) => body.append("images", image));

    try {
      const data = await api(isAuthenticated ? "/reports" : "/reports/guest", { method: "POST", body });
      setSuccess({
        title: isAuthenticated ? "Alerte publiee" : "Alerte envoyee avec succes",
        subtitle: isAuthenticated ? "Votre alerte est visible dans le fil citoyen." : "En attente de validation",
        message: data.message
      });
      setForm(initialForm);
      setImages([]);
      setLocation(null);
      setLocationStatus("");
      setLocationStatusType("idle");
      setMapVisible(false);
      autoLocateStarted.current = false;
      setErrors({});
    } catch (err) {
      setMessage(err.message || "Impossible d'envoyer l'alerte.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="animate-[fadeIn_0.2s_ease-out] space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-black text-text">Nouveau signalement</h1>
        <p className="text-sm font-medium text-slate-500">
          {isAuthenticated ? "Votre alerte sera publiée immédiatement" : "Votre alerte sera vérifiée avant publication"}
        </p>
      </div>

      {success && (
        <Card className="border-emerald-100 bg-emerald-50 p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="shrink-0 text-success" size={24} />
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-lg font-black text-success">{success.title}</h2>
              <p className="text-sm font-bold text-emerald-800">{success.subtitle}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Button as={Link} to="/" type="button" variant="success">
                  Voir les alertes
                </Button>
                <Button type="button" variant="ghost" onClick={() => setSuccess(null)}>
                  <PlusCircle size={18} />
                  Ajouter une autre alerte
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {message && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{message}</p>}

      <Card className="space-y-3 p-4">
        <h2 className="font-heading text-lg font-black text-text">Formulaire</h2>
        <div>
          <input
            ref={fieldRefs.title}
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder="Titre du probleme"
            className={`form-field ${errors.title ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""}`}
          />
          {errors.title && <p className="mt-1 text-xs font-bold text-red-600">{errors.title}</p>}
        </div>
        <div>
          <textarea
            ref={fieldRefs.description}
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Description courte et claire"
            rows={3}
            className={`form-field ${errors.description ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""}`}
          />
          {errors.description && <p className="mt-1 text-xs font-bold text-red-600">{errors.description}</p>}
        </div>
        <div>
          <select
            ref={fieldRefs.category}
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
            className={`form-field ${errors.category ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""}`}
          >
            {Object.entries(categories).map(([key, item]) => (
              <option value={key} key={key}>
                {item.label}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs font-bold text-red-600">{errors.category}</p>}
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <h2 className="font-heading text-lg font-black text-text">Image</h2>
        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            addImages(event.dataTransfer.files);
          }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-primary hover:bg-blue-50"
        >
          <ImagePlus className="text-primary" size={28} />
          <span className="mt-2 text-sm font-black text-text">Ajouter jusqu'a 3 images</span>
          <span className="text-xs font-semibold text-slate-500">Cliquez ou glissez ici. 5MB maximum par image.</span>
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => addImages(event.target.files)} />
        </label>
        {errors.images && <p className="text-xs font-bold text-red-600">{errors.images}</p>}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((preview, index) => (
              <div key={`${preview.file.name}-${index}`} className="relative overflow-hidden rounded-xl border border-slate-100">
                <img src={preview.url} alt="" className="h-24 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-danger shadow-sm"
                  aria-label="Supprimer l'image"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div ref={fieldRefs.location}>
      <Card className="space-y-3 p-4">
        <h2 className="font-heading text-lg font-black text-text">Localisation</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={form.province} onChange={(event) => update("province", event.target.value)} className="form-field">
            {provinces.map((province) => (
              <option value={province} key={province}>
                {province}
              </option>
            ))}
          </select>
          <select value={form.commune} onChange={(event) => update("commune", event.target.value)} className="form-field">
            {(drcLocations[form.province] || []).map((commune) => (
              <option value={commune} key={commune}>
                {commune}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button type="button" onClick={() => useGps({ revealMapOnSuccess: false })} variant="ghost" className="w-full" disabled={locating}>
            <LocateFixed size={18} />
            {locating ? "Localisation..." : "Utiliser ma position"}
          </Button>
          <Button type="button" onClick={() => setMapVisible(true)} variant="ghost" className="w-full">
            <Pencil size={18} />
            Modifier l'emplacement
          </Button>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-600">
          {location ? (
            <span className="flex items-center gap-2 text-text">
              <MapPin size={17} className="text-primary" />
              Position détectée: {form.province} + {form.commune}
            </span>
          ) : (
            locationStatus || "Aucune position sélectionnée"
          )}
        </div>
        {locationStatus && location && (
          <p
            className={`rounded-xl p-3 text-xs font-bold ${
              locationStatusType === "error"
                ? "bg-red-50 text-red-700"
                : locationStatusType === "loading"
                  ? "bg-blue-50 text-primary"
                  : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {locationStatus}
          </p>
        )}
        {manualSyncing && <p className="text-xs font-bold text-slate-500">Synchronisation avec la carte...</p>}
        {errors.location && <p className="text-xs font-bold text-red-600">{errors.location}</p>}
        {mapVisible && (
          <>
            <p className="text-sm font-bold text-slate-600">Cliquez sur la carte pour choisir l'emplacement. Vous pouvez deplacer le marqueur.</p>
            <ReportMap height="320px" onPick={(nextLocation) => applyLocation(nextLocation, "map")} pickedLocation={location} />
          </>
        )}
        {location && (
          <p className="text-xs font-bold text-slate-500">
            Coordonnees: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </p>
        )}
      </Card>
      </div>

      <Button type="submit" variant="success" size="lg" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        {submitting ? "Envoi en cours..." : "Envoyer le signalement"}
      </Button>
    </form>
  );
}
