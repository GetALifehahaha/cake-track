/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx}", // This looks inside the app FOLDER
    "./components/**/*.{js,jsx}",     // Removed ts/tsx since you aren't using them
    "./screens/**/*.{js,jsx}",        // Recommendation: Add other common folders
    "./src/**/*.{js,jsx}",            // Recommendation: Add src if you use it
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#8B5A3C",
        secondary: {
          "strong": "#A67C52",
          "light": "#BE9B7B"
        },
        main: {
          "form": "#FFFCF8"
        },
      }
    },
  },
  "plugins": ["nativewind/expo-linear-gradient"]
}