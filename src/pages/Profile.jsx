import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, isAuthenticated, login, logout, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");

  useEffect(() => {
    const storedMessage = localStorage.getItem("tala_session_message");
    if (storedMessage) {
      setSessionMessage(storedMessage);
      localStorage.removeItem("tala_session_message");
    }
  }, []);

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
    return (
      <Card className="space-y-5 p-5">
        <div>
          <p className="text-sm font-bold text-slate-500">Connecte comme</p>
          <h1 className="font-heading text-2xl font-black text-text">{user?.name}</h1>
          <p className="font-semibold text-slate-600">{user?.phone}</p>
        </div>
        <Link to="/my-reports">
          <Button type="button" variant="success" className="w-full">
            Mes alertes
          </Button>
        </Link>
        <Button
          type="button"
          onClick={logout}
          variant="ghost"
          className="w-full"
        >
          <LogOut size={18} />
          Deconnexion
        </Button>
      </Card>
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
