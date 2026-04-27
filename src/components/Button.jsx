const variants = {
  primary: "bg-primary text-white shadow-soft shadow-blue-900/10 hover:bg-blue-700",
  success: "bg-success text-white shadow-soft shadow-emerald-900/10 hover:bg-emerald-700",
  danger: "bg-danger text-white shadow-soft shadow-red-900/10 hover:bg-red-700",
  secondary: "bg-secondary text-slate-950 shadow-soft shadow-yellow-900/10 hover:bg-yellow-300",
  ghost: "border border-slate-200 bg-white text-slate-800 hover:border-primary/40 hover:bg-blue-50 hover:text-primary"
};

const sizes = {
  sm: "min-h-10 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base"
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition active:scale-[0.99] disabled:pointer-events-none disabled:bg-slate-300 disabled:text-white ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
