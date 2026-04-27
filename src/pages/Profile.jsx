import { Bell, CalendarDays, Eye, EyeOff, FileText, HeartHandshake, LogOut, MapPinned, PlusCircle, ShieldCheck, Zap } from "lucide-react";
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
  const [form, setForm] = useState({ name: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [sessionMessage, setSessionMessage] = useState("");
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
    setFieldErrors((current) => ({ ...current, [field]: validateField(field, value, { ...form, [field]: value }) }));
  }

  function validateField(field, value, nextForm = form) {
    if (mode !== "register") return "";
    if (field === "name" && value.trim().length < 2) return "Le nom est obligatoire.";
    if (field === "phone" && !/^[0-9+()\s-]{8,}$/.test(value.trim())) return "Entrez un telephone valide.";
    if (field === "password" && value.length < 6) return "Le mot de passe doit contenir au moins 6 caracteres.";
    if (field === "confirmPassword" && value !== nextForm.password) return "Les mots de passe ne correspondent pas.";
    return "";
  }

  function validateRegister(nextForm = form) {
    return {
      name: validateField("name", nextForm.name, nextForm),
      phone: validateField("phone", nextForm.phone, nextForm),
      password: validateField("password", nextForm.password, nextForm),
      confirmPassword: validateField("confirmPassword", nextForm.confirmPassword, nextForm)
    };
  }

  const registerErrors = validateRegister();
  const isRegisterValid =
    mode !== "register" ||
    (form.name.trim() &&
      form.phone.trim() &&
      form.password &&
      form.confirmPassword &&
      Object.values(registerErrors).every((item) => !item));

  function fieldClass(field) {
    if (mode !== "register") return "focus:border-success focus:shadow-[0_0_0_4px_rgba(25,135,84,0.12)]";
    const hasValue = Boolean(form[field]);
    const errorText = fieldErrors[field] || (hasValue ? registerErrors[field] : "");
    if (errorText) return "border-red-300 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(220,53,69,0.12)]";
    if (hasValue) return "border-success focus:border-success focus:shadow-[0_0_0_4px_rgba(25,135,84,0.12)]";
    return "focus:border-success focus:shadow-[0_0_0_4px_rgba(25,135,84,0.12)]";
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setFieldErrors({});

    if (mode === "register") {
      const nextErrors = validateRegister();
      setFieldErrors(nextErrors);
      if (Object.values(nextErrors).some(Boolean)) return;
    }

    setAuthLoading(true);
    try {
      if (mode === "login") {
        await login(form.phone, form.password);
        setSuccessMessage("Connexion reussie.");
      } else {
        await register(form.name, form.phone, form.password);
        setSuccessMessage("Compte cree avec succes. Redirection vers votre profil...");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
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
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-5 py-4">
          <h1 className="font-heading text-3xl font-black leading-tight text-text">Rejoignez Tala Mboka</h1>
          <p className="mt-1 text-sm font-bold text-slate-600">Signalez et améliorez votre quartier</p>
          <p className="mt-3 rounded-2xl bg-white/80 p-3 text-sm font-bold leading-6 text-slate-700 shadow-sm">
            Chaque alerte aide votre quartier a etre vu, compris et mieux pris en charge.
          </p>
        </div>
      </Card>

      <div className="grid gap-2 sm:grid-cols-3">
        {[
          { icon: Zap, text: "Publier des alertes rapidement" },
          { icon: MapPinned, text: "Suivre les problemes proches" },
          { icon: HeartHandshake, text: "Aider la communaute" }
        ].map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="rounded-2xl border border-slate-100 bg-white p-3 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]"
          >
            <Icon className="text-primary" size={20} />
            <p className="mt-2 text-sm font-black text-text">{text}</p>
          </div>
        ))}
      </div>

      <Card className="space-y-4 p-4">
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setFieldErrors({});
              setError("");
            }}
            className={`min-h-10 rounded-lg border px-3 text-sm font-black transition ${
              mode === "login" ? "border-primary bg-primary text-white shadow-sm" : "border-transparent bg-slate-100 text-slate-600 hover:bg-white"
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setFieldErrors({});
              setError("");
            }}
            className={`min-h-10 rounded-lg border px-3 text-sm font-black transition ${
              mode === "register" ? "border-primary bg-primary text-white shadow-sm" : "border-transparent bg-slate-100 text-slate-600 hover:bg-white"
            }`}
          >
            Inscription
          </button>
        </div>

        {mode === "register" && (
          <label className="block">
            <input
              required
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Nom complet"
              className={`form-field ${fieldClass("name")}`}
            />
            {(fieldErrors.name || (form.name && registerErrors.name)) && (
              <p className="mt-1 text-xs font-bold text-red-600">{fieldErrors.name || registerErrors.name}</p>
            )}
          </label>
        )}
        <label className="block">
          <input
            required
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="Telephone"
            className={`form-field ${fieldClass("phone")}`}
          />
          {(fieldErrors.phone || (mode === "register" && form.phone && registerErrors.phone)) && (
            <p className="mt-1 text-xs font-bold text-red-600">{fieldErrors.phone || registerErrors.phone}</p>
          )}
        </label>
        <label className="relative block">
          <input
            required
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            placeholder="Mot de passe"
            className={`form-field pr-12 ${fieldClass("password")}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {(fieldErrors.password || (mode === "register" && form.password && registerErrors.password)) && (
            <p className="mt-1 text-xs font-bold text-red-600">{fieldErrors.password || registerErrors.password}</p>
          )}
        </label>
        {mode === "register" && (
          <label className="block">
            <input
              required
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(event) => update("confirmPassword", event.target.value)}
              placeholder="Confirmer le mot de passe"
              className={`form-field ${fieldClass("confirmPassword")}`}
            />
            {(fieldErrors.confirmPassword || (form.confirmPassword && registerErrors.confirmPassword)) && (
              <p className="mt-1 text-xs font-bold text-red-600">
                {fieldErrors.confirmPassword || registerErrors.confirmPassword}
              </p>
            )}
          </label>
        )}

        {mode === "login" && (
          <button type="button" className="text-left text-sm font-black text-primary">
            Mot de passe oublié
          </button>
        )}
        {sessionMessage && <p className="rounded-xl bg-blue-50 p-3 text-sm font-bold text-primary">{sessionMessage}</p>}
        {successMessage && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-success">{successMessage}</p>}
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        <Button
          type="submit"
          variant="success"
          size="lg"
          className="w-full hover:-translate-y-0.5 active:scale-95"
          disabled={authLoading || (mode === "register" && !isRegisterValid)}
        >
          {authLoading
            ? mode === "login"
              ? "Connexion..."
              : "Création en cours..."
            : mode === "login"
              ? "Se connecter"
              : "Créer mon compte"}
        </Button>
      </Card>
    </form>
  );
}
