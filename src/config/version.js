export const VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : import.meta.env.VITE_APP_VERSION || "0.5.9";
