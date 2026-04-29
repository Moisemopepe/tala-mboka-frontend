import { LocateFixed, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import CategoryFilter from "../components/CategoryFilter.jsx";
import Button from "../components/Button.jsx";
import ReportCard from "../components/ReportCard.jsx";
import { statuses } from "../utils/categories.js";
import { drcLocations, provinces } from "../utils/drcLocations.js";
import { riskLevels } from "../utils/risk.js";

const initialVisibleReports = 12;
const feedCachePrefix = "tala_feed_cache:";
const feedCacheMaxAge = 1000 * 60 * 3;

function readFeedCache(key) {
  try {
    const cached = JSON.parse(localStorage.getItem(key) || "null");
    if (!cached?.items || Date.now() - cached.savedAt > feedCacheMaxAge) return null;
    return cached.items;
  } catch {
    return null;
  }
}

function writeFeedCache(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), items }));
  } catch {
    // Cache is only a UX improvement. If storage is full, the app still works.
  }
}

export default function Feed() {
  const [reports, setReports] = useState([]);
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [province, setProvince] = useState("");
  const [commune, setCommune] = useState("");
  const [nearby, setNearby] = useState(null);
  const [notice, setNotice] = useState("");
  const [locationError, setLocationError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(initialVisibleReports);

  useEffect(() => {
    setVisibleCount(initialVisibleReports);
    const params = new URLSearchParams();
    params.set("sort", sort);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    if (province) params.set("province", province);
    if (commune) params.set("commune", commune);
    if (nearby) {
      params.set("nearLat", nearby.lat);
      params.set("nearLng", nearby.lng);
    }
    const query = params.toString();
    const cacheKey = `${feedCachePrefix}${query}`;
    const cachedItems = readFeedCache(cacheKey);
    let cancelled = false;

    if (cachedItems) {
      setReports(cachedItems);
      setLoading(false);
      setRefreshing(true);
    } else {
      setLoading(true);
      setRefreshing(false);
    }

    api(`/reports?${query}`)
      .then((items) => {
        if (cancelled) return;
        const previous = JSON.parse(localStorage.getItem("tala_report_statuses") || "{}");
        const current = {};
        const changed = items.find((item) => previous[item._id] && previous[item._id] !== item.status);

        items.forEach((item) => {
          current[item._id] = item.status;
        });

        if (changed) {
          setNotice(`Mise à jour : « ${changed.title} » est maintenant ${statuses[changed.status] || changed.status}.`);
        }

        localStorage.setItem("tala_report_statuses", JSON.stringify(current));
        writeFeedCache(cacheKey, items);
        setReports(items);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sort, category, status, province, commune, nearby]);

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
      () => setLocationError("Impossible de récupérer votre position.")
    );
  }

  return (
    <div className="w-full space-y-5 px-0 pb-10">
      <section className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-white via-green-50/40 to-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">Fil citoyen</p>
              <h1 className="mt-1 font-heading text-2xl font-semibold leading-tight text-text md:text-3xl">
                Alertes autour de vous
              </h1>
              <p className="mt-1 text-sm text-slate-500 md:text-base">Suivez les problèmes signalés en temps réel.</p>
            </div>
            <Button type="button" variant="success" onClick={() => (window.location.href = "/report")} className="w-full md:w-auto">
              Signaler un problème
            </Button>
          </div>
        </div>
      </section>
      {notice && (
        <button
          type="button"
          onClick={() => setNotice("")}
          className="w-full rounded-md bg-emerald-50 p-3 text-left text-sm font-semibold text-emerald-800"
        >
          {notice}
        </button>
      )}
      <section className="space-y-3 rounded-xl border border-slate-200/70 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row">
        <select
          aria-label="Trier les alertes"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="form-field w-full flex-1 text-sm font-bold"
        >
          <option value="newest">Plus récents</option>
          <option value="liked">Plus soutenus</option>
        </select>
        <Button
          type="button"
          onClick={nearby ? () => setNearby(null) : useLocation}
          variant="ghost"
          className={`w-full md:w-auto md:shrink-0 ${nearby ? "border-green-200 bg-green-50 text-green-700" : ""}`}
        >
          {nearby ? <X size={18} /> : <LocateFixed size={18} />}
          {nearby ? "Retirer" : "Autour de moi"}
        </Button>
      </div>
      {nearby && (
        <p className="rounded-xl bg-green-50 p-3 text-sm font-bold text-primary">
          Filtre distance actif : les alertes proches de vous apparaissent en premier.
        </p>
      )}
      {refreshing && (
        <p className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">
          Mise à jour du fil en arrière-plan...
        </p>
      )}
      {locationError && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{locationError}</p>}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <select
          aria-label="Filtrer par province"
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
          aria-label="Filtrer par commune"
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
      <select aria-label="Filtrer par statut" value={status} onChange={(event) => setStatus(event.target.value)} className="form-field text-sm font-bold">
        <option value="">Tous les statuts</option>
        {Object.entries(riskLevels)
          .filter(([key]) => key === "danger" || key === "critique")
          .map(([key, item]) => (
            <option value={key} key={key}>
              {item.label}
            </option>
          ))}
      </select>
      </section>
      {loading && reports.length === 0 && <SkeletonList />}

      {!loading && reports.length > 0 ? (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-4 sm:gap-5">
            {reports.slice(0, visibleCount).map((report) => (
              <ReportCard key={report._id} report={report} onLiked={updateLike} />
            ))}
          </div>
          {visibleCount < reports.length && (
            <div className="flex justify-center pb-8 pt-2">
              <Button type="button" variant="ghost" onClick={() => setVisibleCount((count) => count + initialVisibleReports)}>
                Afficher plus
              </Button>
            </div>
          )}
        </>
      ) : (
        !loading && (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-text">Aucune alerte pour le moment</p>
          <p className="mt-2 text-sm text-slate-500">Soyez le premier à signaler.</p>
          <Button type="button" variant="success" className="mt-4" onClick={() => (window.location.href = "/report")}>
            Créer une alerte
          </Button>
        </div>
        )
      )}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-4 sm:gap-5">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="h-[320px] animate-pulse rounded-xl border border-slate-200 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 shadow-sm"
        />
      ))}
    </div>
  );
}
