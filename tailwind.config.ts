import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F9FAF9", // off-white clinical background
        foreground: "#111816", // deep charcoal text
        card: "#FFFFFF",
        "card-foreground": "#111816",
        border: "#E2E8F0",
        forest: {
          50: "#f0fdf4",
          100: "#dcfce7",
          600: "#166534",
          800: "#14532d",
          900: "#0f382c", // deep forest green primary accent
          950: "#082119",
        },
        teal: {
          50: "#f0fdfa",
          500: "#14b8a6",
          700: "#0f766e",
          800: "#2a6f62", // muted teal accent
          900: "#134e4a",
        },
        charcoal: {
          500: "#64748b",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)",
        clinical: "0 4px 20px -2px rgba(15, 56, 44, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)",
        glow: "0 0 25px -5px rgba(15, 56, 44, 0.25)",
      },
      animation: {
        "pulse-subtle": "pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-sweep": "radarSweep 4s linear infinite",
      },
      keyframes: {
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
