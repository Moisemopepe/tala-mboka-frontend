export const riskLevels = {
  urgent: { label: "Urgent", color: "#DC3545", weight: 0.95 },
  important: { label: "Important", color: "#F97316", weight: 0.72 },
  watch: { label: "A surveiller", color: "#FFD60A", weight: 0.45 },
  resolved: { label: "Resolu", color: "#198754", weight: 0.18 }
};

export function getRiskLevel(report) {
  if (["resolved", "rejected"].includes(report.status)) return "resolved";
  if (["security", "kidnapping"].includes(report.category)) return "urgent";
  if ((report.likesCount || report.likes?.length || 0) >= 10) return "urgent";
  if (["water", "electricity", "fraud"].includes(report.category)) return "important";
  if ((report.likesCount || report.likes?.length || 0) >= 5) return "important";
  return "watch";
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
