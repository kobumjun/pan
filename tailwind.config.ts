import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        boardBg: "#f5f5f5",
        boardBorder: "#d4d4d4",
        boardHeader: "#e4e4e4",
        boardText: "#111827",
        pan: {
          page: "#f7f7f8",
          card: "#ffffff",
          accent: "#4a3f6b",
          "accent-hover": "#3d3458",
          "accent-soft": "#edeaf3"
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Noto Sans KR",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
