import { FileText, Home, Info, LayoutDashboard, List, PlusCircle, User } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const items = [
  { to: "/", label: "Fil", icon: List },
  { to: "/report", label: "Signaler", icon: PlusCircle },
  { to: "/feed", label: "Carte", icon: Home }
];

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem("tala_user") || "null");
  const currentUser = user || storedUser;
  const canManage = ["admin", "moderator"].includes(currentUser?.role);
  const accountItem = { to: "/profile", label: currentUser ? "Profil" : "Compte", icon: User };
  const userItems = currentUser
    ? [...items, accountItem, { to: "/my-reports", label: "Alertes", icon: FileText }]
    : [...items, accountItem, { to: "/about", label: "À propos", icon: Info }];
  const navItems = canManage ? [...userItems, { to: "/admin", label: "Admin", icon: LayoutDashboard }] : userItems;

  useEffect(() => {
    function handleSessionExpired() {
      localStorage.setItem("tala_session_message", "Votre session a expiré. Reconnectez-vous.");
      const loginPath = location.pathname.startsWith("/admin") ? "/admin/login" : "/profile";
      navigate(loginPath, { replace: true });
    }

    window.addEventListener("tala:session-expired", handleSessionExpired);
    return () => window.removeEventListener("tala:session-expired", handleSessionExpired);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen w-full bg-background pb-36 text-slate-800">
      <Header />

      <main className="w-full px-4 py-4 sm:px-6 sm:py-6 md:px-8 lg:px-10">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 shadow-[0_-10px_26px_rgba(15,23,42,0.06)] backdrop-blur">
        <div
          className={`grid w-full px-2 py-2 sm:px-4 md:px-6 ${
            navItems.length === 6 ? "grid-cols-6" : navItems.length === 5 ? "grid-cols-5" : "grid-cols-4"
          }`}
        >
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border text-[11px] font-semibold transition ${
                  isActive
                    ? "border-green-200 bg-green-50 text-primary"
                    : "border-transparent text-slate-700 hover:bg-slate-50 hover:text-primary"
                }`
              }
            >
              <Icon size={21} strokeWidth={2.4} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
