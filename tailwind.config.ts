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
        boardText: "#111827"
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
