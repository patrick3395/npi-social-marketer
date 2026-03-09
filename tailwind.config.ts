import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        npi: {
          blue: "#368ce2",
          "blue-dark": "#2a70b8",
          "blue-light": "#e8f1fc",
        },
      },
    },
  },
  plugins: [],
};
export default config;
