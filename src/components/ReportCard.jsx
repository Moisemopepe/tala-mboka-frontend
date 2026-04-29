import { Clock3, Eye, Heart, Image as ImageIcon, MapPin, Share2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api, assetUrl } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { categories } from "../utils/categories.js";
import { reporterRoleLabel } from "../utils/reporterRoles.js";
import { formatDistance, normalizeStatus } from "../utils/risk.js";
import Button from "./Button.jsx";
import Card from "./Card.jsx";
import StatusBadge from "./StatusBadge.jsx";

function relativeTime(dateValue) {
  const diff = Date.now() - new Date(dateValue).getTime();
  const minutes = Math.max(Math.floor(diff / 60000), 0);
  if (minutes < 1) return "à l’instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export default function ReportCard({ report, onLiked }) {
  const { isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const category = categories[report.category];
  const image = assetUrl(report.imageUrl || report.imageUrls?.[0] || "");
  const shareText = encodeURIComponent(`${report.title} - ${report.description}`);
  const shareUrl = `https://wa.me/?text=${shareText}`;
  const likesCount = report.likesCount ?? report.likes?.length ?? 0;
  const distance = formatDistance(report.distanceKm);
  const normalizedStatus = normalizeStatus(report.status);

  async function like() {
    if (!isAuthenticated) return;
    const data = await api(`/reports/${report._id}/like`, { method: "POST" });
    onLiked?.(report._id, data.likesCount);
  }

  return (
    <Card
      as="article"
      className="group h-full overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:border-green-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
    >
      <div className="relative h-[200px] overflow-hidden bg-slate-100">
        {image && !imageFailed ? (
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400">
            <ImageIcon size={30} />
            <p className="mt-2 text-sm font-semibold">Aucun visuel</p>
          </div>
        )}
        <div
          className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-semibold shadow-sm"
          style={{ color: category?.color }}
        >
          {category?.label}
        </div>
        {(normalizedStatus === "danger" || normalizedStatus === "critique") && (
          <div className="absolute right-3 top-3">
            <StatusBadge status={report.status} />
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <h2 className="font-heading text-[17px] font-semibold leading-snug text-text">{report.title}</h2>
        <p className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          Signalé comme {reporterRoleLabel(report.reporterRole).toLowerCase()}
        </p>

        <div>
          <p className={`text-sm leading-6 text-slate-600 ${expanded ? "" : "line-clamp-2"}`}>{report.description}</p>
          {report.description?.length > 120 && (
            <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-1 text-sm font-semibold text-primary">
              {expanded ? "Voir moins" : "Voir plus"}
            </button>
          )}
        </div>

        <div className="rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-600">
          <p className="flex items-center gap-1.5">
            <MapPin size={14} className="text-primary" />
            {report.province || "Province non renseignée"} / {report.commune || "Commune non renseignée"}
          </p>
          <p className="mt-1 text-slate-500">
            {report.location?.lat?.toFixed(4) || "-"}, {report.location?.lng?.toFixed(4) || "-"}
            {distance && <span className="ml-2 text-primary">- {distance}</span>}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock3 size={14} />
            {relativeTime(report.createdAt)}
          </span>
          {distance && <span>{distance}</span>}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-primary">
          <span>{likesCount} personne{likesCount > 1 ? "s" : ""} concernée{likesCount > 1 ? "s" : ""}</span>
        </div>

        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
          <Button type="button" variant="success" onClick={like} disabled={!isAuthenticated} className="active:scale-95">
            <Heart size={18} />
            Moi aussi ({likesCount})
          </Button>
          <Link
            to={`/feed?report=${report._id}`}
            className="flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95"
          >
            <Eye size={17} />
            <span className="ml-1 hidden sm:inline">Voir</span>
          </Link>
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95"
            aria-label="Partager sur WhatsApp"
          >
            <Share2 size={18} />
          </a>
        </div>
      </div>
    </Card>
  );
}
