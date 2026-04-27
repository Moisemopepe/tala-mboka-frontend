import { UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import NotificationBell from "./NotificationBell.jsx";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 lg:px-12">
        <Link
          to="/"
          className="min-w-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Retour a l'accueil"
        >
          <Logo compact />
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell />
          <Link
            to="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-soft"
            aria-label="Profil"
          >
            <UserCircle size={21} />
          </Link>
        </div>
      </div>
    </header>
  );
}
