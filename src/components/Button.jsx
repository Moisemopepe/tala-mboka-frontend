const variants = {
  primary: "bg-green-700 text-white shadow-sm hover:bg-green-800",
  success: "bg-green-700 text-white shadow-sm hover:bg-green-800",
  danger: "bg-danger text-white shadow-sm hover:bg-red-600",
  secondary: "bg-info text-slate-950 shadow-sm hover:bg-yellow-400",
  ghost: "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-green-200 hover:bg-green-50 hover:text-green-700"
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
