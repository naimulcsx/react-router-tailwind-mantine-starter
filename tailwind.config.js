/** @type {import('tailwindcss').Config} */
import tailwindPresetMantine from "tailwind-preset-mantine";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx,mdx}"],
  presets: [tailwindPresetMantine()],
};
