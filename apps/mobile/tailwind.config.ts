import type { Config } from "tailwindcss";
// NativeWind ships a JS preset without a TS module declaration.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const preset = require("nativewind/preset");

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  presets: [preset],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#09090B", // zinc-950
        primary: "#2563EB", // blue-600
        "primary-soft": "#EFF6FF", // blue-50
        card: "#FFFFFF",
        "card-foreground": "#09090B",
        muted: "#F4F4F5", // zinc-100
        "muted-foreground": "#71717A", // zinc-500
        border: "#E4E4E7", // zinc-200
        accent: "#2563EB",
        "accent-foreground": "#FFFFFF",
        "accent-secondary": "#52525B", // zinc-600
        success: "#16A34A",

        // Unify legacy mappings into the Blue/Zinc scale
        "sport-lime": "#2563EB",
        "sport-orange": "#2563EB",
        "sport-blue": "#2563EB",
        "sport-teal": "#2563EB",

        // Dark mode specific (Zinc series)
        "dark-canvas": "#09090B", // zinc-950
        "dark-elevated": "#18181B", // zinc-900
        "dark-surface": "#09090B",
        "dark-border": "#27272A", // zinc-800
        "dark-ink": "#FAFAFA", // zinc-50

        // Legacy compat
        brand: "#2563EB",
        ink: "#09090B",
        surface: "#FFFFFF",
        line: "#E4E4E7",
        panel: "#F4F4F5",
        sand: "#FFFFFF",
      },
      borderRadius: {
        "3xl": "20px", // Soft card boundaries
        "2xl": "16px",
        xl: "12px",
        lg: "8px",
        md: "6px",
      },
      fontFamily: {
        cairo: ["Cairo_400Regular", "sans-serif"],
        "cairo-medium": ["Cairo_500Medium", "sans-serif"],
        "cairo-bold": ["Cairo_700Bold", "sans-serif"],
        "cairo-black": ["Cairo_900Black", "sans-serif"],
      },
      letterSpacing: {
        tighter: "-0.05em",
        normal: "0em",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em", // No longer extreme values
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
