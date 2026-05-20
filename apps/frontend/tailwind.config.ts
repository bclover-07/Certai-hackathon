import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./store/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0e27",
          secondary: "#111638",
          card: "rgba(17, 22, 56, 0.7)",
        },
        accent: {
          blue: "#00d4ff",
          purple: "#7c3aed",
          emerald: "#10b981",
          pink: "#ec4899",
        },
        txt: {
          primary: "#e2e8f0",
          secondary: "#94a3b8",
        },
        glass: {
          bg: "rgba(255, 255, 255, 0.05)",
          border: "rgba(255, 255, 255, 0.1)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        heading: ["Outfit", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.6s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "spin-slow": "spin 8s linear infinite",
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "24px",
        "3xl": "48px",
      },
      boxShadow: {
        neon: "0 0 5px rgba(0, 212, 255, 0.3), 0 0 20px rgba(0, 212, 255, 0.15), 0 0 40px rgba(0, 212, 255, 0.08)",
        "neon-purple":
          "0 0 5px rgba(124, 58, 237, 0.3), 0 0 20px rgba(124, 58, 237, 0.15), 0 0 40px rgba(124, 58, 237, 0.08)",
        "neon-emerald":
          "0 0 5px rgba(16, 185, 129, 0.3), 0 0 20px rgba(16, 185, 129, 0.15), 0 0 40px rgba(16, 185, 129, 0.08)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [],
};

export default config;
