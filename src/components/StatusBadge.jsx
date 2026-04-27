import { statuses } from "../utils/categories.js";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200"
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${
        statusStyles[status] || "bg-slate-50 text-slate-700 ring-slate-200"
      }`}
    >
      {statuses[status] || status}
    </span>
  );
}
