export default function Card({ as: Component = "section", className = "", children }) {
  return <Component className={`rounded-xl border border-slate-200/70 bg-white shadow-sm ${className}`}>{children}</Component>;
}
