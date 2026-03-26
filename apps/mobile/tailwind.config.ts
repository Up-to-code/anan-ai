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
        background: "#FFFFFF",
        foreground: "#0F172A",
        primary: "#2563EB",
        "primary-soft": "#DBEAFE",
        card: "#FFFFFF",
        "card-foreground": "#0F172A",
        muted: "#F8FAFC",
        "muted-foreground": "#64748B",
        border: "#E2E8F0",
        accent: "#F8F5EF",
        "accent-foreground": "#0F172A",
        success: "#0F766E",

        // Legacy compat (if needed)
        brand: "#2563EB",
        ink: "#0F172A",
        surface: "#FFFFFF",
        line: "#E2E8F0",
        panel: "#F8FAFC",
        sand: "#F8F5EF",
      },
      borderRadius: {
        "3xl": "32px",
        "2xl": "24px",
        xl: "18px",
        lg: "12px",
      },
      fontFamily: {
        cairo: ["Cairo_400Regular", "sans-serif"],
        "cairo-medium": ["Cairo_500Medium", "sans-serif"],
        "cairo-bold": ["Cairo_700Bold", "sans-serif"],
        "cairo-black": ["Cairo_900Black", "sans-serif"],
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
