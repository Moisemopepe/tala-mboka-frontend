import { FileText, Info, Map, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

const desktopNav = [
  { to: "/app", label: "Map", icon: Map },
  { to: "/app#reports", label: "Reports", icon: FileText },
  { to: "/app/about", label: "About", icon: Info }
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-950/60 bg-[#06234a] text-white shadow-sm backdrop-blur">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 lg:px-12">
        <Link
          to="/app"
          className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#06234a]"
          aria-label="Tala Crisis Map"
        >
          <Logo compact inverted />
        </Link>
        <nav className="hidden items-center gap-2 lg:flex">
          {desktopNav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <Link to="/app/report" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-black text-white shadow-sm transition hover:bg-green-600 active:scale-95">
          <PlusCircle size={17} />
          Report incident
        </Link>
      </div>
    </header>
  );
}
