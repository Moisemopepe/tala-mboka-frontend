import { ArrowLeft, Database, Globe2, MapPinned, ShieldCheck, Smartphone, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { VERSION } from "../config/version.js";
import { getStoredLanguage } from "../utils/appI18n.js";
import { getAppSecondaryCopy } from "../utils/appSecondaryI18n.js";

const architecture = [
  Smartphone,
  WifiOff,
  MapPinned,
  Database,
  ShieldCheck,
  Globe2
];

export default function About() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(getStoredLanguage);
  const copy = getAppSecondaryCopy(language).about;

  useEffect(() => {
    function syncLanguage(event) {
      setLanguage(event.detail || getStoredLanguage());
    }
    window.addEventListener("tala:language-changed", syncLanguage);
    return () => window.removeEventListener("tala:language-changed", syncLanguage);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[980px] pb-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-95"
        aria-label={copy.back}
      >
        <ArrowLeft size={22} />
      </button>

      <section className="rounded-xl bg-white px-5 py-9 shadow-sm ring-1 ring-slate-200 sm:px-8 md:py-12">
        <Logo />
        <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-primary">{copy.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-heading text-3xl font-black leading-tight text-[#062653] sm:text-4xl md:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-6 max-w-3xl text-base font-semibold leading-8 text-slate-700 md:text-lg">
          {copy.intro}
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <h2 className="font-heading text-2xl font-black text-text">{copy.capabilitiesTitle}</h2>
        <div className="mt-5 space-y-3">
          {copy.capabilities.map((item) => (
            <div key={item} className="rounded-lg border border-green-100 bg-green-50 p-3 text-sm font-bold leading-6 text-slate-800">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {copy.architecture.map(({ title, text }, index) => {
          const Icon = architecture[index] || Globe2;
          return (
          <article key={title} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <Icon className="text-primary" size={24} />
            <h3 className="mt-3 text-lg font-black text-text">{title}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{text}</p>
          </article>
          );
        })}
      </section>

      <p className="mt-5 text-center text-xs font-semibold text-slate-400">Tala Mboka Crisis - {copy.version} {VERSION}</p>
    </div>
  );
}
