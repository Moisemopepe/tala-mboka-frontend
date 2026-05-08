import { List, Map, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import CategoryFilter from "../components/CategoryFilter.jsx";
import ReportCard from "../components/ReportCard.jsx";
import ReportMap from "../components/ReportMap.jsx";
import Button from "../components/Button.jsx";
import { crisisTypes, damageLevels } from "../utils/crisisOptions.js";
import { provinces } from "../utils/drcLocations.js";
import { sampleReports } from "../utils/sampleReports.js";
import { distanceKm } from "../utils/risk.js";
import { getAppCopy, getStoredLanguage } from "../utils/appI18n.js";
import { getAppOptionLabels } from "../utils/appOptionI18n.js";

const distanceValues = ["", "1", "5", "10", "25"];

export default function Home() {
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");
  const [crisisType, setCrisisType] = useState("");
  const [damageLevel, setDamageLevel] = useState("");
  const [distance, setDistance] = useState("");
  const [mode, setMode] = useState("map");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [loading, setLoading] = useState(true);
  const [debouncedFilters, setDebouncedFilters] = useState({ category: "", province: "" });
  const [language, setLanguage] = useState(getStoredLanguage);
  const copy = getAppCopy(language).map;
  const optionCopy = getAppOptionLabels(language);

  useEffect(() => {
    function syncLanguage(event) {
      setLanguage(event.detail || getStoredLanguage());
    }
    window.addEventListener("tala:language-changed", syncLanguage);
    return () => window.removeEventListener("tala:language-changed", syncLanguage);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedFilters({ category, province }), 250);
    return () => window.clearTimeout(timer);
  }, [category, province]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedFilters.category) params.set("category", debouncedFilters.category);
    if (debouncedFilters.province) params.set("province", debouncedFilters.province);
    if (crisisType) params.set("crisisType", crisisType);
    if (damageLevel) params.set("damageLevel", damageLevel);
    api(`/reports${params.toString() ? `?${params.toString()}` : ""}`)
      .then((items) => setReports(items.length ? items : sampleReports))
      .catch(() => setReports(sampleReports))
      .finally(() => setLoading(false));
  }, [debouncedFilters, crisisType, damageLevel]);

  const enrichedReports = useMemo(() => {
    return reports
      .map((report) => {
        const reportLocation = { lat: report.location.lat, lng: report.location.lng };
        const km = userLocation ? distanceKm(userLocation, reportLocation) : null;
        return { ...report, distanceKm: km };
      })
      .filter((report) => !distance || (typeof report.distanceKm === "number" && report.distanceKm <= Number(distance)))
      .sort((a, b) => {
        if (userLocation) return (a.distanceKm || 0) - (b.distanceKm || 0);
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 500);
  }, [reports, distance, userLocation]);

  const selectedReport = enrichedReports.find((report) => report._id === searchParams.get("report"));
  const selectedLocation = selectedReport ? { lat: selectedReport.location.lat, lng: selectedReport.location.lng } : userLocation;

  function resetFilters() {
    setCategory("");
    setProvince("");
    setCrisisType("");
    setDamageLevel("");
    setDistance("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-xl font-black text-text md:text-2xl lg:text-3xl">{copy.title}</h1>
          <p className="text-sm font-medium text-slate-500 md:text-base">
            {copy.text}
          </p>
        </div>
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => setMode("map")} className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold ${mode === "map" ? "bg-white text-primary shadow-sm" : "text-slate-600"}`}>
            <Map size={17} />
            {copy.map}
          </button>
          <button type="button" onClick={() => setMode("list")} className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold ${mode === "list" ? "bg-white text-primary shadow-sm" : "text-slate-600"}`}>
            <List size={17} />
            {copy.list}
          </button>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200/70 bg-white p-3 shadow-sm">
        <select value={province} onChange={(event) => setProvince(event.target.value)} className="form-field text-sm font-bold">
          <option value="">{copy.allRegions}</option>
          {provinces.map((item) => (
            <option value={item} key={item}>{item}</option>
          ))}
        </select>
        <CategoryFilter value={category} onChange={setCategory} language={language} />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
          <select value={crisisType} onChange={(event) => setCrisisType(event.target.value)} className="form-field text-sm font-bold">
            <option value="">{copy.allCrisis}</option>
            {Object.entries(crisisTypes).map(([key, label]) => (
              <option value={key} key={key}>{optionCopy.crisis[key] || label}</option>
            ))}
          </select>
          <select value={damageLevel} onChange={(event) => setDamageLevel(event.target.value)} className="form-field text-sm font-bold">
            <option value="">{copy.allDamage}</option>
            {Object.entries(damageLevels).map(([key, item]) => (
              <option value={key} key={key}>{optionCopy.damage[key]?.label || item.label}</option>
            ))}
          </select>
          <select value={distance} onChange={(event) => setDistance(event.target.value)} className="form-field text-sm font-bold" disabled={!userLocation}>
            {distanceValues.map((value, index) => (
              <option value={value} key={value}>{copy.distances[index]}</option>
            ))}
          </select>
          <Button type="button" variant="ghost" onClick={resetFilters}>
            <RotateCcw size={17} />
            {copy.reset}
          </Button>
        </div>
        {!userLocation && distance && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{copy.enableLocation}</p>
        )}
        {locationError && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{locationError}</p>}
      </div>

      {selectedReport && <p className="rounded-xl bg-green-50 p-3 text-sm font-bold text-primary">{copy.centered} {selectedReport.title}</p>}
      {loading && <div className="h-[300px] animate-pulse rounded-xl bg-slate-100 md:h-[400px] lg:h-[500px]" />}

      {!loading && mode === "map" && (
        <ReportMap
          reports={enrichedReports}
          height="min(640px, calc(100vh - 280px))"
          pickedLocation={selectedLocation}
          analytics
          userLocation={userLocation}
          onUserLocation={(location) => {
            setUserLocation(location);
            setLocationError("");
          }}
          onLocationError={setLocationError}
        />
      )}

      {!loading && mode === "list" && enrichedReports.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {enrichedReports.map((report) => <ReportCard key={report._id} report={report} />)}
        </div>
      )}

      {!loading && enrichedReports.length === 0 && (
        <p className="w-full rounded-xl border border-slate-200 bg-white p-8 text-center font-semibold text-slate-500 shadow-sm">
          {copy.empty}
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 text-xs font-black text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(damageLevels).map(([key, item]) => (
          <div key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
