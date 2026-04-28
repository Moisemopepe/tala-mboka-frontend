export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#16a34a",
        secondary: "#eab308",
        success: "#16a34a",
        danger: "#ef4444",
        warning: "#f97316",
        info: "#eab308",
        background: "#f9fafb",
        text: "#111827",
        mboka: {
          green: "#16a34a",
          yellow: "#eab308",
          red: "#ef4444",
          blue: "#2563eb",
          sky: "#0ea5e9"
        }
      },
      boxShadow: {
        soft: "0 10px 28px rgba(15, 23, 42, 0.07)"
      },
      fontFamily: {
        heading: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
};
