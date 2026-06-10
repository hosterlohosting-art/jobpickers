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
        background: '#ffffff',
        accent: {
          green: '#0CAA41',      // Glassdoor Signature Green
          greenHover: '#088F35',
          teal: '#1A4332',       // Premium Dark Teal for headers
          tealHover: '#133225'
        },
        slateText: {
          primary: '#111827',    // High-contrast near-black
          secondary: '#4B5563',  // Slate gray
          muted: '#6B7280'       // Muted gray
        },
        grayBg: '#F7F8FA',
        grayBorder: '#E5E7EB'
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
