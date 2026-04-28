export const riskLevels = {
  danger: { label: "Danger", color: "#ef4444", weight: 0.95 },
  critique: { label: "Critique", color: "#f97316", weight: 0.72 },
  suivi: { label: "Suivi", color: "#eab308", weight: 0.45 },
  resolved: { label: "Resolu", color: "#198754", weight: 0.18 }
};

export function getRiskLevel(report) {
  return normalizeStatus(report.status);
}

export function normalizeStatus(status) {
  if (status === "danger") return "danger";
  if (status === "critique") return "critique";
  if (status === "resolved" || status === "rejected") return "resolved";
  return "suivi";
}

export function distanceKm(from, to) {
  if (!from || !to) return null;
  const earthRadius = 6371;
  const latDistance = ((to.lat - from.lat) * Math.PI) / 180;
  const lngDistance = ((to.lng - from.lng) * Math.PI) / 180;
  const startLat = (from.lat * Math.PI) / 180;
  const endLat = (to.lat * Math.PI) / 180;
  const value =
    Math.sin(latDistance / 2) ** 2 +
    Math.sin(lngDistance / 2) ** 2 * Math.cos(startLat) * Math.cos(endLat);
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function formatDistance(km) {
  if (typeof km !== "number") return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}
