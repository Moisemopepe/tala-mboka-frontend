const statusStyles = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  verified: "bg-green-50 text-green-700 ring-green-200",
  rejected: "bg-red-50 text-red-700 ring-red-200"
};

const dotStyles = {
  pending: "bg-amber-500",
  verified: "bg-green-600",
  rejected: "bg-red-500"
};

const labels = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected"
};

export default function StatusBadge({ status = "pending", showNeutral = true }) {
  if (!showNeutral && status === "verified") {
    return null;
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
        statusStyles[status] || "bg-slate-50 text-slate-600 ring-slate-200"
      }`}
    >
      <span className={`mr-1.5 h-2.5 w-2.5 rounded-full ${dotStyles[status] || "bg-slate-400"}`} />
      {labels[status] || status}
    </span>
  );
}
