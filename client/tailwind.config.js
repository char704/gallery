/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        canvas: "#f6f1ea",
        surface: "#fffdf9",
        vellum: "#ebe2d7",
        mist: "#f4f7f4",
        ink: {
          DEFAULT: "#151a1e",
          soft: "#364047",
          muted: "#65717b"
        },
        pine: {
          DEFAULT: "#1f6f63",
          dark: "#174d45",
          light: "#dcebe7"
        },
        lagoon: {
          DEFAULT: "#2f6f88",
          dark: "#1f5065",
          light: "#dceaf0"
        },
        marigold: {
          DEFAULT: "#d9942e",
          dark: "#a86717",
          light: "#f8e4ba"
        }
      },
      boxShadow: {
        soft: "0 14px 40px rgba(21, 26, 30, 0.08)",
        gallery: "0 24px 70px rgba(21, 26, 30, 0.16)"
      }
    }
  },
  plugins: []
};
