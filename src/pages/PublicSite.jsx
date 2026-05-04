import { ArrowRight, CheckCircle2, Database, Globe2, MapPinned, ShieldCheck, Smartphone, WifiOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import Logo from "../components/Logo.jsx";
import { categories } from "../utils/categories.js";
import { damageLevels } from "../utils/crisisOptions.js";
import { sampleReports } from "../utils/sampleReports.js";

const capabilities = [
  { icon: Smartphone, title: "Community capture", text: "Photo, description, crisis type, damage class, and GPS from mobile devices." },
  { icon: MapPinned, title: "Live crisis map", text: "Reports appear on an interactive map with infrastructure and damage filters." },
  { icon: Database, title: "Structured exports", text: "CSV and GeoJSON-ready records for integration with GIS and response systems." },
  { icon: WifiOff, title: "Low-connectivity roadmap", text: "Designed around upload-now, send-later workflows for field conditions." },
  { icon: Globe2, title: "International by design", text: "Built to move beyond one country, with configurable geography and language." },
  { icon: ShieldCheck, title: "Moderated data", text: "Admin validation reduces noise before data feeds operational dashboards." }
];

function AppPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-3 shadow-2xl">
        <div className="overflow-hidden rounded-[1.45rem] bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
            <Logo compact />
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">Live</span>
          </div>
          <div className="relative h-72 bg-[#e8f3f1]">
            <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(90deg,rgba(15,118,110,.12)_1px,transparent_1px),linear-gradient(rgba(15,118,110,.12)_1px,transparent_1px)] [background-size:42px_42px]" />
            <span className="absolute left-14 top-20 h-4 w-4 rounded-full border-4 border-white bg-red-600 shadow-lg" />
            <span className="absolute right-20 top-28 h-4 w-4 rounded-full border-4 border-white bg-orange-500 shadow-lg" />
            <span className="absolute bottom-16 left-28 h-4 w-4 rounded-full border-4 border-white bg-green-600 shadow-lg" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 p-4 shadow-soft backdrop-blur">
              <p className="text-xs font-black uppercase text-green-700">Community report</p>
              <h3 className="mt-1 font-heading text-lg font-black text-slate-950">Bridge partially damaged</h3>
              <p className="mt-1 text-sm font-semibold text-slate-600">Flood impact - geolocated - export ready</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 bg-white p-4 text-center">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-heading text-xl font-black text-primary">Field</p>
              <p className="mt-1 text-[11px] font-bold leading-4 text-slate-500">capture</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-heading text-xl font-black text-primary">GeoJSON</p>
              <p className="mt-1 text-[11px] font-bold leading-4 text-slate-500">export</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-heading text-xl font-black text-primary">Map</p>
              <p className="mt-1 text-[11px] font-bold leading-4 text-slate-500">dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicSite() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api("/reports?sort=newest").then((items) => setReports(items.slice(0, 3))).catch(() => setReports([]));
  }, []);

  const visibleReports = useMemo(() => (reports.length > 0 ? reports : sampleReports), [reports]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Tala Crisis Map" className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Logo compact />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex">
            <a href="#workflow" className="hover:text-primary">Workflow</a>
            <a href="#reports" className="hover:text-primary">Reports</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button as={Link} to="/app/map" variant="ghost" size="sm">Open map</Button>
            <Button as={Link} to="/app/report" variant="success" size="sm" className="hidden sm:inline-flex">Submit report</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_0.9fr] lg:px-8 lg:py-12">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">Tala Mboka Crisis</p>
            <h1 className="mt-4 max-w-3xl font-heading text-4xl font-black leading-tight text-[#062653] sm:text-5xl lg:text-6xl">
              Community-powered crisis mapping for rapid response.
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-600">
              Tala Mboka Crisis helps communities report damage after floods, earthquakes, conflict, fires, explosions, and chemical incidents with photo evidence, location, verification, and export-ready data.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/app/report" variant="success" size="lg">
                Report Damage
                <ArrowRight size={18} />
              </Button>
              <Button as={Link} to="/app/map" variant="ghost" size="lg">View Crisis Map</Button>
              <Button as={Link} to="/admin" variant="ghost" size="lg">Admin Dashboard</Button>
            </div>
          </div>
          <AppPreview />
        </section>

        <section id="workflow" className="bg-slate-50 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="font-heading text-3xl font-black text-text">Built for real crisis response workflows</h2>
              <p className="mt-3 font-semibold leading-7 text-slate-600">
                The app supports the full field journey: capture a photo, classify damage, geolocate infrastructure, store reports, verify them, visualize them, and export structured data.
              </p>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {["Capture", "Map", "Export"].map((title, index) => (
                <article key={title} className="rounded-xl bg-white p-5 shadow-soft">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 font-black text-primary">{index + 1}</span>
                  <h3 className="mt-4 font-heading text-xl font-black text-text">{title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    {index === 0 && "Community members upload photo evidence, description, infrastructure type, crisis type, and damage level."}
                    {index === 1 && "Reports are moderated and displayed on a live map for rapid assessment and intervention triage."}
                    {index === 2 && "Response teams can work with structured records through dashboard CSV and GeoJSON outputs."}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-xl border border-slate-100 bg-white p-5 shadow-soft">
                <Icon className="text-primary" size={24} />
                <h3 className="mt-4 font-heading text-lg font-black text-text">{title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="reports" className="bg-slate-50 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-heading text-3xl font-black text-text">Recent mapped reports</h2>
                <p className="mt-2 font-semibold text-slate-600">Sample and live records shown in the crisis mapping format.</p>
              </div>
              <Button as={Link} to="/app/map" variant="ghost">View all reports</Button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {visibleReports.map((report) => {
                const category = categories[report.infrastructureType || report.category] || categories[report.category];
                const damage = damageLevels[report.damageLevel] || damageLevels.partial;
                return (
                  <article key={report._id} className="rounded-xl bg-white p-5 shadow-soft">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase" style={{ color: category?.color }}>{category?.label || report.category}</p>
                      <span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ background: damage.color }}>{damage.shortLabel}</span>
                    </div>
                    <h3 className="mt-3 line-clamp-2 font-heading text-lg font-black text-text">{report.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">{report.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500">
                      <MapPinned size={14} />
                      <span>{report.province || "Region"} / {report.commune || "Area"}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-green-50 py-10">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <CheckCircle2 className="mx-auto text-primary" size={34} />
            <h2 className="mt-4 font-heading text-3xl font-black text-text">Ready for field use and response coordination</h2>
            <p className="mt-3 font-semibold leading-7 text-slate-600">
              The platform is structured for rapid reporting, verification, mapping, and open data export.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
