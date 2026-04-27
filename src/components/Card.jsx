export default function Card({ as: Component = "section", className = "", children }) {
  return <Component className={`rounded-2xl border border-slate-100 bg-white shadow-soft ${className}`}>{children}</Component>;
}
