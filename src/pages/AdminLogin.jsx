import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Logo from "../components/Logo.jsx";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    setError("");

    try {
      const data = await api("/admin/login", {
        method: "POST",
        body: JSON.stringify(form)
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("tala_token", data.token);
      localStorage.setItem("tala_user", JSON.stringify(data.user));
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center">
      <Card className="w-full space-y-5 p-5 md:max-w-lg">
        <Logo />
        <div>
          <h1 className="font-heading text-xl font-black text-text md:text-2xl lg:text-3xl">Connexion admin</h1>
          <p className="text-sm font-semibold text-slate-600 md:text-base">Accedez au dashboard admin ou moderateur.</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            required
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="Telephone admin"
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
          <Button type="submit" variant="success" size="lg" className="w-full" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
