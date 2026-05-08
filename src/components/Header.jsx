import { FileText, Map, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { languageOptions } from "../utils/languageOptions.js";
import { getAppCopy, getStoredLanguage, setStoredLanguage } from "../utils/appI18n.js";
import Logo from "./Logo.jsx";

const desktopNav = [
  { to: "/app", label: "Incidents", icon: FileText },
  { to: "/app/report", label: "Report", icon: PlusCircle },
  { to: "/app/map", label: "Crisis map", icon: Map }
];

const taglines = {
  en: "Community crisis mapping",
  fr: "Cartographie communautaire des crises",
  es: "Mapa comunitario de crisis",
  ar: "خريطة مجتمعية للأزمات",
  zh: "社区危机地图",
  ru: "Карта кризисов сообщества"
};

export default function Header() {
  const [language, setLanguage] = useState(getStoredLanguage);
  const copy = getAppCopy(language);

  useEffect(() => {
    function syncLanguage(event) {
      setLanguage(event.detail || getStoredLanguage());
    }
    window.addEventListener("tala:language-changed", syncLanguage);
    return () => window.removeEventListener("tala:language-changed", syncLanguage);
  }, []);

  function changeLanguage(value) {
    setLanguage(value);
    setStoredLanguage(value);
  }

  const labels = [copy.nav.incidents, copy.nav.report, copy.nav.map];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 lg:px-12">
        <Link
          to="/"
          className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Tala Crisis Map"
        >
          <Logo compact tagline={taglines[language] || taglines.en} />
        </Link>
        <nav className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 lg:flex">
          {desktopNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/app"}
              className={({ isActive }) =>
                `inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                  isActive ? "bg-white text-green-700 shadow-sm" : "text-slate-600 hover:bg-white hover:text-green-700"
                }`
              }
            >
              <Icon size={16} />
              {labels[desktopNav.findIndex((item) => item.to === to)] || label}
            </NavLink>
          ))}
        </nav>
        <label className="flex min-h-10 max-w-[8.5rem] items-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-black text-slate-700 shadow-sm">
          <select value={language} onChange={(event) => changeLanguage(event.target.value)} className="min-w-0 bg-transparent font-black outline-none" aria-label="Language">
            {Object.entries(languageOptions).map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </label>
        <Link to="/app/report" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-black text-white shadow-sm transition hover:bg-green-700 active:scale-95">
          <PlusCircle size={17} />
          <span className="hidden sm:inline">{copy.nav.reportButton}</span>
        </Link>
      </div>
    </header>
  );
}
