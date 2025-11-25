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
    extend: {},
  },
  plugins: [],
}