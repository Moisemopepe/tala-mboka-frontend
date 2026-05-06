import { Home, Info, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Header from "./Header.jsx";

const items = [
  { to: "/app/map", label: "Map", icon: Home },
  { to: "/app/report", label: "Report", icon: PlusCircle }
];

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem("tala_user") || "null");
  const currentUser = user || storedUser;
  const userItems = currentUser
    ? [...items, { to: "/app/about", label: "About", icon: Info }]
    : [...items, { to: "/app/about", label: "About", icon: Info }];
  const navItems = userItems;

  useEffect(() => {
    function handleSessionExpired() {
      localStorage.setItem("tala_session_message", "Votre session a expire. Reconnectez-vous.");
      const loginPath = location.pathname.startsWith("/admin") ? "/admin/login" : "/app/report";
      navigate(loginPath, { replace: true });
    }

    window.addEventListener("tala:session-expired", handleSessionExpired);
    return () => window.removeEventListener("tala:session-expired", handleSessionExpired);
  }, [location.pathname, navigate]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    function updateKeyboardState() {
      setKeyboardOpen(window.innerHeight - viewport.height > 140);
    }

    updateKeyboardState();
    viewport.addEventListener("resize", updateKeyboardState);
    viewport.addEventListener("scroll", updateKeyboardState);

    return () => {
      viewport.removeEventListener("resize", updateKeyboardState);
      viewport.removeEventListener("scroll", updateKeyboardState);
    };
  }, []);

  return (
    <div className={`min-h-screen w-full bg-background text-slate-800 ${keyboardOpen ? "pb-6" : "pb-[calc(13rem+env(safe-area-inset-bottom))]"}`}>
      <Header />

      <main className="w-full px-4 py-4 sm:px-6 sm:py-6 md:px-8 lg:px-10">
        <Outlet />
      </main>

      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_26px_rgba(15,23,42,0.06)] backdrop-blur transition-transform duration-200 ${
          keyboardOpen ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div
          className={`grid w-full px-2 py-2 sm:px-4 md:px-6 ${
            navItems.length === 3 ? "grid-cols-3" : navItems.length === 4 ? "grid-cols-4" : "grid-cols-2"
          }`}
        >
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/app"}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border text-[11px] font-semibold transition ${
                  isActive
                    ? "border-green-200 bg-green-50 text-primary"
                    : "border-transparent text-slate-700 hover:bg-slate-50 hover:text-primary"
                }`
              }
            >
              <Icon size={21} strokeWidth={2.4} />
              <span className="max-w-full truncate px-1">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
