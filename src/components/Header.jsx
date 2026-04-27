import { Bell, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <Logo compact />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-soft"
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-danger" />
          </button>
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
