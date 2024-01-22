import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import forms from "@tailwindcss/forms";
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gray: colors.neutral,
      },
    },
  },
  plugins: [forms],
} satisfies Config;
