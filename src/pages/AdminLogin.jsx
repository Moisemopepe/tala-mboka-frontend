import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UsersRound, Clock3, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import Logo from "../components/Logo.jsx";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "moisemopepe3@gmail.com", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        body: JSON.stringify({ email: form.email, password: form.password })
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
    <main className="grid min-h-screen bg-slate-50 text-[#061849] lg:grid-cols-[42vw_1fr]">
      <section className="relative hidden overflow-hidden bg-[#031d3a] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-center">
        <div className="absolute inset-x-0 top-12 h-72 opacity-25 [background-image:radial-gradient(circle,#1f8cff_1px,transparent_1px)] [background-size:10px_10px]" />
        <div className="relative mx-auto w-full max-w-md">
          <div className="mb-14">
            <Logo />
          </div>
          <h1 className="font-heading text-4xl font-black">Admin access</h1>
          <p className="mt-4 max-w-sm text-lg font-semibold leading-8 text-slate-200">
            Secure access to the crisis response management dashboard.
          </p>
          <div className="mt-16 grid gap-8">
            {[
              ["Secure", "Your data is encrypted and protected", ShieldCheck],
              ["Real-time", "Access live reports and critical alerts", Clock3],
              ["For responders", "Built for humanitarian and response teams", UsersRound]
            ].map(([title, text, Icon]) => (
              <div key={title} className="flex items-start gap-4">
                <Icon className="mt-1 text-green-400" size={24} />
                <div>
                  <p className="font-black">{title}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-300">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10">
        <form onSubmit={submit} className="w-full max-w-xl rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70 md:p-12">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-[#061849]">
              <ShieldCheck size={38} />
            </div>
            <h2 className="mt-7 font-heading text-3xl font-black">Welcome back</h2>
            <p className="mt-2 text-base font-semibold text-slate-500">Sign in to access the admin dashboard</p>
          </div>

          <div className="mt-10 grid gap-6">
            <label>
              <span className="mb-2 block text-sm font-black">Email address</span>
              <span className="relative block">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={22} />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder="Enter your email"
                  className="h-16 w-full rounded-xl border border-slate-200 bg-white pl-14 pr-4 text-base font-semibold outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />
              </span>
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">Password</span>
              <span className="relative block">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={22} />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  placeholder="Enter your password"
                  className="h-16 w-full rounded-xl border border-slate-200 bg-white pl-14 pr-14 text-base font-semibold outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </span>
            </label>
          </div>

          {sessionMessage && <p className="mt-5 rounded-xl bg-green-50 p-3 text-sm font-bold text-green-700">{sessionMessage}</p>}
          {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 flex h-16 w-full items-center justify-center gap-3 rounded-xl bg-green-600 text-base font-black text-white shadow-xl shadow-green-100 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={21} /> : <LockKeyhole size={21} />}
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="mt-10 flex items-center gap-5 text-sm font-semibold text-slate-500">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="inline-flex items-center gap-2"><ShieldCheck size={18} className="text-green-600" /> Secure access</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </form>
      </section>
    </main>
  );
}
