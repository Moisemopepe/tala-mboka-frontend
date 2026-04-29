import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (isAuthenticated) {
      api("/notifications")
        .then((data) => {
          if (!cancelled) setUnread(data.unread || 0);
        })
        .catch(() => {
          if (!cancelled) setUnread(0);
        });
    } else {
      setUnread(0);
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <Link
      to="/notifications"
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-primary"
      aria-label="Notifications"
    >
      <Bell size={19} />
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-danger px-1 text-[10px] font-black text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
