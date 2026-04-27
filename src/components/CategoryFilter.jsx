import { categories } from "../utils/categories.js";

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        type="button"
        onClick={() => onChange("")}
        className={`shrink-0 rounded-xl border px-3.5 py-2 text-sm font-black shadow-sm transition ${
          value === "" ? "border-primary bg-blue-50 text-primary" : "border-slate-200 bg-white text-slate-700"
        }`}
      >
        Tous
      </button>
      {Object.entries(categories).map(([key, item]) => (
        <button
          type="button"
          key={key}
          onClick={() => onChange(key)}
          className={`shrink-0 rounded-xl border px-3.5 py-2 text-sm font-black shadow-sm transition ${
            value === key ? "border-primary bg-blue-50 text-primary" : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
