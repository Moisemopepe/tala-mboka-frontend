import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import CategoryFilter from "../components/CategoryFilter.jsx";
import ReportMap from "../components/ReportMap.jsx";
import { provinces } from "../utils/drcLocations.js";

export default function Home() {
  const [reports, setReports] = useState([]);
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (province) params.set("province", province);
    api(`/reports${params.toString() ? `?${params.toString()}` : ""}`).then(setReports).catch(console.error);
  }, [category, province]);

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
      <ReportMap reports={reports} height="calc(100vh - 220px)" />
    </div>
  );
}
