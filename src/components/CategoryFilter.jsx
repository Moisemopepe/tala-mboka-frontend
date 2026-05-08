import { categories } from "../utils/categories.js";
import { getAppOptionLabels } from "../utils/appOptionI18n.js";

const primaryCategories = ["residential", "commercial", "government", "utility", "transport", "communication", "health", "education", "public_space", "other"];

export default function CategoryFilter({ value, onChange, language = "en" }) {
  const labels = getAppOptionLabels(language).categories;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        type="button"
        onClick={() => onChange("")}
        className={`shrink-0 rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-sm transition ${
          value === "" ? "border-green-200 bg-green-50 text-green-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        {labels.all}
      </button>
      {primaryCategories.map((key) => {
        const item = categories[key];
        return (
        <button
          type="button"
          key={key}
          onClick={() => onChange(key)}
          className={`shrink-0 rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-sm transition ${
            value === key ? "border-green-200 bg-green-50 text-green-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {labels[key] || item.label}
        </button>
        );
      })}
    </div>
  );
}
