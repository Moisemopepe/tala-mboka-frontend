import { categories } from "../utils/categories.js";

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        type="button"
        onClick={() => onChange("")}
        className={`shrink-0 rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-sm transition ${
          value === "" ? "border-green-200 bg-green-50 text-green-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        Tous
      </button>
      {Object.entries(categories).map(([key, item]) => (
        <button
          type="button"
          key={key}
          onClick={() => onChange(key)}
          className={`shrink-0 rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-sm transition ${
            value === key ? "border-green-200 bg-green-50 text-green-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
