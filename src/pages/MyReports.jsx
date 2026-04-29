import { CalendarDays, FileText, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { categories } from "../utils/categories.js";
import { reporterRoleLabel } from "../utils/reporterRoles.js";

export default function MyReports() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("tala_session_message", "Connectez-vous pour voir vos alertes.");
      navigate("/profile", { replace: true });
      return;
    }

    api("/reports/mine")
      .then((items) => {
        setReports(items);
        setError("");
      })
      .catch((err) => {
        if (err.status === 401) {
          localStorage.setItem("tala_session_message", "Votre session a expiré. Reconnectez-vous.");
          navigate("/profile", { replace: true });
          return;
        }
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-xl font-black text-text md:text-2xl lg:text-3xl">Mes alertes</h1>
          <p className="text-sm font-medium text-slate-500 md:text-base">Suivez le statut de vos signalements.</p>
        </div>
        <Link to="/report">
          <Button type="button" variant="success" className="w-full md:w-auto">
            <PlusCircle size={18} />
            Signaler
          </Button>
        </Link>
      </div>

      {loading && (
        <Card className="p-5">
          <p className="text-sm font-bold text-slate-600">Chargement de vos alertes...</p>
        </Card>
      )}

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}

      {!loading && !error && reports.length === 0 && (
        <Card className="p-6 text-center">
          <FileText className="mx-auto text-slate-400" size={28} />
          <p className="mt-3 font-heading text-lg font-black text-text">Aucune alerte disponible</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">Vos prochains signalements apparaîtront ici.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {reports.map((report) => (
          <Card key={report._id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase" style={{ color: categories[report.category]?.color }}>
                  {categories[report.category]?.label || report.category}
                </p>
                <h2 className="font-heading text-lg font-black leading-snug text-text">{report.title}</h2>
              </div>
              <StatusBadge status={report.status} />
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{report.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{reporterRoleLabel(report.reporterRole)}</span>
              <span>{report.province || "-"} / {report.commune || "-"}</span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={14} />
                {new Date(report.createdAt).toLocaleDateString()}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
