/** @type {import('tailwindcss').Config} */

// Theme-aware colors: each maps to a CSS variable (an "R G B" triplet) defined in
// src/index.css for dark mode (the default) and overridden for [data-theme="light"].
// Components keep using the normal classes (bg-slate-900, text-white, text-blue-400...)
// and the palette flips underneath them. `<alpha-value>` keeps modifiers like /40 working.
const themed = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;
const themedScale = (color, shades) =>
  Object.fromEntries(shades.map((shade) => [shade, themed(`${color}-${shade}`)]));

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: themed('white'), // main text color - near-black in light mode
        'on-accent': '#ffffff', // text on solid blue buttons: white in both themes
        slate: themedScale('slate', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
        // Only the light tints used for text on dark backgrounds need darker light-mode versions
        blue: themedScale('blue', [300, 400, 950]),
        rose: themedScale('rose', [300, 400]),
        amber: themedScale('amber', [300, 400]),
        emerald: themedScale('emerald', [400]),
        orange: themedScale('orange', [400]),
      },
    },
  },
  plugins: [],
}
