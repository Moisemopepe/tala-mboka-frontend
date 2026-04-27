import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import CategoryFilter from "../components/CategoryFilter.jsx";
import ReportMap from "../components/ReportMap.jsx";
import { provinces } from "../utils/drcLocations.js";

export default function Home() {
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (province) params.set("province", province);
    api(`/reports${params.toString() ? `?${params.toString()}` : ""}`).then(setReports).catch(console.error);
  }, [category, province]);

  const selectedReport = reports.find((report) => report._id === searchParams.get("report"));
  const selectedLocation = selectedReport
    ? { lat: selectedReport.location.lat, lng: selectedReport.location.lng }
    : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-black text-text">Carte des alertes</h1>
        <p className="text-sm font-medium text-slate-500">Signaler pour changer</p>
      </div>
      <select value={province} onChange={(event) => setProvince(event.target.value)} className="form-field text-sm font-bold">
        <option value="">Toutes les provinces</option>
        {provinces.map((item) => (
          <option value={item} key={item}>
            {item}
          </option>
        ))}
      </select>
      <CategoryFilter value={category} onChange={setCategory} />
      {selectedReport && (
        <p className="rounded-xl bg-blue-50 p-3 text-sm font-bold text-primary">
          Carte centree sur: {selectedReport.title}
        </p>
      )}
      <ReportMap reports={reports} height="calc(100vh - 220px)" pickedLocation={selectedLocation} />
      {reports.length === 0 && (
        <p className="rounded-2xl border border-slate-100 bg-white p-4 text-center text-sm font-bold text-slate-500 shadow-soft">
          Aucune alerte disponible
        </p>
      )}
    </div>
  );
}
