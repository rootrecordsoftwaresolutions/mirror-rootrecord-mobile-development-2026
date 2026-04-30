/**
 * Connected apps metadata.
 *
 * The Hub does not (yet) hit a live `/api/me/apps` endpoint — it renders a
 * curated list of first-party RootRecord apps, showing install/deep-link hints
 * per platform. If/when a server-driven list is added, swap the static
 * `REGISTERED_APPS` for an API call and keep the same shape.
 */
export const REGISTERED_APPS = [
  {
    id: "weather_manager",
    name: "Weather Manager",
    tagline: "Forecasts, alerts, and hazards for your saved locations.",
    status: "available", // available | coming_soon
    brand: "#3FE28D",
    iconKey: "Cloud",
    // Android: launch installed app by custom scheme / package.
    androidScheme: "weathermanager://open",
    androidPackage: "com.rootrecord.weathermanager",
    appId: "rootrecord_weather_manager_android",
    // Play Store fallback URL (document only — not auto-opened here).
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.rootrecord.weathermanager",
    // Public distribution page used by the Weather Manager README.
    distUrl: "https://github.com/RootRecord/rootrecord-weather-manager-mobile",
  },
  {
    id: "business_manager",
    name: "Business Manager",
    tagline: "Time, clients, income, and expenses — with cloud sync.",
    status: "available",
    brand: "#2B8A8F",
    iconKey: "Briefcase",
    androidScheme: "businessmanager://open",
    androidPackage: "com.rootrecord.businessmanager",
    appId: "rootrecord_business_manager_android",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.rootrecord.businessmanager",
  },
  {
    id: "account_hub",
    name: "Account Hub",
    tagline: "This app — your RootRecord home.",
    status: "current",
    brand: "#E9B949",
    iconKey: "ShieldCheck",
    appId: "rootrecord_account_hub_android",
  },
];

/** Future / teaser cards. Rendered dimmed under “Coming soon”. */
export const UPCOMING_APPS = [
  {
    id: "field_logger",
    name: "Field Logger",
    tagline: "Offline-first site notes and media capture.",
    status: "coming_soon",
    brand: "#60A5FA",
    iconKey: "MapPin",
  },
  {
    id: "invoice_studio",
    name: "Invoice Studio",
    tagline: "Quote to paid — Stripe + crypto settlement.",
    status: "coming_soon",
    brand: "#A78BFA",
    iconKey: "Receipt",
  },
];
