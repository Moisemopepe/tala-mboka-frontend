import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState("");
  const panelRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    } else {
      setItems([]);
      setUnread(0);
    }
  }, [isAuthenticated]);

  async function loadNotifications() {
    try {
      const data = await api("/notifications");
      setItems(data.notifications || []);
      setUnread(data.unread || 0);
      setError("");
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function toggleOpen() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen && isAuthenticated) {
      const data = await loadNotifications();
      const notifications = data?.notifications || [];
      if ((data?.unread || unread) > 0) {
        setUnread(0);
        setItems(notifications.map((item) => ({ ...item, read: true })));
        api("/notifications/read", { method: "PATCH" }).catch(() => {});
      }
    }
  }

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event) {
      if (!panelRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(() => setOpen(false), 6000);
    return () => window.clearTimeout(timer);
  }, [open, items.length]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-primary"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-danger px-1 text-[10px] font-black text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg sm:w-96">
          <div className="border-b border-slate-100 p-3">
            <p className="font-heading text-sm font-black text-text">Notifications</p>
            <p className="text-xs font-semibold text-slate-500">
              {isAuthenticated ? "Mises à jour récentes" : "Connectez-vous pour recevoir vos mises à jour"}
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!isAuthenticated && <p className="p-4 text-sm font-semibold text-slate-500">Aucune notification pour le moment.</p>}
            {error && <p className="p-4 text-sm font-bold text-danger">{error}</p>}
            {isAuthenticated && items.length === 0 && !error && (
              <p className="p-4 text-sm font-semibold text-slate-500">Aucune notification.</p>
            )}
            {items.map((item) => (
              <article key={item._id} className={`border-b border-slate-100 p-3 ${item.read ? "bg-white" : "bg-green-50"}`}>
                <p className="text-sm font-black text-text">{item.title}</p>
                <p className="mt-1 whitespace-pre-line text-xs font-semibold leading-5 text-slate-600">{item.message}</p>
                <p className="mt-2 text-[11px] font-bold text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
