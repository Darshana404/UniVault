import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // UniVault brand colors matching the presentation
        brand: {
          teal: "#2DD4BF",
          navy: "#1E3A5F",
          dark: "#0F172A",
          blue: "#3B82F6",
        },
      },
    },
  },
  plugins: [],
};

export default config;