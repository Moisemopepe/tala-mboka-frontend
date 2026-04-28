import { List, Map, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import CategoryFilter from "../components/CategoryFilter.jsx";
import ReportCard from "../components/ReportCard.jsx";
import ReportMap from "../components/ReportMap.jsx";
import Button from "../components/Button.jsx";
import { categories } from "../utils/categories.js";
import { provinces } from "../utils/drcLocations.js";
import { distanceKm, getRiskLevel, riskLevels } from "../utils/risk.js";

const distanceOptions = [
  { value: "", label: "Toutes distances" },
  { value: "1", label: "Moins de 1 km" },
  { value: "5", label: "Moins de 5 km" },
  { value: "10", label: "Moins de 10 km" },
  { value: "25", label: "Moins de 25 km" }
];

export default function Home() {
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");
  const [status, setStatus] = useState("");
  const [distance, setDistance] = useState("");
  const [mode, setMode] = useState("map");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [loading, setLoading] = useState(true);
  const [debouncedFilters, setDebouncedFilters] = useState({ category: "", province: "" });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedFilters({ category, province }), 250);
    return () => window.clearTimeout(timer);
  }, [category, province]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedFilters.category) params.set("category", debouncedFilters.category);
    if (debouncedFilters.province) params.set("province", debouncedFilters.province);
    if (status) params.set("status", status);
    api(`/reports${params.toString() ? `?${params.toString()}` : ""}`)
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedFilters, status]);

  const enrichedReports = useMemo(() => {
    return reports
      .map((report) => {
        const reportLocation = { lat: report.location.lat, lng: report.location.lng };
        const km = userLocation ? distanceKm(userLocation, reportLocation) : null;
        return { ...report, risk: getRiskLevel(report), distanceKm: km };
      })
      .filter((report) => !status || report.risk === status)
      .filter((report) => !distance || (typeof report.distanceKm === "number" && report.distanceKm <= Number(distance)))
      .sort((a, b) => {
        if (userLocation) return (a.distanceKm || 0) - (b.distanceKm || 0);
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 500);
  }, [reports, status, distance, userLocation]);

  const selectedReport = enrichedReports.find((report) => report._id === searchParams.get("report"));
  const selectedLocation = selectedReport
    ? { lat: selectedReport.location.lat, lng: selectedReport.location.lng }
    : userLocation;

  function resetFilters() {
    setCategory("");
    setProvince("");
    setStatus("");
    setDistance("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-xl font-black text-text md:text-2xl lg:text-3xl">Carte des alertes</h1>
          <p className="text-sm font-medium text-slate-500 md:text-base">Comprendre les zones a risque et l'impact citoyen.</p>
        </div>
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("map")}
            className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold ${
              mode === "map" ? "bg-white text-primary shadow-sm" : "text-slate-600"
            }`}
          >
            <Map size={17} />
            Carte
          </button>
          <button
            type="button"
            onClick={() => setMode("list")}
            className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold ${
              mode === "list" ? "bg-white text-primary shadow-sm" : "text-slate-600"
            }`}
          >
            <List size={17} />
            Liste
          </button>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200/70 bg-white p-3 shadow-sm">
        <select value={province} onChange={(event) => setProvince(event.target.value)} className="form-field text-sm font-bold">
          <option value="">Toutes les provinces</option>
          {provinces.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
        <CategoryFilter value={category} onChange={setCategory} />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="form-field text-sm font-bold">
            <option value="">Tous les statuts</option>
            {Object.entries(riskLevels).map(([key, item]) => (
              (key === "danger" || key === "critique") && (
              <option value={key} key={key}>
                {item.label}
              </option>
              )
            ))}
          </select>
          <select
            value={distance}
            onChange={(event) => setDistance(event.target.value)}
            className="form-field text-sm font-bold"
            disabled={!userLocation}
          >
            {distanceOptions.map((item) => (
              <option value={item.value} key={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <Button type="button" variant="ghost" onClick={resetFilters}>
            <RotateCcw size={17} />
            Reset
          </Button>
        </div>
        {!userLocation && distance && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
            Localisez-vous d'abord pour filtrer par distance.
          </p>
        )}
        {locationError && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{locationError}</p>}
      </div>

      {selectedReport && (
        <p className="rounded-xl bg-green-50 p-3 text-sm font-bold text-primary">
          Carte centree sur: {selectedReport.title}
        </p>
      )}

      {loading && (
        <div className="h-[300px] animate-pulse rounded-xl bg-slate-100 md:h-[400px] lg:h-[500px]" />
      )}

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
          {enrichedReports.map((report) => (
            <ReportCard key={report._id} report={report} />
          ))}
        </div>
      )}

      {!loading && enrichedReports.length === 0 && (
        <p className="w-full rounded-xl border border-slate-200 bg-white p-8 text-center font-semibold text-slate-500 shadow-sm">
          Aucune alerte dans cette zone
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 text-xs font-black text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(riskLevels).filter(([key]) => key === "danger" || key === "critique").map(([key, item]) => (
          <div key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
