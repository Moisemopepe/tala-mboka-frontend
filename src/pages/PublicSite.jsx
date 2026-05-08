import { AlertTriangle, ArrowRight, Building2, CirclePlus, Clock3, FileText, Flame, Globe2, HeartPulse, Map, MapPin, Menu, Navigation, Radio, ShieldCheck, Users, Waves, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import Logo from "../components/Logo.jsx";
import { languageOptions } from "../utils/languageOptions.js";
import { sampleReports } from "../utils/sampleReports.js";

const incidentImages = [
  "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=75"
];

const typeFilters = [
  { label: "Flood", icon: Waves, color: "text-blue-500" },
  { label: "Earthquake", icon: Zap, color: "text-red-500" },
  { label: "Fire", icon: Flame, color: "text-orange-500" },
  { label: "Storm", icon: Radio, color: "text-violet-500" },
  { label: "Landslide", icon: Navigation, color: "text-amber-700" },
  { label: "Building damage", icon: Building2, color: "text-blue-600" },
  { label: "Road damage", icon: MapPin, color: "text-slate-500" },
  { label: "Other", icon: Menu, color: "text-slate-500" }
];

const publicCopy = {
  en: {
    nav: { home: "Home", map: "Live Map", reports: "Reports", report: "Report an incident" },
    heroTitle: "Together, we can respond faster and save lives.",
    heroText: "Tala Mboka Crisis connects communities and response teams through mobile-first reporting, live mapping, and open structured data.",
    exploreMap: "Explore live map",
    seeReports: "See all reports",
    currentData: "Current data",
    liveFeed: "Live feed",
    stats: { reports: "Reports available", critical: "Critical incidents", communities: "Communities mapped", verified: "Verified reports", live: "Live", priority: "Priority", field: "Field", admin: "Admin" },
    recent: "Recent incidents",
    viewAll: "View all reports",
    exploreType: "Explore by type",
    ctaTitle: "See damage? Report it in seconds.",
    ctaText: "The mobile app is the primary field channel. This web form remains available as a backup.",
    offline: "Works offline. No account required.",
    footerText: "An open-source platform for crisis reporting and humanitarian response.",
    copyright: "© 2026 Tala Mboka Crisis. Open-source crisis mapping platform.",
    platform: "Platform",
    data: "Data",
    verifiedReports: "Verified reports",
    offlineReporting: "Offline reporting",
    openMap: "Open crisis map",
    ago: "min ago"
  },
  fr: {
    nav: { home: "Accueil", map: "Carte en direct", reports: "Alertes", report: "Signaler un incident" },
    heroTitle: "Ensemble, nous pouvons répondre plus vite et sauver des vies.",
    heroText: "Tala Mboka Crisis relie les communautés et les équipes d'intervention grâce au signalement mobile, à la cartographie en direct et aux données ouvertes.",
    exploreMap: "Explorer la carte",
    seeReports: "Voir les alertes",
    currentData: "Données actuelles",
    liveFeed: "Flux en direct",
    stats: { reports: "Alertes disponibles", critical: "Incidents critiques", communities: "Communautés cartographiées", verified: "Alertes vérifiées", live: "Direct", priority: "Priorité", field: "Terrain", admin: "Admin" },
    recent: "Incidents récents",
    viewAll: "Voir toutes les alertes",
    exploreType: "Explorer par type",
    ctaTitle: "Vous voyez des dégâts ? Signalez-les en quelques secondes.",
    ctaText: "L'application mobile est le canal principal du terrain. Ce formulaire web reste disponible en secours.",
    offline: "Fonctionne hors ligne. Aucun compte requis.",
    footerText: "Une plateforme open-source pour le signalement de crise et la réponse humanitaire.",
    copyright: "© 2026 Tala Mboka Crisis. Plateforme open-source de cartographie de crise.",
    platform: "Plateforme",
    data: "Données",
    verifiedReports: "Alertes vérifiées",
    offlineReporting: "Signalement hors ligne",
    openMap: "Carte de crise ouverte",
    ago: "min"
  },
  es: {
    nav: { home: "Inicio", map: "Mapa en vivo", reports: "Alertas", report: "Reportar incidente" },
    heroTitle: "Juntos podemos responder más rápido y salvar vidas.",
    heroText: "Tala Mboka Crisis conecta comunidades y equipos de respuesta mediante reportes móviles, mapas en vivo y datos abiertos.",
    exploreMap: "Explorar mapa",
    seeReports: "Ver alertas",
    currentData: "Datos actuales",
    liveFeed: "En vivo",
    stats: { reports: "Alertas disponibles", critical: "Incidentes críticos", communities: "Comunidades mapeadas", verified: "Alertas verificadas", live: "Vivo", priority: "Prioridad", field: "Campo", admin: "Admin" },
    recent: "Incidentes recientes",
    viewAll: "Ver todas",
    exploreType: "Explorar por tipo",
    ctaTitle: "¿Ves daños? Repórtalos en segundos.",
    ctaText: "La app móvil es el canal principal de campo. Este formulario web queda como respaldo.",
    offline: "Funciona sin conexión. No requiere cuenta.",
    footerText: "Una plataforma open-source para reportes de crisis y respuesta humanitaria.",
    copyright: "© 2026 Tala Mboka Crisis. Plataforma open-source de mapeo de crisis.",
    platform: "Plataforma",
    data: "Datos",
    verifiedReports: "Alertas verificadas",
    offlineReporting: "Reporte sin conexión",
    openMap: "Mapa abierto de crisis",
    ago: "min"
  },
  ar: {
    nav: { home: "الرئيسية", map: "الخريطة المباشرة", reports: "التنبيهات", report: "الإبلاغ عن حادث" },
    heroTitle: "معا نستجيب أسرع وننقذ الأرواح.",
    heroText: "تربط Tala Mboka Crisis المجتمعات بفرق الاستجابة عبر التبليغ المحمول والخرائط المباشرة والبيانات المفتوحة.",
    exploreMap: "استكشاف الخريطة",
    seeReports: "عرض التنبيهات",
    currentData: "البيانات الحالية",
    liveFeed: "مباشر",
    stats: { reports: "التنبيهات المتاحة", critical: "حوادث حرجة", communities: "مجتمعات على الخريطة", verified: "تنبيهات موثقة", live: "مباشر", priority: "أولوية", field: "ميدان", admin: "إدارة" },
    recent: "الحوادث الأخيرة",
    viewAll: "عرض الكل",
    exploreType: "استكشاف حسب النوع",
    ctaTitle: "هل ترى ضررا؟ أبلغ عنه خلال ثوان.",
    ctaText: "تطبيق الهاتف هو القناة الميدانية الأساسية، ويبقى نموذج الويب كخيار احتياطي.",
    offline: "يعمل دون اتصال. لا يلزم حساب.",
    footerText: "منصة مفتوحة المصدر للإبلاغ عن الأزمات والاستجابة الإنسانية.",
    copyright: "© 2026 Tala Mboka Crisis. منصة خرائط أزمات مفتوحة المصدر.",
    platform: "المنصة",
    data: "البيانات",
    verifiedReports: "تنبيهات موثقة",
    offlineReporting: "إبلاغ دون اتصال",
    openMap: "خريطة أزمة مفتوحة",
    ago: "دقيقة"
  },
  zh: {
    nav: { home: "首页", map: "实时地图", reports: "警报", report: "报告事件" },
    heroTitle: "携手更快响应，拯救生命。",
    heroText: "Tala Mboka Crisis 通过移动优先报告、实时地图和开放结构化数据连接社区与响应团队。",
    exploreMap: "探索地图",
    seeReports: "查看警报",
    currentData: "当前数据",
    liveFeed: "实时",
    stats: { reports: "可用警报", critical: "严重事件", communities: "已绘制社区", verified: "已验证警报", live: "实时", priority: "优先", field: "现场", admin: "管理" },
    recent: "最近事件",
    viewAll: "查看全部",
    exploreType: "按类型探索",
    ctaTitle: "看到损害？几秒内报告。",
    ctaText: "移动应用是主要现场渠道。此网页表单作为备用。",
    offline: "支持离线。无需账户。",
    footerText: "用于危机报告和人道响应的开源平台。",
    copyright: "© 2026 Tala Mboka Crisis. 开源危机地图平台。",
    platform: "平台",
    data: "数据",
    verifiedReports: "已验证警报",
    offlineReporting: "离线报告",
    openMap: "开放危机地图",
    ago: "分钟前"
  },
  ru: {
    nav: { home: "Главная", map: "Живая карта", reports: "Оповещения", report: "Сообщить" },
    heroTitle: "Вместе мы реагируем быстрее и спасаем жизни.",
    heroText: "Tala Mboka Crisis соединяет сообщества и команды реагирования через мобильные отчеты, живую карту и открытые данные.",
    exploreMap: "Открыть карту",
    seeReports: "Смотреть оповещения",
    currentData: "Текущие данные",
    liveFeed: "В реальном времени",
    stats: { reports: "Доступные оповещения", critical: "Критические инциденты", communities: "Сообщества на карте", verified: "Проверенные оповещения", live: "Live", priority: "Приоритет", field: "Поле", admin: "Админ" },
    recent: "Последние инциденты",
    viewAll: "Смотреть все",
    exploreType: "По типу",
    ctaTitle: "Видите ущерб? Сообщите за секунды.",
    ctaText: "Мобильное приложение является основным полевым каналом. Веб-форма остается резервным вариантом.",
    offline: "Работает офлайн. Аккаунт не нужен.",
    footerText: "Открытая платформа для сообщений о кризисах и гуманитарного реагирования.",
    copyright: "© 2026 Tala Mboka Crisis. Открытая платформа кризисного картирования.",
    platform: "Платформа",
    data: "Данные",
    verifiedReports: "Проверенные оповещения",
    offlineReporting: "Офлайн-отчеты",
    openMap: "Открытая карта кризисов",
    ago: "мин назад"
  }
};

function severityFor(report, index) {
  if (report.status === "verified") return { label: "VERIFIED", className: "bg-green-600" };
  if (report.damageLevel === "complete") return { label: "CRITICAL", className: "bg-red-600" };
  if (report.damageLevel === "partial") return { label: index % 2 ? "HIGH" : "MEDIUM", className: index % 2 ? "bg-orange-500" : "bg-amber-500" };
  return { label: "MINIMAL", className: "bg-green-600" };
}

function WorldMapHero() {
  const pins = [
    ["left-[22%] top-[30%]", "bg-red-600", "!"],
    ["left-[30%] top-[55%]", "bg-red-600", "!"],
    ["left-[55%] top-[44%]", "bg-orange-500", "!"],
    ["left-[58%] top-[28%]", "bg-orange-500", "!"],
    ["right-[18%] top-[30%]", "bg-green-600", "OK"]
  ];

  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-white">
      <div className="absolute inset-0 opacity-80 [background-image:radial-gradient(circle,#c8d9ef_2px,transparent_2px)] [background-size:12px_12px] [mask-image:radial-gradient(ellipse_at_center,black_52%,transparent_78%)]" />
      <div className="absolute left-[18%] top-[18%] h-44 w-64 rounded-[50%] bg-blue-100/40 blur-sm" />
      <div className="absolute right-[16%] top-[20%] h-52 w-72 rounded-[50%] bg-blue-100/40 blur-sm" />
      <div className="absolute left-[40%] top-[28%] h-64 w-48 rounded-[50%] bg-blue-100/30 blur-sm" />
      {pins.map(([position, color, label]) => (
        <span key={position} className={`absolute ${position} flex h-8 w-8 items-center justify-center rounded-full border-4 border-white ${color} text-xs font-black text-white shadow-lg`}>
          {label}
        </span>
      ))}
    </div>
  );
}

