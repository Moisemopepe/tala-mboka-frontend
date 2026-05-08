export const appSecondaryCopy = {
  en: {
    about: {
      back: "Back",
      eyebrow: "Operational crisis mapping",
      title: "Tala Mboka Crisis turns community reports into structured response data.",
      intro: "The platform helps crisis-affected communities report infrastructure damage in real time, creating an early signal layer for field assessment and recovery planning.",
      capabilitiesTitle: "Platform capabilities",
      capabilities: [
        "Community members can submit photos, descriptions, damage classifications, and geolocation.",
        "Reports are stored securely, moderated, visualized on a map, and exported as CSV or GeoJSON.",
        "The workflow supports infrastructure type, crisis type, debris, fallback location text, and modular impact questions.",
        "The product is designed for low-connectivity field conditions through an offline queue and send-later sync.",
        "The interface is structured so field text stays easy to localize."
      ],
      architecture: [
        { title: "Field app", text: "Mobile-first workflow for rapid community damage capture." },
        { title: "Offline queue", text: "Pending reports and image files are stored until connectivity returns." },
        { title: "Crisis map", text: "OpenStreetMap displays reports by infrastructure and damage severity." },
        { title: "Structured backend", text: "Express and MongoDB store validated records, photos, metadata, and moderation state." },
        { title: "Validation", text: "Admin and moderator tools approve, reject, correct, filter, and export reports." },
        { title: "Internationalization", text: "Geography, languages, and crisis taxonomies are ready for wider deployment." }
      ],
      version: "Version"
    },
    notifications: {
      title: "Notifications",
      loginText: "Sign in to receive important Tala Mboka updates.",
      loginButton: "Sign in",
      eyebrow: "Notifications",
      heading: "Updates",
      intro: "Review announcements, corrections, and important information.",
      refresh: "Refresh",
      markAll: "Mark all read",
      all: "All notifications",
      unread: "unread",
      unreadPlural: "unread",
      readAll: "Everything is read",
      loading: "Loading notifications...",
      emptyTitle: "No notifications",
      emptyText: "Future updates will appear here."
    },
    myReports: {
      sessionRequired: "Sign in to view your alerts.",
      sessionExpired: "Your session expired. Please sign in again.",
      title: "My alerts",
      intro: "Track the status of your reports.",
      report: "Report",
      loading: "Loading your alerts...",
      emptyTitle: "No alerts available",
      emptyText: "Your next reports will appear here."
    }
  },
  fr: {
    about: {
      back: "Retour",
      eyebrow: "Cartographie opérationnelle des crises",
      title: "Tala Mboka Crisis transforme les signalements communautaires en données structurées pour la réponse.",
      intro: "La plateforme aide les communautés touchées par une crise à signaler les dégâts d'infrastructure en temps réel, avec une couche d'alerte utile aux évaluations terrain et à la planification de la reprise.",
      capabilitiesTitle: "Capacités de la plateforme",
      capabilities: [
        "Les membres de la communauté peuvent envoyer photos, descriptions, niveau de dégâts et géolocalisation.",
        "Les signalements sont stockés, modérés, visualisés sur carte, puis exportables en CSV ou GeoJSON.",
        "Le flux couvre type d'infrastructure, type de crise, débris, adresse de secours et questions d'impact modulaires.",
        "Le produit est pensé pour les zones à faible connexion avec file hors ligne et synchronisation différée.",
        "L'interface est structurée pour garder les textes terrain faciles à localiser."
      ],
      architecture: [
        { title: "App terrain", text: "Flux mobile-first pour capturer rapidement les dégâts signalés par la communauté." },
        { title: "File hors ligne", text: "Les signalements et photos en attente restent stockés jusqu'au retour de la connexion." },
        { title: "Carte de crise", text: "OpenStreetMap affiche les alertes par infrastructure et gravité des dégâts." },
        { title: "Backend structuré", text: "Express et MongoDB stockent les dossiers validés, photos, métadonnées et états de modération." },
        { title: "Validation", text: "Les outils admin et modérateur approuvent, rejettent, corrigent, filtrent et exportent les alertes." },
        { title: "Internationalisation", text: "Géographie, langues et taxonomies de crise sont prêtes pour un déploiement plus large." }
      ],
      version: "Version"
    },
    notifications: {
      title: "Notifications",
      loginText: "Connectez-vous pour recevoir les mises à jour importantes de Tala Mboka.",
      loginButton: "Se connecter",
      eyebrow: "Notifications",
      heading: "Mises à jour",
      intro: "Consultez les annonces, corrections et informations importantes.",
      refresh: "Actualiser",
      markAll: "Tout lu",
      all: "Toutes les notifications",
      unread: "non lue",
      unreadPlural: "non lues",
      readAll: "Tout est lu",
      loading: "Chargement des notifications...",
      emptyTitle: "Aucune notification",
      emptyText: "Les prochaines mises à jour apparaîtront ici."
    },
    myReports: {
      sessionRequired: "Connectez-vous pour voir vos alertes.",
      sessionExpired: "Votre session a expiré. Reconnectez-vous.",
      title: "Mes alertes",
      intro: "Suivez le statut de vos signalements.",
      report: "Signaler",
      loading: "Chargement de vos alertes...",
      emptyTitle: "Aucune alerte disponible",
      emptyText: "Vos prochains signalements apparaîtront ici."
    }
  },
  es: {
    about: {
      back: "Volver",
      eyebrow: "Mapeo operativo de crisis",
      title: "Tala Mboka Crisis convierte reportes comunitarios en datos estructurados de respuesta.",
      intro: "La plataforma ayuda a comunidades afectadas por crisis a reportar daños de infraestructura en tiempo real para apoyar evaluaciones de campo y planificación de recuperación.",
      capabilitiesTitle: "Capacidades de la plataforma",
      capabilities: [
        "La comunidad puede enviar fotos, descripciones, clasificación de daños y geolocalización.",
        "Los reportes se almacenan, moderan, visualizan en mapa y exportan como CSV o GeoJSON.",
        "El flujo cubre infraestructura, tipo de crisis, escombros, ubicación alternativa y preguntas modulares.",
        "El producto funciona en baja conectividad con cola sin conexión y sincronización posterior.",
        "La interfaz está estructurada para localizar fácilmente los textos de campo."
      ],
      architecture: [
        { title: "App de campo", text: "Flujo móvil para capturar rápidamente daños comunitarios." },
        { title: "Cola offline", text: "Reportes y fotos pendientes se guardan hasta recuperar conexión." },
        { title: "Mapa de crisis", text: "OpenStreetMap muestra alertas por infraestructura y gravedad." },
        { title: "Backend estructurado", text: "Express y MongoDB guardan registros, fotos, metadatos y moderación." },
        { title: "Validación", text: "Herramientas admin aprueban, rechazan, corrigen, filtran y exportan reportes." },
        { title: "Internacionalización", text: "Geografía, idiomas y taxonomías están listos para ampliar despliegues." }
      ],
      version: "Versión"
    },
    notifications: {
      title: "Notificaciones",
      loginText: "Inicia sesión para recibir actualizaciones importantes.",
      loginButton: "Iniciar sesión",
      eyebrow: "Notificaciones",
      heading: "Actualizaciones",
      intro: "Consulta anuncios, correcciones e información importante.",
      refresh: "Actualizar",
      markAll: "Marcar leídas",
      all: "Todas las notificaciones",
      unread: "sin leer",
      unreadPlural: "sin leer",
      readAll: "Todo leído",
      loading: "Cargando notificaciones...",
      emptyTitle: "No hay notificaciones",
      emptyText: "Las próximas actualizaciones aparecerán aquí."
    },
    myReports: {
      sessionRequired: "Inicia sesión para ver tus alertas.",
      sessionExpired: "Tu sesión expiró. Inicia sesión de nuevo.",
      title: "Mis alertas",
      intro: "Sigue el estado de tus reportes.",
      report: "Reportar",
      loading: "Cargando tus alertas...",
      emptyTitle: "No hay alertas disponibles",
      emptyText: "Tus próximos reportes aparecerán aquí."
    }
  },
  ar: {
    about: {
      back: "رجوع",
      eyebrow: "خريطة تشغيلية للأزمات",
      title: "تحول Tala Mboka Crisis بلاغات المجتمع إلى بيانات منظمة للاستجابة.",
      intro: "تساعد المنصة المجتمعات المتأثرة بالأزمات على الإبلاغ عن أضرار البنية التحتية في الوقت الحقيقي لدعم التقييم الميداني والتعافي.",
      capabilitiesTitle: "قدرات المنصة",
      capabilities: ["إرسال الصور والوصف ومستوى الضرر والموقع.", "تخزين البلاغات ومراجعتها وعرضها على الخريطة وتصديرها.", "يدعم التدفق نوع البنية والأزمة والحطام وموقعا بديلا وأسئلة تأثير.", "مصمم للاتصال الضعيف مع قائمة انتظار دون اتصال.", "النصوص منظمة لتسهيل الترجمة."],
      architecture: [{ title: "تطبيق ميداني", text: "تدفق سريع لالتقاط أضرار المجتمع." }, { title: "قائمة دون اتصال", text: "تحفظ البلاغات والصور حتى عودة الاتصال." }, { title: "خريطة الأزمة", text: "تعرض OpenStreetMap التنبيهات حسب البنية والضرر." }, { title: "خلفية منظمة", text: "يحفظ Express و MongoDB السجلات والصور والبيانات." }, { title: "التحقق", text: "أدوات الإدارة تعتمد أو ترفض أو تصحح أو تصدر البلاغات." }, { title: "تعدد اللغات", text: "الجغرافيا واللغات وتصنيفات الأزمة جاهزة للتوسع." }],
      version: "الإصدار"
    },
    notifications: { title: "التنبيهات", loginText: "سجل الدخول لتلقي تحديثات مهمة.", loginButton: "تسجيل الدخول", eyebrow: "التنبيهات", heading: "التحديثات", intro: "راجع الإعلانات والتصحيحات والمعلومات المهمة.", refresh: "تحديث", markAll: "تعليم الكل كمقروء", all: "كل التنبيهات", unread: "غير مقروء", unreadPlural: "غير مقروءة", readAll: "كلها مقروءة", loading: "جار تحميل التنبيهات...", emptyTitle: "لا توجد تنبيهات", emptyText: "ستظهر التحديثات القادمة هنا." },
    myReports: { sessionRequired: "سجل الدخول لعرض تنبيهاتك.", sessionExpired: "انتهت جلستك. سجل الدخول من جديد.", title: "تنبيهاتي", intro: "تابع حالة بلاغاتك.", report: "إبلاغ", loading: "جار تحميل تنبيهاتك...", emptyTitle: "لا توجد تنبيهات", emptyText: "ستظهر بلاغاتك القادمة هنا." }
  },
  zh: {
    about: {
      back: "返回",
      eyebrow: "危机运行地图",
      title: "Tala Mboka Crisis 将社区报告转化为结构化响应数据。",
      intro: "平台帮助受危机影响的社区实时报告基础设施损害，为现场评估和恢复规划提供早期信号。",
      capabilitiesTitle: "平台能力",
      capabilities: ["社区成员可提交照片、描述、损害等级和地理位置。", "报告可安全存储、审核、上图并导出为 CSV 或 GeoJSON。", "流程支持基础设施、危机类型、碎片、备用地址和模块化影响问题。", "产品面向低连接场景，支持离线队列和稍后同步。", "界面结构便于本地化现场文本。"],
      architecture: [{ title: "现场应用", text: "移动优先流程，快速采集社区损害。" }, { title: "离线队列", text: "报告和图片会保存到连接恢复后再发送。" }, { title: "危机地图", text: "OpenStreetMap 按基础设施和损害程度显示警报。" }, { title: "结构化后端", text: "Express 和 MongoDB 存储记录、图片、元数据和审核状态。" }, { title: "验证", text: "管理员工具可批准、拒绝、修正、筛选和导出报告。" }, { title: "国际化", text: "地理、语言和危机分类已准备扩展部署。" }],
      version: "版本"
    },
    notifications: { title: "通知", loginText: "登录以接收 Tala Mboka 重要更新。", loginButton: "登录", eyebrow: "通知", heading: "更新", intro: "查看公告、修正和重要信息。", refresh: "刷新", markAll: "全部已读", all: "所有通知", unread: "未读", unreadPlural: "未读", readAll: "全部已读", loading: "正在加载通知...", emptyTitle: "没有通知", emptyText: "未来更新会显示在这里。" },
    myReports: { sessionRequired: "请登录查看你的警报。", sessionExpired: "会话已过期，请重新登录。", title: "我的警报", intro: "跟踪你的报告状态。", report: "报告", loading: "正在加载你的警报...", emptyTitle: "没有可用警报", emptyText: "你的后续报告会显示在这里。" }
  },
  ru: {
    about: {
      back: "Назад",
      eyebrow: "Операционная карта кризисов",
      title: "Tala Mboka Crisis превращает сообщения сообщества в структурированные данные реагирования.",
      intro: "Платформа помогает пострадавшим сообществам сообщать об ущербе инфраструктуре в реальном времени для полевых оценок и восстановления.",
      capabilitiesTitle: "Возможности платформы",
      capabilities: ["Жители могут отправлять фото, описание, уровень ущерба и геолокацию.", "Сообщения хранятся, модерируются, показываются на карте и экспортируются.", "Процесс поддерживает тип инфраструктуры, кризиса, обломки, адрес и вопросы воздействия.", "Продукт рассчитан на слабую связь с офлайн-очередью и последующей синхронизацией.", "Интерфейс структурирован для простой локализации."],
      architecture: [{ title: "Полевое приложение", text: "Мобильный процесс для быстрой фиксации ущерба." }, { title: "Офлайн-очередь", text: "Сообщения и фото сохраняются до восстановления связи." }, { title: "Карта кризиса", text: "OpenStreetMap показывает alerts по инфраструктуре и ущербу." }, { title: "Структурированный backend", text: "Express и MongoDB хранят записи, фото, метаданные и модерацию." }, { title: "Проверка", text: "Админ-инструменты одобряют, отклоняют, исправляют, фильтруют и экспортируют." }, { title: "Интернационализация", text: "География, языки и кризисные таксономии готовы к расширению." }],
      version: "Версия"
    },
    notifications: { title: "Уведомления", loginText: "Войдите, чтобы получать важные обновления Tala Mboka.", loginButton: "Войти", eyebrow: "Уведомления", heading: "Обновления", intro: "Просматривайте объявления, исправления и важную информацию.", refresh: "Обновить", markAll: "Все прочитано", all: "Все уведомления", unread: "непрочитанное", unreadPlural: "непрочитанных", readAll: "Все прочитано", loading: "Загрузка уведомлений...", emptyTitle: "Нет уведомлений", emptyText: "Будущие обновления появятся здесь." },
    myReports: { sessionRequired: "Войдите, чтобы посмотреть свои alerts.", sessionExpired: "Сессия истекла. Войдите снова.", title: "Мои alerts", intro: "Отслеживайте статус своих сообщений.", report: "Сообщить", loading: "Загрузка ваших alerts...", emptyTitle: "Нет alerts", emptyText: "Ваши следующие сообщения появятся здесь." }
  }
};

export function getAppSecondaryCopy(language) {
  return appSecondaryCopy[language] || appSecondaryCopy.en;
}
