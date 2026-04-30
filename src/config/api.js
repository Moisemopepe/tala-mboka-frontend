const productionApiUrl = "https://tala-mboka-backend.onrender.com/api";
const configuredApiUrl = import.meta.env.VITE_API_URL || productionApiUrl;

export const API_URL = configuredApiUrl;
