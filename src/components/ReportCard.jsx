import { Heart, MapPin, Share2 } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { categories, statuses } from "../utils/categories.js";
import Button from "./Button.jsx";
import Card from "./Card.jsx";

export default function ReportCard({ report, onLiked }) {
  const { isAuthenticated } = useAuth();
  const category = categories[report.category];
  const shareText = encodeURIComponent(`${report.title} - ${report.description}`);
  const shareUrl = `https://wa.me/?text=${shareText}`;

  async function like() {
    if (!isAuthenticated) return;
    const data = await api(`/reports/${report._id}/like`, { method: "POST" });
    onLiked?.(report._id, data.likesCount);
  }

  return (
    <Card as="article" className="overflow-hidden">
      {report.imageUrl && <img src={report.imageUrl} alt="" className="h-44 w-full object-cover sm:h-52" loading="lazy" />}
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wide" style={{ color: category?.color }}>
              {category?.label}
            </p>
            <h2 className="font-heading text-lg font-black leading-snug text-text">{report.title}</h2>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
            {statuses[report.status] || report.status}
          </span>
        </div>
        <p className="text-sm leading-6 text-slate-600">{report.description}</p>
        <p className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={14} />
          {report.province || "Province non renseignee"} / {report.commune || "Commune non renseignee"} ·{" "}
          {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="success"
            onClick={like}
            disabled={!isAuthenticated}
            className="flex-1"
          >
            <Heart size={18} />
            Moi aussi ({report.likesCount ?? report.likes?.length ?? 0})
          </Button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:text-primary"
            aria-label="Partager sur WhatsApp"
          >
            <Share2 size={18} />
          </a>
        </div>
      </div>
    </Card>
  );
}
