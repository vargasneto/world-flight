import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f6f4ef",
        foreground: "#171717",
        panel: "#ffffff",
        accent: "#0f766e",
        route: "#2563eb",
        warning: "#b45309",
      },
      boxShadow: {
        panel: "0 18px 60px rgba(17, 24, 39, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
