export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0B5ED7",
        secondary: "#FFD60A",
        success: "#198754",
        danger: "#DC3545",
        background: "#F8FAFC",
        text: "#1E293B",
        mboka: {
          green: "#198754",
          yellow: "#FFD60A",
          red: "#DC3545",
          blue: "#0B5ED7",
          sky: "#0B5ED7"
        }
      },
      boxShadow: {
        soft: "0 12px 30px rgba(15, 23, 42, 0.08)"
      },
      fontFamily: {
        heading: ["Poppins", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
