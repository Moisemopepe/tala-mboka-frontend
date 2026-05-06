import { FileText, Map, PlusCircle } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";

const desktopNav = [
  { to: "/app", label: "Incidents", icon: FileText },
  { to: "/app/report", label: "Report", icon: PlusCircle },
  { to: "/app/map", label: "Crisis map", icon: Map }
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 lg:px-12">
        <Link
          to="/"
          className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Tala Crisis Map"
        >
          <Logo compact />
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
              {label}
            </NavLink>
          ))}
        </nav>
        <Link to="/app/report" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-black text-white shadow-sm transition hover:bg-green-700 active:scale-95">
          <PlusCircle size={17} />
          Report incident
        </Link>
      </div>
    </header>
  );
}
