import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UsersRound, Clock3, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { languageOptions } from "../utils/languageOptions.js";

const loginCopy = {
  en: {
    sideTitle: "Admin access",
    sideText: "Secure access to the crisis response management dashboard.",
    cards: [
      ["Secure", "Your data is encrypted and protected", ShieldCheck],
      ["Real-time", "Access live reports and critical alerts", Clock3],
      ["For responders", "Built for humanitarian and response teams", UsersRound]
    ],
    welcome: "Welcome back",
    intro: "Sign in to access the admin dashboard",
    email: "Email address",
    emailPlaceholder: "Enter your email",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    hide: "Hide password",
    show: "Show password",
    signing: "Signing in...",
    signIn: "Sign in",
    secure: "Secure access"
  },
  fr: {
    sideTitle: "Accès admin",
    sideText: "Accès sécurisé au tableau de bord de gestion de crise.",
    cards: [
      ["Sécurisé", "Vos données sont chiffrées et protégées", ShieldCheck],
      ["Temps réel", "Accès aux signalements et alertes critiques", Clock3],
      ["Pour les intervenants", "Conçu pour les équipes humanitaires et de réponse", UsersRound]
    ],
    welcome: "Bon retour",
    intro: "Connectez-vous pour accéder au tableau de bord admin",
    email: "Adresse email",
    emailPlaceholder: "Entrez votre email",
    password: "Mot de passe",
    passwordPlaceholder: "Entrez votre mot de passe",
    hide: "Masquer le mot de passe",
    show: "Afficher le mot de passe",
    signing: "Connexion...",
    signIn: "Se connecter",
    secure: "Accès sécurisé"
  },
  es: {
    sideTitle: "Acceso admin",
    sideText: "Acceso seguro al panel de gestión de respuesta a crisis.",
    cards: [
      ["Seguro", "Tus datos están cifrados y protegidos", ShieldCheck],
      ["Tiempo real", "Accede a reportes y alertas críticas", Clock3],
      ["Para equipos", "Diseñado para equipos humanitarios y de respuesta", UsersRound]
    ],
    welcome: "Bienvenido",
    intro: "Inicia sesión para acceder al panel admin",
    email: "Correo electrónico",
    emailPlaceholder: "Ingresa tu correo",
    password: "Contraseña",
    passwordPlaceholder: "Ingresa tu contraseña",
    hide: "Ocultar contraseña",
    show: "Mostrar contraseña",
    signing: "Iniciando sesión...",
    signIn: "Iniciar sesión",
    secure: "Acceso seguro"
  },
  ar: {
    sideTitle: "دخول الإدارة",
    sideText: "دخول آمن إلى لوحة إدارة الاستجابة للأزمات.",
    cards: [["آمن", "بياناتك مشفرة ومحمية", ShieldCheck], ["فوري", "الوصول إلى البلاغات والتنبيهات الحرجة", Clock3], ["للمستجيبين", "مصمم للفرق الإنسانية وفرق الاستجابة", UsersRound]],
    welcome: "مرحبا بعودتك",
    intro: "سجل الدخول للوصول إلى لوحة الإدارة",
    email: "البريد الإلكتروني",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    password: "كلمة المرور",
    passwordPlaceholder: "أدخل كلمة المرور",
    hide: "إخفاء كلمة المرور",
    show: "إظهار كلمة المرور",
    signing: "جار الدخول...",
    signIn: "تسجيل الدخول",
    secure: "دخول آمن"
  },
  zh: {
    sideTitle: "管理员访问",
    sideText: "安全访问危机响应管理仪表板。",
    cards: [["安全", "你的数据已加密并受保护", ShieldCheck], ["实时", "访问实时报告和关键警报", Clock3], ["面向响应人员", "为人道和响应团队构建", UsersRound]],
    welcome: "欢迎回来",
    intro: "登录以访问管理员仪表板",
    email: "电子邮箱",
    emailPlaceholder: "输入邮箱",
    password: "密码",
    passwordPlaceholder: "输入密码",
    hide: "隐藏密码",
    show: "显示密码",
    signing: "正在登录...",
    signIn: "登录",
    secure: "安全访问"
  },
  ru: {
    sideTitle: "Доступ администратора",
    sideText: "Безопасный доступ к панели управления кризисным реагированием.",
    cards: [["Безопасно", "Ваши данные зашифрованы и защищены", ShieldCheck], ["В реальном времени", "Доступ к live-сообщениям и критическим alerts", Clock3], ["Для реагирования", "Создано для гуманитарных и response-команд", UsersRound]],
    welcome: "С возвращением",
    intro: "Войдите для доступа к панели администратора",
    email: "Email",
    emailPlaceholder: "Введите email",
    password: "Пароль",
    passwordPlaceholder: "Введите пароль",
    hide: "Скрыть пароль",
    show: "Показать пароль",
    signing: "Вход...",
    signIn: "Войти",
    secure: "Безопасный доступ"
  }
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem("tala_admin_language") || "fr");
  const copy = loginCopy[language] || loginCopy.en;

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

  function changeLanguage(value) {
    setLanguage(value);
    localStorage.setItem("tala_admin_language", value);
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
      setSession(data);
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
          <h1 className="font-heading text-4xl font-black">{copy.sideTitle}</h1>
          <p className="mt-4 max-w-sm text-lg font-semibold leading-8 text-slate-200">
            {copy.sideText}
          </p>
          <div className="mt-16 grid gap-8">
            {copy.cards.map(([title, text, Icon]) => (
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
          <label className="mb-6 ml-auto flex w-fit items-center rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-black text-slate-700 shadow-sm">
            <select value={language} onChange={(event) => changeLanguage(event.target.value)} className="bg-transparent font-black outline-none" aria-label="Language">
              {Object.entries(languageOptions).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </label>
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-[#061849]">
              <ShieldCheck size={38} />
            </div>
            <h2 className="mt-7 font-heading text-3xl font-black">{copy.welcome}</h2>
            <p className="mt-2 text-base font-semibold text-slate-500">{copy.intro}</p>
          </div>

          <div className="mt-10 grid gap-6">
            <label>
              <span className="mb-2 block text-sm font-black">{copy.email}</span>
              <span className="relative block">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={22} />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder={copy.emailPlaceholder}
                  className="h-16 w-full rounded-xl border border-slate-200 bg-white pl-14 pr-4 text-base font-semibold outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />
              </span>
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">{copy.password}</span>
              <span className="relative block">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={22} />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  placeholder={copy.passwordPlaceholder}
                  className="h-16 w-full rounded-xl border border-slate-200 bg-white pl-14 pr-14 text-base font-semibold outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label={showPassword ? copy.hide : copy.show}
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
            {loading ? copy.signing : copy.signIn}
          </button>

          <div className="mt-10 flex items-center gap-5 text-sm font-semibold text-slate-500">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="inline-flex items-center gap-2"><ShieldCheck size={18} className="text-green-600" /> {copy.secure}</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </form>
      </section>
    </main>
  );
}
