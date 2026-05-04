import { ArrowLeft, Database, Globe2, MapPinned, ShieldCheck, Smartphone, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { VERSION } from "../config/version.js";

const capabilities = [
  "Community members can submit photos, descriptions, damage classifications, and geolocation.",
  "Reports are stored securely, moderated, visualized on a map, and exported as CSV or GeoJSON.",
  "The workflow supports infrastructure type, crisis type, debris, location fallback text, and modular impact questions.",
  "The product is designed for low-connectivity field conditions through an offline queue and send-later sync.",
  "The interface uses simple English and French translation files so field text stays easy to localize."
];

const architecture = [
  { icon: Smartphone, title: "Field app", text: "Mobile-first React workflow for rapid community damage capture." },
  { icon: WifiOff, title: "Offline queue", text: "IndexedDB stores pending reports and image files until connectivity returns." },
  { icon: MapPinned, title: "Crisis map", text: "Leaflet/OpenStreetMap displays reports by infrastructure and damage severity." },
  { icon: Database, title: "Structured backend", text: "Express and MongoDB store validated records, photos, metadata, and moderation state." },
  { icon: ShieldCheck, title: "Validation", text: "Admin and moderator tools approve, reject, correct, filter, and export reports." },
  { icon: Globe2, title: "Internationalization path", text: "Geography, languages, and crisis taxonomies are structured for deployment beyond DRC." }
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-[980px] pb-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-95"
        aria-label="Back"
      >
        <ArrowLeft size={22} />
      </button>

      <section className="rounded-xl bg-white px-5 py-9 shadow-sm ring-1 ring-slate-200 sm:px-8 md:py-12">
        <Logo />
        <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-primary">Operational crisis mapping</p>
        <h1 className="mt-3 max-w-3xl font-heading text-3xl font-black leading-tight text-[#062653] sm:text-4xl md:text-5xl">
          Tala Mboka Crisis turns community reports into structured response data.
        </h1>
        <p className="mt-6 max-w-3xl text-base font-semibold leading-8 text-slate-700 md:text-lg">
          The platform is built to help crisis-affected communities report infrastructure damage in real time, creating an early signal layer that can complement satellite analysis, field assessments, and recovery planning.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <h2 className="font-heading text-2xl font-black text-text">Platform capabilities</h2>
        <div className="mt-5 space-y-3">
          {capabilities.map((item) => (
            <div key={item} className="rounded-lg border border-green-100 bg-green-50 p-3 text-sm font-bold leading-6 text-slate-800">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {architecture.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <Icon className="text-primary" size={24} />
            <h3 className="mt-3 text-lg font-black text-text">{title}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{text}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-black text-text">Operational roadmap</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
          Next steps are broader localization, optional AI-assisted damage classification, stronger duplicate detection for repeated building reports, and integrations with response coordination systems.
        </p>
      </section>

      <p className="mt-5 text-center text-xs font-semibold text-slate-400">Tala Mboka Crisis - Version {VERSION}</p>
    </div>
  );
}