export default function PublicSite() {
  const [reports, setReports] = useState([]);
  const [language, setLanguage] = useState(() => localStorage.getItem("tala_public_language") || localStorage.getItem("tala_admin_language") || "en");
  const copy = publicCopy[language] || publicCopy.en;

  useEffect(() => {
    api("/reports?sort=newest").then((items) => setReports(items.slice(0, 5))).catch(() => setReports([]));
  }, []);

  useEffect(() => {
    localStorage.setItem("tala_public_language", language);
  }, [language]);

  const visibleReports = useMemo(() => (reports.length > 0 ? reports : sampleReports.slice(0, 5)), [reports]);
  const impactStats = useMemo(() => {
    const total = visibleReports.length;
    const critical = visibleReports.filter((report) => report.damageLevel === "complete").length;
    const verified = visibleReports.filter((report) => report.status === "verified").length;
    const communities = new Set(visibleReports.map((report) => `${report.commune || "Area"}-${report.province || "Region"}`)).size;
    return [
      { label: copy.stats.reports, value: String(total), change: copy.stats.live, icon: FileText, color: "text-green-700", bg: "bg-green-50" },
      { label: copy.stats.critical, value: String(critical), change: copy.stats.priority, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
      { label: copy.stats.communities, value: String(communities), change: copy.stats.field, icon: Users, color: "text-orange-500", bg: "bg-orange-50" },
      { label: copy.stats.verified, value: String(verified), change: copy.stats.admin, icon: ShieldCheck, color: "text-violet-600", bg: "bg-violet-50" }
    ];
  }, [visibleReports, copy]);

  return (
    <div className="min-h-screen bg-white text-[#071a4f]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-5 py-4 lg:px-10">
          <Link to="/" className="shrink-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600">
            <Logo compact />
          </Link>
          <nav className="hidden items-center gap-10 text-sm font-black lg:flex">
            <a href="#" className="border-b-4 border-green-600 pb-5 text-green-700">{copy.nav.home}</a>
            <Link to="/app/map" className="pb-5 text-[#071a4f] hover:text-green-700">{copy.nav.map}</Link>
            <Link to="/app" className="pb-5 text-[#071a4f] hover:text-green-700">{copy.nav.reports}</Link>
          </nav>
          <div className="flex items-center gap-2">
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm">
              <Globe2 size={17} className="text-green-700" />
              <select value={language} onChange={(event) => setLanguage(event.target.value)} className="bg-transparent font-black outline-none" aria-label="Language">
                {Object.entries(languageOptions).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </label>
            <Button as={Link} to="/app/report" className="bg-[#071a4f] hover:bg-[#0b255d]" size="lg">
              <CirclePlus size={18} />
              <span className="hidden sm:inline">{copy.nav.report}</span>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-[1500px] gap-8 px-5 py-8 lg:grid-cols-[0.72fr_1.12fr_0.55fr] lg:px-10">
          <div className="flex flex-col justify-center py-8">
            <h1 className="font-heading text-4xl font-black leading-tight md:text-5xl xl:text-6xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-7 max-w-md text-lg font-semibold leading-8 text-slate-600">
              {copy.heroText}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/app/map" size="lg">
                <Map size={19} />
                {copy.exploreMap}
              </Button>
              <Button as={Link} to="/app" variant="ghost" size="lg">
                <Menu size={19} />
                {copy.seeReports}
              </Button>
            </div>
          </div>

          <WorldMapHero />

          <aside className="self-center rounded-xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-lg font-black">{copy.currentData}</h2>
              <span className="text-sm font-bold text-slate-500">{copy.liveFeed}</span>
            </div>
            <div className="divide-y divide-slate-200">
              {impactStats.map(({ label, value, change, icon: Icon, color, bg }) => (
                <div key={label} className="flex items-center gap-4 py-4">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} ${color}`}>
                    <Icon size={23} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-500">{label}</p>
                    <p className="font-heading text-2xl font-black text-[#071a4f]">{value}</p>
                  </div>
                  <span className="text-sm font-black text-green-600">{change}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section id="reports" className="mx-auto max-w-[1500px] px-5 py-6 lg:px-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="font-heading text-2xl font-black">{copy.recent}</h2>
            <Link to="/app" className="hidden items-center gap-2 text-sm font-black text-blue-700 hover:text-green-700 sm:flex">
              {copy.viewAll}
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {visibleReports.map((report, index) => {
              const severity = severityFor(report, index);
              return (
                <article key={report._id || `${report.title}-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md shadow-slate-200/70">
                  <div className="relative h-32 overflow-hidden">
                    <img src={incidentImages[index % incidentImages.length]} alt="" className="h-full w-full object-cover" />
                    <span className={`absolute left-3 top-3 rounded-md px-2 py-1 text-xs font-black text-white ${severity.className}`}>{severity.label}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-heading text-base font-black">{report.title}</h3>
                    <p className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-500">
                      <MapPin size={15} />
                      {report.commune || "Area"}, {report.province || "Region"}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-500">
                      <Clock3 size={15} />
                      {index === 0 ? `12 ${copy.ago}` : `${(index + 1) * 15} ${copy.ago}`}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="live-map" className="mx-auto max-w-[1500px] px-5 py-6 lg:px-10">
          <h2 className="mb-4 font-heading text-lg font-black">{copy.exploreType}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            {typeFilters.map(({ label, icon: Icon, color }) => (
              <Link key={label} to="/app/map" className="flex min-h-14 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black shadow-sm transition hover:border-green-300 hover:bg-green-50">
                <Icon className={color} size={24} />
                {label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-5 py-6 lg:px-10">
          <div className="grid items-center gap-6 rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-white p-6 md:grid-cols-[180px_1fr_auto]">
            <div className="hidden h-24 items-center justify-center rounded-xl bg-white md:flex">
              <HeartPulse className="text-green-700" size={58} />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-black">{copy.ctaTitle}</h2>
              <p className="mt-2 font-semibold text-slate-600">{copy.ctaText}</p>
            </div>
            <div>
              <Button as={Link} to="/app/report" size="lg">
                <CirclePlus size={18} />
                {copy.nav.report}
              </Button>
              <p className="mt-3 text-center text-sm font-semibold text-slate-500">{copy.offline}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto grid max-w-[1500px] gap-8 border-t border-slate-200 px-5 py-8 lg:grid-cols-[1.4fr_repeat(2,1fr)] lg:px-10">
        <div>
          <Logo compact />
          <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-slate-600">{copy.footerText}</p>
          <p className="mt-6 text-sm font-semibold text-slate-500">{copy.copyright}</p>
        </div>
        <div>
          <h3 className="font-heading text-sm font-black">{copy.platform}</h3>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
            <Link to="/app/map" className="hover:text-green-700">{copy.nav.map}</Link>
            <Link to="/app" className="hover:text-green-700">{copy.nav.reports}</Link>
            <Link to="/app/report" className="hover:text-green-700">{copy.nav.report}</Link>
          </div>
        </div>
        <div>
          <h3 className="font-heading text-sm font-black">{copy.data}</h3>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
            <Link to="/app/map" className="hover:text-green-700">{copy.verifiedReports}</Link>
            <Link to="/app/report" className="hover:text-green-700">{copy.offlineReporting}</Link>
            <Link to="/app/map" className="hover:text-green-700">{copy.openMap}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
