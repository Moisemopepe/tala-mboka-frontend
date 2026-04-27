import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import CategoryFilter from "../components/CategoryFilter.jsx";
import ReportMap from "../components/ReportMap.jsx";

export default function Home() {
  const [reports, setReports] = useState([]);
  const [category, setCategory] = useState("");

  useEffect(() => {
    api(`/reports${category ? `?category=${category}` : ""}`).then(setReports).catch(console.error);
  }, [category]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-black text-text">Carte des alertes</h1>
        <p className="text-sm font-medium text-slate-500">Signaler pour changer</p>
      </div>
      <CategoryFilter value={category} onChange={setCategory} />
      <ReportMap reports={reports} height="calc(100vh - 220px)" />
    </div>
  );
}
