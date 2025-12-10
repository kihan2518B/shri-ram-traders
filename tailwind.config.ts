import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "class"], // Enable class-based dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5", // Indigo-600
          hover: "#4338CA", // Indigo-700
          disabled: "#818CF8", // Indigo-400
          ring: "#6366F1", // Indigo-500 (focus ring)
        },
        neutral: {
          white: "#FFFFFF", // White
          light: "#F9FAFB", // Gray-50
          border: "#D1D5DB", // Gray-300
          text: "#374151", // Gray-700
          heading: "#1F2A44", // Gray-800
          disabled: "#D1D5DB", // Gray-300 (disabled input bg)
        },
        accent: {
          red: "#DC2626", // Red-600
          "red-hover": "#B91C1C", // Red-800
        },
        navy: {
          500: "#1E3A8A", // Primary button focus
          600: "#1E40AF", // Primary button
          700: "#1E3A8A", // Primary button hover
          800: "#1E2A78", // Headings
          900: "#172554", // Text
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#666666",
          subtle: "#808080",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        button: {
          DEFAULT: "#1A1A1A",
          hover: "#333333",
          text: "#FFFFFF",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      screens: {
        small: "400px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
