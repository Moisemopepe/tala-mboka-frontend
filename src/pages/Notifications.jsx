import { Bell, CheckCheck, LoaderCircle, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getStoredLanguage } from "../utils/appI18n.js";
import { getAppSecondaryCopy } from "../utils/appSecondaryI18n.js";

function formatDate(value, language) {
  if (!value) return "";
  return new Intl.DateTimeFormat(language === "en" ? "en-US" : language, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(isAuthenticated));
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState(getStoredLanguage);
  const copy = getAppSecondaryCopy(language).notifications;

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  useEffect(() => {
    function syncLanguage(event) {
      setLanguage(event.detail || getStoredLanguage());
    }
    window.addEventListener("tala:language-changed", syncLanguage);
    return () => window.removeEventListener("tala:language-changed", syncLanguage);
  }, []);

  async function loadNotifications() {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await api("/notifications");
      setItems(data.notifications || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function markAllAsRead() {
    setMarking(true);
    try {
      await api("/notifications/read", { method: "PATCH" });
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setMarking(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <Card className="w-full p-6 text-center">
          <Bell className="mx-auto text-slate-400" size={34} />
          <h1 className="mt-4 font-heading text-2xl font-black text-text">{copy.title}</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{copy.loginText}</p>
          <Button as={Link} to="/app/profile" variant="success" className="mt-5 w-full sm:w-auto">
            {copy.loginButton}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">{copy.eyebrow}</p>
          <h1 className="font-heading text-2xl font-black text-text md:text-3xl">{copy.heading}</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">{copy.intro}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={loadNotifications} disabled={loading} className="flex-1 sm:flex-none">
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            {copy.refresh}
          </Button>
          <Button type="button" variant="success" onClick={markAllAsRead} disabled={marking || unreadCount === 0} className="flex-1 sm:flex-none">
            <CheckCheck size={17} />
            {copy.markAll}
          </Button>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div>
            <p className="font-heading text-lg font-black text-text">{copy.all}</p>
            <p className="text-sm font-semibold text-slate-500">
              {unreadCount > 0 ? `${unreadCount} ${unreadCount > 1 ? copy.unreadPlural : copy.unread}` : copy.readAll}
            </p>
          </div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-primary">{items.length}</span>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 p-8 text-sm font-bold text-slate-500">
            <LoaderCircle className="animate-spin" size={18} />
            {copy.loading}
          </div>
        )}

        {!loading && items.length === 0 && !error && (
          <div className="p-8 text-center">
            <Bell className="mx-auto text-slate-300" size={34} />
            <p className="mt-3 font-heading text-lg font-black text-text">{copy.emptyTitle}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{copy.emptyText}</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <article key={item._id || `${item.title}-${item.createdAt}`} className={`p-4 ${item.read ? "bg-white" : "bg-green-50/70"}`}>
                <div className="flex items-start gap-3">
                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.read ? "bg-slate-300" : "bg-primary"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="font-heading text-base font-black text-text">{item.title}</h2>
                      <time className="text-xs font-bold text-slate-400">{formatDate(item.createdAt, language)}</time>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-slate-600">{item.message}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
