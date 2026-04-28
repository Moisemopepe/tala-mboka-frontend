import { statuses } from "../utils/categories.js";
import { normalizeStatus } from "../utils/risk.js";

const statusStyles = {
  danger: "bg-red-100 text-red-600 ring-red-200",
  critique: "bg-orange-100 text-orange-600 ring-orange-200",
  suivi: "bg-yellow-100 text-yellow-700 ring-yellow-200",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200"
};

const statusDots = {
  danger: "🔴",
  critique: "🟠",
  suivi: "🟡",
  resolved: "🟢"
};

export default function StatusBadge({ status }) {
  const normalizedStatus = normalizeStatus(status);

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${
        statusStyles[normalizedStatus] || "bg-slate-50 text-slate-700 ring-slate-200"
      }`}
    >
      <span className="mr-1">{statusDots[normalizedStatus]}</span>
      {statuses[normalizedStatus] || normalizedStatus}
    </span>
  );
}
