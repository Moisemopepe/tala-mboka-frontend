import { AlertTriangle, ArrowRight, Building2, CheckCircle2, CirclePlus, Clock3, FileText, Flame, Globe2, HeartPulse, Map, MapPin, Menu, Navigation, Radio, ShieldCheck, Users, Waves, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import Logo from "../components/Logo.jsx";
import { sampleReports } from "../utils/sampleReports.js";

const incidentImages = [
  "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=75"
];

const impactStats = [
  { label: "Reports submitted", value: "2,847", change: "+12%", icon: FileText, color: "text-green-700", bg: "bg-green-50" },
  { label: "Critical incidents", value: "312", change: "+8%", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { label: "Communities involved", value: "1,248", change: "+15%", icon: Users, color: "text-orange-500", bg: "bg-orange-50" },
  { label: "Verified reports", value: "1,985", change: "+10%", icon: ShieldCheck, color: "text-violet-600", bg: "bg-violet-50" }
];

const typeFilters = [
  { label: "Flood", icon: Waves, color: "text-blue-500" },
  { label: "Earthquake", icon: Zap, color: "text-red-500" },
  { label: "Fire", icon: Flame, color: "text-orange-500" },
  { label: "Storm", icon: Radio, color: "text-violet-500" },
  { label: "Landslide", icon: Navigation, color: "text-amber-700" },
  { label: "Building damage", icon: Building2, color: "text-blue-600" },
  { label: "Road damage", icon: MapPin, color: "text-slate-500" },
  { label: "Other", icon: Menu, color: "text-slate-500" }
];

function severityFor(report, index) {
  if (report.status === "verified") return { label: "VERIFIED", className: "bg-green-600" };
  if (report.damageLevel === "complete") return { label: "CRITICAL", className: "bg-red-600" };
  if (report.damageLevel === "partial") return { label: index % 2 ? "HIGH" : "MEDIUM", className: index % 2 ? "bg-orange-500" : "bg-amber-500" };
  return { label: "MINIMAL", className: "bg-green-600" };
}

function WorldMapHero() {
  const pins = [
    ["left-[22%] top-[30%]", "bg-red-600", "!"],
    ["left-[30%] top-[55%]", "bg-red-600", "!"],
    ["left-[55%] top-[44%]", "bg-orange-500", "!"],
    ["left-[58%] top-[28%]", "bg-orange-500", "!"],
    ["right-[18%] top-[30%]", "bg-green-600", "✓"]
  ];

  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-white">
      <div className="absolute inset-0 opacity-80 [background-image:radial-gradient(circle,#c8d9ef_2px,transparent_2px)] [background-size:12px_12px] [mask-image:radial-gradient(ellipse_at_center,black_52%,transparent_78%)]" />
      <div className="absolute left-[18%] top-[18%] h-44 w-64 rounded-[50%] bg-blue-100/40 blur-sm" />
      <div className="absolute right-[16%] top-[20%] h-52 w-72 rounded-[50%] bg-blue-100/40 blur-sm" />
      <div className="absolute left-[40%] top-[28%] h-64 w-48 rounded-[50%] bg-blue-100/30 blur-sm" />
      {pins.map(([position, color, label]) => (
        <span key={position} className={`absolute ${position} flex h-8 w-8 items-center justify-center rounded-full border-4 border-white ${color} text-sm font-black text-white shadow-lg`}>
          {label}
        </span>
      ))}
    </div>
  );
}

export default function PublicSite() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api("/reports?sort=newest").then((items) => setReports(items.slice(0, 5))).catch(() => setReports([]));
  }, []);

  const visibleReports = useMemo(() => (reports.length > 0 ? reports : sampleReports.slice(0, 5)), [reports]);

  return (
    <div className="min-h-screen bg-white text-[#071a4f]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-5 py-4 lg:px-10">
          <Link to="/" className="shrink-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600">
            <Logo compact />
          </Link>
          <nav className="hidden items-center gap-10 text-sm font-black lg:flex">
            <a href="#" className="border-b-4 border-green-600 pb-5 text-green-700">Home</a>
            <Link to="/app/map" className="pb-5 text-[#071a4f] hover:text-green-700">Live Map</Link>
            <Link to="/app" className="pb-5 text-[#071a4f] hover:text-green-700">Reports</Link>
          </nav>
          <div className="flex items-center gap-3">
            <button className="hidden min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-black text-[#071a4f] sm:flex">
              <Globe2 size={17} />
              EN
            </button>
            <Button as={Link} to="/app/report" className="bg-[#071a4f] hover:bg-[#0b255d]" size="lg">
              <CirclePlus size={18} />
              Report an incident
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-[1500px] gap-8 px-5 py-8 lg:grid-cols-[0.72fr_1.12fr_0.55fr] lg:px-10">
          <div className="flex flex-col justify-center py-8">
            <h1 className="font-heading text-4xl font-black leading-tight md:text-5xl xl:text-6xl">
              Together, we can respond faster and save lives.
            </h1>
            <p className="mt-7 max-w-md text-lg font-semibold leading-8 text-slate-600">
              Tala Mboka Crisis connects communities and humanitarian actors through real-time incident reporting and open data.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/app/map" size="lg">
                <Map size={19} />
                Explore live map
              </Button>
              <Button as={Link} to="/app" variant="ghost" size="lg">
                <Menu size={19} />
                See all reports
              </Button>
            </div>
          </div>

          <WorldMapHero />

          <aside className="self-center rounded-xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-lg font-black">Global impact</h2>
              <span className="text-sm font-bold text-slate-500">Last 7 days</span>
            </div>
            <div className="divide-y divide-slate-200">
              {impactStats.map(({ label, value, change, icon: Icon, color, bg }) => (
                <div key={label} className="flex items-center gap-4 py-4">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} ${color}`}>
                    <Icon size={23} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-500">{label}</p>
                    <p className="font-heading text-2xl font-black text-[#071a4f]">{value}</p>
                  </div>
                  <span className={`text-sm font-black ${change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>{change}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section id="reports" className="mx-auto max-w-[1500px] px-5 py-6 lg:px-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="font-heading text-2xl font-black">Recent incidents</h2>
            <Link to="/app" className="hidden items-center gap-2 text-sm font-black text-blue-700 hover:text-green-700 sm:flex">
              View all reports
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {visibleReports.map((report, index) => {
              const severity = severityFor(report, index);
              return (
                <article key={report._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md shadow-slate-200/70">
                  <div className="relative h-32 overflow-hidden">
                    <img src={incidentImages[index % incidentImages.length]} alt="" className="h-full w-full object-cover" />
                    <span className={`absolute left-3 top-3 rounded-md px-2 py-1 text-xs font-black text-white ${severity.className}`}>{severity.label}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-heading text-base font-black">{report.title}</h3>
                    <p className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-500">
                      <MapPin size={15} />
                      {report.commune || "Area"}, {report.province || "Region"}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-500">
                      <Clock3 size={15} />
                      {index === 0 ? "12 min ago" : `${(index + 1) * 15} min ago`}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="live-map" className="mx-auto max-w-[1500px] px-5 py-6 lg:px-10">
          <h2 className="mb-4 font-heading text-lg font-black">Explore by type</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            {typeFilters.map(({ label, icon: Icon, color }) => (
              <Link key={label} to="/app/map" className="flex min-h-14 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black shadow-sm transition hover:border-green-300 hover:bg-green-50">
                <Icon className={color} size={24} />
                {label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-5 py-6 lg:px-10">
          <div className="grid items-center gap-6 rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-white p-6 md:grid-cols-[180px_1fr_auto]">
            <div className="hidden h-24 items-center justify-center rounded-xl bg-white md:flex">
              <HeartPulse className="text-green-700" size={58} />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-black">See something? Report it in seconds.</h2>
              <p className="mt-2 font-semibold text-slate-600">Your report helps communities and responders take action.</p>
            </div>
            <div>
              <Button as={Link} to="/app/report" size="lg">
                <Globe2 size={18} />
                Report an incident
              </Button>
              <p className="mt-3 text-center text-sm font-semibold text-slate-500">Works offline. No account required.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto grid max-w-[1500px] gap-8 border-t border-slate-200 px-5 py-8 lg:grid-cols-[1.4fr_repeat(2,1fr)] lg:px-10">
        <div>
          <Logo compact />
          <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-slate-600">An open platform for crisis reporting and humanitarian response.</p>
          <p className="mt-6 text-sm font-semibold text-slate-500">© 2024 Tala Mboka Crisis. All rights reserved.</p>
        </div>
        <div>
          <h3 className="font-heading text-sm font-black">Platform</h3>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
            <Link to="/app/map" className="hover:text-green-700">Live Map</Link>
            <Link to="/app" className="hover:text-green-700">Reports</Link>
            <Link to="/app/report" className="hover:text-green-700">Report an incident</Link>
          </div>
        </div>
        <div>
          <h3 className="font-heading text-sm font-black">Data</h3>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
            <Link to="/app/map" className="hover:text-green-700">Verified reports</Link>
            <Link to="/app/report" className="hover:text-green-700">Offline reporting</Link>
            <Link to="/app/map" className="hover:text-green-700">Open crisis map</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
