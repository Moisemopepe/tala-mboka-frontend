import { Clock3, Heart, Image as ImageIcon, MapPinned, MapPin, Share2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { categories } from "../utils/categories.js";
import Button from "./Button.jsx";
import Card from "./Card.jsx";
import StatusBadge from "./StatusBadge.jsx";

function relativeTime(dateValue) {
  const diff = Date.now() - new Date(dateValue).getTime();
  const minutes = Math.max(Math.floor(diff / 60000), 0);
  if (minutes < 1) return "a l'instant";
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

function distanceLabel(distance) {
  if (typeof distance !== "number") return "";
  const km = distance * 111;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

export default function ReportCard({ report, onLiked }) {
  const { isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const category = categories[report.category];
  const image = report.imageUrl || report.imageUrls?.[0] || "";
  const shareText = encodeURIComponent(`${report.title} - ${report.description}`);
  const shareUrl = `https://wa.me/?text=${shareText}`;
  const likesCount = report.likesCount ?? report.likes?.length ?? 0;
  const distance = distanceLabel(report.distance);

  async function like() {
    if (!isAuthenticated) return;
    const data = await api(`/reports/${report._id}/like`, { method: "POST" });
    onLiked?.(report._id, data.likesCount);
  }

  return (
    <Card
      as="article"
      className="group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
    >
      <div className="relative h-44 overflow-hidden bg-slate-100 sm:h-52">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 text-slate-400">
            <ImageIcon size={34} />
            <p className="mt-2 text-xs font-black uppercase">Aucune image</p>
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-black uppercase shadow-sm" style={{ color: category?.color }}>
          {category?.label}
        </div>
        <div className="absolute right-3 top-3">
          <StatusBadge status={report.status} />
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-heading text-lg font-black leading-snug text-text">{report.title}</h2>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-black text-slate-500">
            <Clock3 size={13} />
            {relativeTime(report.createdAt)}
          </span>
        </div>

        <div>
          <p className={`text-sm leading-6 text-slate-600 ${expanded ? "" : "line-clamp-2"}`}>{report.description}</p>
          {report.description?.length > 120 && (
            <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-1 text-sm font-black text-primary">
              {expanded ? "Voir moins" : "Voir plus"}
            </button>
          )}
        </div>

        <div className="rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-600">
          <p className="flex items-center gap-1.5">
            <MapPin size={14} className="text-primary" />
            {report.province || "Province non renseignee"} / {report.commune || "Commune non renseignee"}
          </p>
          <p className="mt-1 text-slate-500">
            {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
            {distance && <span className="ml-2 text-primary">• {distance}</span>}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm font-black text-success">
          <span>{likesCount} personne{likesCount > 1 ? "s" : ""} concernee{likesCount > 1 ? "s" : ""}</span>
          {distance && <span>{distance}</span>}
        </div>

        <div className="grid grid-cols-[1fr_44px_44px] gap-2">
          <Button type="button" variant="success" onClick={like} disabled={!isAuthenticated} className="active:scale-95">
            <Heart size={18} />
            Moi aussi
          </Button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-primary/40 hover:bg-blue-50 hover:text-primary active:scale-95"
            aria-label="Partager sur WhatsApp"
          >
            <Share2 size={18} />
          </a>
          <Link
            to={`/feed?report=${report._id}`}
            className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-primary/40 hover:bg-blue-50 hover:text-primary active:scale-95"
            aria-label="Voir sur la carte"
          >
            <MapPinned size={18} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
