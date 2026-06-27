import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta corporativa Advance Group
        brand: {
          navy: "#15294B",      // Primario — fondos, hero, texto fuerte
          navyDark: "#0E1C36",  // Profundidad / secciones oscuras
          steel: "#4A5E7E",     // Secundario
          slate: "#7C8BA1",     // Acentos
          mist: "#B7C1D1",      // Bordes / texto muted sobre oscuro
          ink: "#0A0A0A",       // Negro corporativo
          paper: "#F5F7FA",     // Fondo claro de secciones
        },
      },
      fontFamily: {
        // Gotham es la tipografía de marca (paga). Montserrat es el sustituto web.
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        display: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      container: {
        center: true,
        padding: { DEFAULT: "1.25rem", lg: "2rem" },
        screens: { "2xl": "1280px" },
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
