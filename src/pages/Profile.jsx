import { Bell, CalendarDays, FileText, LogOut, PlusCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { categories } from "../utils/categories.js";

export default function Profile() {
  const { user, isAuthenticated, login, logout, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");

  useEffect(() => {
    const storedMessage = localStorage.getItem("tala_session_message");
    if (storedMessage) {
      setSessionMessage(storedMessage);
      localStorage.removeItem("tala_session_message");
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    setReportsLoading(true);
    api("/reports/mine")
      .then((items) => {
        setReports(items);
        setReportsError("");
      })
      .catch((err) => setReportsError(err.message))
      .finally(() => setReportsLoading(false));
  }, [isAuthenticated]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await login(form.phone, form.password);
      } else {
        await register(form.name, form.phone, form.password);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  if (isAuthenticated) {
    const initial = (user?.name || user?.phone || "U").trim().charAt(0).toUpperCase();
    const approvedCount = reports.filter((report) => report.status === "approved").length;
    const pendingCount = reports.filter((report) => report.status === "pending").length;
    const latestReports = reports.slice(0, 3);

    return (
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary font-heading text-2xl font-black text-white shadow-soft">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-success ring-1 ring-emerald-100">
                  <ShieldCheck size={14} />
                  Utilisateur actif
                </div>
                <h1 className="truncate font-heading text-2xl font-black text-text">{user?.name}</h1>
                <p className="font-semibold text-slate-600">{user?.phone}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-2">
          <Card className="p-3 text-center">
            <p className="text-xs font-black uppercase text-slate-500">Total</p>
            <p className="font-heading text-2xl font-black text-text">{reports.length}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs font-black uppercase text-slate-500">Validees</p>
            <p className="font-heading text-2xl font-black text-success">{approvedCount}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs font-black uppercase text-slate-500">En attente</p>
            <p className="font-heading text-2xl font-black text-amber-600">{pendingCount}</p>
          </Card>
        </div>

        <Card className="p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-black text-text">Mes alertes</h2>
              <p className="text-sm font-semibold text-slate-500">Les 3 derniers signalements.</p>
            </div>
            <Link to="/my-reports" className="text-sm font-black text-primary">
              Voir tout
            </Link>
          </div>

          {reportsLoading && <p className="text-sm font-bold text-slate-500">Chargement des alertes...</p>}
          {reportsError && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{reportsError}</p>}
          {!reportsLoading && !reportsError && latestReports.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-5 text-center">
              <Bell className="mx-auto text-slate-400" size={26} />
              <p className="mt-2 font-bold text-slate-600">Tu n'as encore publie aucune alerte</p>
            </div>
          )}

          <div className="space-y-3">
            {latestReports.map((report) => (
              <div key={report._id} className="rounded-2xl border border-slate-100 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase" style={{ color: categories[report.category]?.color }}>
                      {categories[report.category]?.label || report.category}
                    </p>
                    <p className="truncate font-heading font-black text-text">{report.title}</p>
                  </div>
                  <StatusBadge status={report.status} />
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs font-bold text-slate-500">
                  <CalendarDays size={14} />
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-2 sm:grid-cols-3">
          <Link to="/report" className="sm:col-span-1">
            <Button type="button" variant="success" className="w-full">
              <PlusCircle size={18} />
              Signaler
            </Button>
          </Link>
          <Link to="/my-reports" className="sm:col-span-1">
            <Button type="button" variant="ghost" className="w-full">
              <FileText size={18} />
              Mes alertes
            </Button>
          </Link>
          <Button type="button" onClick={logout} variant="ghost" className="w-full sm:col-span-1">
            <LogOut size={18} />
            Deconnexion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-black text-text">Votre compte</h1>
        <p className="text-sm font-medium text-slate-500">Connectez-vous pour soutenir et publier.</p>
      </div>
      <Card className="space-y-4 p-4">
      <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`min-h-10 rounded-lg border px-3 text-sm font-black transition ${
            mode === "login" ? "border-primary bg-blue-50 text-primary" : "border-transparent text-slate-700"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`min-h-10 rounded-lg border px-3 text-sm font-black transition ${
            mode === "register" ? "border-primary bg-blue-50 text-primary" : "border-transparent text-slate-700"
          }`}
        >
          Register
        </button>
      </div>
      {mode === "register" && (
        <input
          required
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="Nom complet"
          className="form-field"
        />
      )}
      <input
        required
        value={form.phone}
        onChange={(event) => update("phone", event.target.value)}
        placeholder="Telephone"
        className="form-field"
      />
      <input
        required
        type="password"
        value={form.password}
        onChange={(event) => update("password", event.target.value)}
        placeholder="Mot de passe"
        className="form-field"
      />
      {sessionMessage && <p className="rounded-xl bg-blue-50 p-3 text-sm font-bold text-primary">{sessionMessage}</p>}
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
      <Button type="submit" variant="success" size="lg" className="w-full">
        Continuer
      </Button>
      </Card>
    </form>
  );
}
