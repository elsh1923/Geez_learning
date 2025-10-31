/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/app/**/*.{js,ts,jsx,tsx}",
      "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#059669", // Brana emerald
          secondary: "#FFD700", // Gold accent
        },
        keyframes: {
          glow: {
            "0%, 100%": { boxShadow: "0 0 20px rgba(250,204,21,0.35)" },
            "50%": { boxShadow: "0 0 40px rgba(250,204,21,0.6)" },
          },
          float: {
            "0%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-6px)" },
            "100%": { transform: "translateY(0)" },
          },
          fadeUp: {
            "0%": { opacity: 0, transform: "translateY(12px)" },
            "100%": { opacity: 1, transform: "translateY(0)" },
          },
          shine: {
            "0%": { backgroundPosition: "0% 50%" },
            "100%": { backgroundPosition: "100% 50%" },
          },
        },
        animation: {
          glow: "glow 2.2s ease-in-out infinite",
          float: "float 5s ease-in-out infinite",
          "fade-up": "fadeUp 700ms ease-out both",
          shine: "shine 2s linear infinite",
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  };
  