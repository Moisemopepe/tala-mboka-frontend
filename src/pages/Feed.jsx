import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  Flame,
  ListFilter,
  Map,
  MapPin,
  PlusCircle,
  ShieldCheck,
  Waves,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import ReportMap from "../components/ReportMap.jsx";
import { categories } from "../utils/categories.js";
import { crisisTypes, damageLevels } from "../utils/crisisOptions.js";
import { sampleReports } from "../utils/sampleReports.js";

const typeCards = [
  { key: "flood", label: "Flood", icon: Waves, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "earthquake", label: "Earthquake", icon: Zap, color: "text-red-600", bg: "bg-red-50" },
  { key: "fire", label: "Fire", icon: Flame, color: "text-orange-600", bg: "bg-orange-50" },
  { key: "conflict", label: "Conflict", icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50" },
  { key: "explosion", label: "Explosion", icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50" },
  { key: "other", label: "Other", icon: ListFilter, color: "text-slate-600", bg: "bg-slate-50" }
];

export default function Feed() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api("/reports?sort=newest")
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
  }, []);

  const visibleReports = useMemo(
    () => reports.filter((report) => report.location && report.status !== "rejected"),
    [reports]
  );
  const publicReports = useMemo(() => {
    const verified = visibleReports.filter((report) => report.status === "verified");
    return verified.length ? verified : visibleReports;
  }, [visibleReports]);
  const criticalReports = useMemo(
    () => publicReports.filter((report) => report.damageLevel === "complete").slice(0, 3),
    [publicReports]
  );
  const recentReports = publicReports.slice(0, 5);
  const stats = useMemo(() => {
    const total = publicReports.length;
    return [
      { label: "Public reports", value: total, note: "Anonymized community reports", icon: FileText, tone: "blue" },
      {
        label: "Severe damage",
        value: publicReports.filter((report) => report.damageLevel === "complete").length,
        note: "Verified public alerts",
        icon: AlertTriangle,
        tone: "red"
      },
      {
        label: "Verified reports",
        value: publicReports.filter((report) => report.status === "verified").length,
        note: "Published after review",
        icon: CheckCircle2,
        tone: "green"
      },
      {
        label: "Recent updates",
        value: publicReports.length,
        note: "Community map activity",
        icon: Clock3,
        tone: "purple"
      }
    ];
  }, [publicReports]);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-8">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.05fr)]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
            <div>
              <h1 className="font-heading text-3xl font-black leading-tight text-[#071b4d] sm:text-4xl">
                Community crisis map
              </h1>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-600 sm:text-base">
                View verified community reports and submit damage information from the field.
              </p>
            </div>
            <Button as={Link} to="/app/report" variant="success" className="w-full md:w-auto">
              <PlusCircle size={18} />
              Report incident
            </Button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button as={Link} to="/app/map" variant="success" className="w-full sm:w-auto">
              <Map size={18} />
              Open live map
            </Button>
            <a
              href="#reports"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
            >
              <FileText size={18} />
              View reports
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <StatCard key={item.label} {...item} />
            ))}
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50/70 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-heading text-lg font-black text-[#071b4d]">
                <AlertTriangle size={20} className="text-red-600" />
                Public alerts
              </h2>
              <a href="#reports" className="text-sm font-bold text-blue-700 hover:text-blue-900">View all</a>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {(criticalReports.length ? criticalReports : sampleReports.slice(0, 3)).map((report) => (
                <AlertCard key={report._id} report={report} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-green-700 px-4 py-2 text-xs font-black text-white">All</span>
              <LegendPill color="#dc2626" label="Critical" />
              <LegendPill color="#f97316" label="Partial" />
              <LegendPill color="#16a34a" label="Verified" />
            </div>
            <Link to="/app/map" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <ListFilter size={17} />
              Filters
            </Link>
          </div>
          <ReportMap reports={publicReports.length ? publicReports : sampleReports.filter((report) => report.status === "verified")} analytics height="min(540px, 62vh)" />
          <div className="grid gap-2 rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-600 sm:grid-cols-3">
            <p className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-600" /> Minimal</p>
            <p className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-orange-500" /> Partial</p>
            <p className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-600" /> Complete</p>
          </div>
        </div>
      </section>

      <section id="reports" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-black text-[#071b4d]">Recent reports</h2>
            <Link to="/app/map" className="text-sm font-bold text-blue-700 hover:text-blue-900">Open map</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading && visibleReports.length === 0 ? (
              <ReportRowsSkeleton />
            ) : (
              recentReports.map((report) => <RecentReportRow key={report._id} report={report} />)
            )}
          </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.55fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-black text-[#071b4d]">Explore by incident type</h2>
            <Link to="/app/map" className="text-sm font-bold text-blue-700 hover:text-blue-900">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {typeCards.map(({ key, label, icon: Icon, color, bg }) => (
              <Link key={key} to={`/app/map?crisisType=${key}`} className="rounded-xl border border-slate-200 p-4 text-center transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-sm">
                <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={color} size={25} />
                </span>
                <span className="mt-3 block text-sm font-black text-[#071b4d]">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-green-100 bg-gradient-to-r from-green-50 via-white to-blue-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Building2 className="text-green-700" size={30} />
            </div>
            <div className="min-w-0">
              <h2 className="font-heading text-xl font-black text-[#071b4d]">See something? Report it in seconds.</h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                Works offline. No account required for community submissions.
              </p>
            </div>
          </div>
          <Button as={Link} to="/app/report" variant="success" className="mt-4 w-full sm:w-auto">
            <PlusCircle size={18} />
            Report an incident
          </Button>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, note, icon: Icon, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700"
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone]}`}>
        <Icon size={24} />
      </div>
      <p className="text-2xl font-black text-[#071b4d]">{value}</p>
      <p className="text-sm font-bold text-slate-700">{label}</p>
      <p className="mt-2 border-t border-slate-100 pt-2 text-xs font-semibold text-slate-500">{note}</p>
    </div>
  );
}

function LegendPill({ color, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700">
      <span className="h-3 w-3 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function AlertCard({ report }) {
  const damage = damageLevels[report.damageLevel] || damageLevels.partial;
  return (
    <article className="grid grid-cols-[74px_minmax(0,1fr)] gap-3 rounded-xl border border-red-100 bg-white p-2">
      <div className="flex h-20 items-center justify-center rounded-lg bg-slate-100">
        <AlertTriangle className="text-red-600" size={26} />
      </div>
      <div className="min-w-0 py-1">
        <span className="rounded-md bg-red-100 px-2 py-1 text-[10px] font-black uppercase text-red-700">{damage.shortLabel}</span>
        <h3 className="mt-2 truncate font-heading text-sm font-black text-[#071b4d]">{report.title}</h3>
        <p className="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-slate-500">
          <MapPin size={13} />
          {report.commune || report.province || "Mapped location"}
        </p>
      </div>
    </article>
  );
}

function RecentReportRow({ report }) {
  const category = categories[report.infrastructureType || report.category] || categories.other;
  const damage = damageLevels[report.damageLevel] || damageLevels.partial;
  const statusLabel = report.status === "verified" ? "Verified" : report.status === "rejected" ? "Rejected" : "Pending";

  return (
    <article className="grid gap-3 py-3 sm:grid-cols-[56px_minmax(0,1fr)_auto_auto] sm:items-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${category.color}14`, color: category.color }}>
        <Building2 size={23} />
      </div>
      <div className="min-w-0">
        <h3 className="truncate font-heading text-base font-black text-[#071b4d]">{report.title}</h3>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1"><MapPin size={13} />{report.commune || report.province || "Mapped location"}</span>
          <span className="rounded-md bg-slate-100 px-2 py-1">{crisisTypes[report.crisisType] || "Other crisis"}</span>
          <span className="rounded-md px-2 py-1 text-white" style={{ background: damage.color }}>{damage.shortLabel}</span>
        </p>
      </div>
      <span className={`w-fit rounded-md px-3 py-1 text-xs font-black uppercase ${
        report.status === "verified" ? "bg-green-50 text-green-700" : report.status === "rejected" ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"
      }`}>
        {statusLabel}
      </span>
      <Link to="/app/map" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-bold text-[#071b4d] hover:bg-slate-50">
        View
      </Link>
    </article>
  );
}

function ReportRowsSkeleton() {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <div key={item} className="my-3 h-20 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </>
  );
}
