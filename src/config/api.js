const productionApiUrl = "https://tala-mboka-backend.onrender.com/api";
const configuredApiUrl = import.meta.env.VITE_API_URL || productionApiUrl;

function isNativeApp() {
  return Boolean(window.Capacitor?.isNativePlatform?.()) || (window.location.protocol === "https:" && window.location.hostname === "localhost");
}

function resolveApiUrl() {
  if (isNativeApp() && /localhost|127\.0\.0\.1/i.test(configuredApiUrl)) {
    return productionApiUrl;
  }

  return configuredApiUrl;
}

export const API_URL = resolveApiUrl();
