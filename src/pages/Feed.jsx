import { LocateFixed, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import CategoryFilter from "../components/CategoryFilter.jsx";
import Button from "../components/Button.jsx";
import ReportCard from "../components/ReportCard.jsx";
import { drcLocations, provinces } from "../utils/drcLocations.js";

export default function Feed() {
  const [reports, setReports] = useState([]);
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");
  const [commune, setCommune] = useState("");
  const [nearby, setNearby] = useState(null);
  const [notice, setNotice] = useState("");
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("sort", sort);
    if (category) params.set("category", category);
    if (province) params.set("province", province);
    if (commune) params.set("commune", commune);
    if (nearby) {
      params.set("nearLat", nearby.lat);
      params.set("nearLng", nearby.lng);
    }
    api(`/reports?${params.toString()}`)
      .then((items) => {
        const previous = JSON.parse(localStorage.getItem("tala_report_statuses") || "{}");
        const current = {};
        const changed = items.find((item) => previous[item._id] && previous[item._id] !== item.status);

        items.forEach((item) => {
          current[item._id] = item.status;
        });

        if (changed) {
          setNotice(`Mise a jour: "${changed.title}" est maintenant ${changed.status}.`);
        }

        localStorage.setItem("tala_report_statuses", JSON.stringify(current));
        setReports(items);
      })
      .catch(console.error);
  }, [sort, category, province, commune, nearby]);

  function updateLike(id, likesCount) {
    setReports((items) => items.map((item) => (item._id === id ? { ...item, likesCount } : item)));
  }

  function useLocation() {
    if (!navigator.geolocation) {
      setLocationError("Localisation indisponible sur cet appareil.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNearby({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationError("");
      },
      () => setLocationError("Impossible de recuperer votre position.")
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-black text-text">Fil citoyen</h1>
        <p className="text-sm font-medium text-slate-500">Les problemes recents autour de vous</p>
      </div>
      {notice && (
        <button
          type="button"
          onClick={() => setNotice("")}
          className="w-full rounded-md bg-emerald-50 p-3 text-left text-sm font-semibold text-emerald-800"
        >
          {notice}
        </button>
      )}
      <div className="flex gap-2">
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="form-field flex-1 text-sm font-bold"
        >
          <option value="newest">Plus recents</option>
          <option value="liked">Plus soutenus</option>
        </select>
        <Button
          type="button"
          onClick={nearby ? () => setNearby(null) : useLocation}
          variant="ghost"
          className={`shrink-0 ${nearby ? "border-primary bg-blue-50 text-primary" : ""}`}
        >
          {nearby ? <X size={18} /> : <LocateFixed size={18} />}
          {nearby ? "Reset" : "Proche"}
        </Button>
      </div>
      {nearby && (
        <p className="rounded-xl bg-blue-50 p-3 text-sm font-bold text-primary">
          Filtre distance actif: alertes proches de vous en premier.
        </p>
      )}
      {locationError && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{locationError}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        <select
          value={province}
          onChange={(event) => {
            setProvince(event.target.value);
            setCommune("");
          }}
          className="form-field text-sm font-bold"
        >
          <option value="">Toutes les provinces</option>
          {provinces.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={commune}
          onChange={(event) => setCommune(event.target.value)}
          disabled={!province}
          className="form-field text-sm font-bold disabled:bg-slate-100 disabled:text-slate-400"
        >
          <option value="">Toutes les communes</option>
          {(drcLocations[province] || []).map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <CategoryFilter value={category} onChange={setCategory} />
      <div className="space-y-4">
        {reports.map((report) => (
          <ReportCard key={report._id} report={report} onLiked={updateLike} />
        ))}
        {reports.length === 0 && (
          <p className="rounded-2xl border border-slate-100 bg-white p-6 text-center font-semibold text-slate-500 shadow-soft">
            Aucune alerte disponible
          </p>
        )}
      </div>
    </div>
  );
}
