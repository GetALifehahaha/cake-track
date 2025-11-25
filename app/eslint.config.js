// https://docs.expo.dev/guides/using-eslint/
const expo = require('eslint-config-expo');

module.exports = [
  ...expo, 
  {
    // Fix: Explicitly ignore these build folders
    ignores: ['dist/*', '.expo/*', 'web-build/*'],
  },
  {
    // Optional: Custom rules since you are using JS
    files: ["**/*.js", "**/*.jsx"],
    rules: {
      "no-unused-vars": "warn", // Helpful for JS development
      "react/react-in-jsx-scope": "off", // Not needed in React Native
    },
  }
];