import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EFF2ED",
        surface: "#FFFFFF",
        ink: "#16261F",
        forest: {
          DEFAULT: "#1F5C46",
          dark: "#123A2C",
          light: "#2E7A5B",
        },
        gold: {
          DEFAULT: "#B8892B",
          light: "#E7C77C",
        },
        brick: "#A6432E",
        line: "#D8DDD4",
        muted: "#5B6B60",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(22,38,31,0.04), 0 4px 16px rgba(22,38,31,0.06)",
        seal: "inset 0 0 0 2px rgba(184,137,43,0.5)",
      },
      borderRadius: {
        card: "14px",
      },
      backgroundImage: {
        "seal-radial": "radial-gradient(circle, rgba(184,137,43,0.14) 0%, rgba(184,137,43,0) 70%)",
      },
    },
  },
  plugins: [],
};

export default config;
