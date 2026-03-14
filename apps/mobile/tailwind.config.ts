import type { Config } from "tailwindcss";
// NativeWind ships a JS preset without a TS module declaration.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const preset = require("nativewind/preset");

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [preset],
  theme: {
    extend: {
      colors: {
        brand: "#2563EB",
        ink: "#0F172A",
        surface: "#FFFFFF",
        line: "#E2E8F0",
        muted: "#64748B",
        panel: "#F8FAFC",
      },
      fontFamily: {
        cairo: ["Cairo_400Regular", "sans-serif"],
        "cairo-bold": ["Cairo_700Bold", "sans-serif"],
      },
      spacing: {
        4.5: "18px",
        18: "72px",
      },
    },
  },
  plugins: [],
};

export default config;
