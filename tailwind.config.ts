import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#09090B",
          elevated: "#18181B",
          card: "#1F1F22",
        },
        accent: {
          DEFAULT: "#FF3B3B",
          hover: "#E62E2E",
          dim: "#7A1C1C",
        },
        success: {
          DEFAULT: "#22C55E",
          dim: "#14532D",
        },
        muted: "#A1A1AA",
        border: "#27272A",
      },
      fontFamily: {
        display: ["var(--font-display)", "Bebas Neue", "Impact", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        pulseSoft: "pulseSoft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
