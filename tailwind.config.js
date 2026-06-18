/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#070a13',
        accent: {
          green: '#10b981',      // Glowing Emerald Green
          greenHover: '#059669',
          teal: '#0a0d18',       // Deep Midnight Slate for headers/panels
          tealHover: '#13192c'
        },
        slateText: {
          primary: '#f3f4f6',    // High-contrast near-white
          secondary: '#a1a1aa',  // Light zinc gray
          muted: '#71717a'       // Muted zinc gray
        },
        grayBg: '#0f1423',       // Dark graphite card base
        grayBorder: '#1e293b'    // Deep slate borders
      },
      borderRadius: {
        lg: "var(--radius-lg, 12px)",
        md: "var(--radius-md, 8px)",
        sm: "var(--radius-sm, 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
}
