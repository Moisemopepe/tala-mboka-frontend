import { statuses } from "../utils/categories.js";
import { normalizeStatus } from "../utils/risk.js";

const statusStyles = {
  danger: "bg-red-50 text-red-700 ring-red-200",
  critique: "bg-orange-50 text-orange-700 ring-orange-200"
};

const dotStyles = {
  danger: "bg-red-500",
  critique: "bg-orange-500"
};

export default function StatusBadge({ status, showNeutral = false }) {
  const normalizedStatus = normalizeStatus(status);

  if (!showNeutral && normalizedStatus !== "danger" && normalizedStatus !== "critique") {
    return null;
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
        statusStyles[normalizedStatus] || "bg-slate-50 text-slate-600 ring-slate-200"
      }`}
    >
      <span className={`mr-1.5 h-2.5 w-2.5 rounded-full ${dotStyles[normalizedStatus] || "bg-slate-400"}`} />
      {statuses[normalizedStatus] || normalizedStatus}
    </span>
  );
}
