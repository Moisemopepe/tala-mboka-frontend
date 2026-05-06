import { LocateFixed, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import CategoryFilter from "../components/CategoryFilter.jsx";
import Button from "../components/Button.jsx";
import ReportCard from "../components/ReportCard.jsx";
import { crisisTypes, damageLevels } from "../utils/crisisOptions.js";
import { drcLocations, provinces } from "../utils/drcLocations.js";
import { distanceKm } from "../utils/risk.js";
import { sampleReports } from "../utils/sampleReports.js";

const initialVisibleReports = 12;

export default function Feed() {
  const [reports, setReports] = useState([]);
  const [sort, setSort] = useState("newest");
  const [infrastructureType, setInfrastructureType] = useState("");
  const [crisisType, setCrisisType] = useState("");
  const [damageLevel, setDamageLevel] = useState("");
  const [province, setProvince] = useState("");
  const [commune, setCommune] = useState("");
  const [nearby, setNearby] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(initialVisibleReports);

  useEffect(() => {
    setVisibleCount(initialVisibleReports);
    const params = new URLSearchParams();
    params.set("sort", sort);
    if (infrastructureType) params.set("infrastructureType", infrastructureType);
    if (crisisType) params.set("crisisType", crisisType);
    if (damageLevel) params.set("damageLevel", damageLevel);
    if (province) params.set("province", province);
    if (commune) params.set("commune", commune);
    if (nearby) {
      params.set("nearLat", nearby.lat);
      params.set("nearLng", nearby.lng);
    }

    let cancelled = false;
    setLoading(true);
    api(`/reports?${params.toString()}`)
      .then((items) => {
        if (!cancelled) setReports(items.length > 0 ? items : sampleReports);
      })
      .catch(() => {
        if (!cancelled) setReports(sampleReports);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sort, infrastructureType, crisisType, damageLevel, province, commune, nearby]);

  const visibleReports = useMemo(() => {
    return reports
      .map((report) => {
        const km = nearby && report.location ? distanceKm(nearby, { lat: report.location.lat, lng: report.location.lng }) : null;
        return { ...report, distanceKm: km };
      })
      .filter((report) => !infrastructureType || report.infrastructureType === infrastructureType || report.category === infrastructureType)
      .filter((report) => !crisisType || report.crisisType === crisisType)
      .filter((report) => !damageLevel || report.damageLevel === damageLevel)
      .sort((a, b) => {
        if (nearby) return (a.distanceKm || 0) - (b.distanceKm || 0);
        if (sort === "liked") return (b.likesCount || 0) - (a.likesCount || 0);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [reports, infrastructureType, crisisType, damageLevel, nearby, sort]);

  function updateLike(id, likesCount) {
    setReports((items) => items.map((item) => (item._id === id ? { ...item, likesCount } : item)));
  }

  function useLocation() {
    if (!navigator.geolocation) {
      setLocationError("Location is unavailable on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNearby({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationError("");
      },
      () => setLocationError("Unable to get your location.")
    );
  }

  return (
    <div className="w-full space-y-5 px-0 pb-10">
      <section className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-white via-blue-50/50 to-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">Live damage reports</p>
              <h1 className="mt-1 font-heading text-2xl font-semibold leading-tight text-text md:text-3xl">
                Crisis reports around you
              </h1>
              <p className="mt-1 text-sm text-slate-500 md:text-base">
                Track reported damage, verification status, and response priorities in real time.
              </p>
            </div>
            <Button type="button" variant="success" onClick={() => (window.location.href = "/app/report")} className="w-full md:w-auto">
              Report Damage
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200/70 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="form-field text-sm font-bold" aria-label="Sort reports">
            <option value="newest">Newest</option>
            <option value="liked">Most confirmed</option>
          </select>
          <Button
            type="button"
            onClick={nearby ? () => setNearby(null) : useLocation}
            variant="ghost"
            className={`w-full md:shrink-0 ${nearby ? "border-green-200 bg-green-50 text-green-700" : ""}`}
          >
            {nearby ? <X size={18} /> : <LocateFixed size={18} />}
            {nearby ? "Clear location" : "Near me"}
          </Button>
          <select value={damageLevel} onChange={(event) => setDamageLevel(event.target.value)} className="form-field text-sm font-bold" aria-label="Filter by damage level">
            <option value="">All damage levels</option>
            {Object.entries(damageLevels).map(([key, item]) => (
              <option value={key} key={key}>{item.label}</option>
            ))}
          </select>
        </div>

        {nearby && <p className="rounded-xl bg-green-50 p-3 text-sm font-bold text-primary">Distance filter active: nearby reports appear first.</p>}
        {locationError && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{locationError}</p>}

        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <select value={crisisType} onChange={(event) => setCrisisType(event.target.value)} className="form-field text-sm font-bold" aria-label="Filter by crisis type">
            <option value="">All crisis types</option>
            {Object.entries(crisisTypes).map(([key, label]) => (
              <option value={key} key={key}>{label}</option>
            ))}
          </select>
          <select
            value={province}
            onChange={(event) => {
              setProvince(event.target.value);
              setCommune("");
            }}
            className="form-field text-sm font-bold"
            aria-label="Filter by region"
          >
            <option value="">All regions</option>
            {provinces.map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </select>
          <select value={commune} onChange={(event) => setCommune(event.target.value)} disabled={!province} className="form-field text-sm font-bold disabled:bg-slate-100 disabled:text-slate-400" aria-label="Filter by local area">
            <option value="">All local areas</option>
            {(drcLocations[province] || []).map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </select>
        </div>
        <CategoryFilter value={infrastructureType} onChange={setInfrastructureType} />
      </section>

      {loading && reports.length === 0 && <SkeletonList />}

      {!loading && visibleReports.length > 0 ? (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-4 sm:gap-5">
            {visibleReports.slice(0, visibleCount).map((report) => (
              <ReportCard key={report._id} report={report} onLiked={updateLike} />
            ))}
          </div>
          {visibleCount < visibleReports.length && (
            <div className="flex justify-center pb-8 pt-2">
              <Button type="button" variant="ghost" onClick={() => setVisibleCount((count) => count + initialVisibleReports)}>
                Show more
              </Button>
            </div>
          )}
        </>
      ) : (
        !loading && (
          <div className="w-full rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-text">No reports found</p>
            <p className="mt-2 text-sm text-slate-500">Adjust filters or report new damage.</p>
            <Button type="button" variant="success" className="mt-4 hidden sm:inline-flex" onClick={() => (window.location.href = "/app/report")}>
              Report Damage
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
        <div key={item} className="h-[320px] animate-pulse rounded-xl border border-slate-200 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 shadow-sm" />
      ))}
    </div>
  );
}
