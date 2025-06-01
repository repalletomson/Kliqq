module.exports = {
  env: {
    browser: true,
    es2021: true, // Enable ES2021 syntax
    node: true,
  },
  parserOptions: {
    "ecmaVersion": 2021,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
    "object-curly-spacing": ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],

    "indent": ["error", 2],
    "no-trailing-spaces": "error",
    "arrow-parens": ["error", "always"],
    "padded-blocks": ["error", "never"],
    "max-len": ["warn", { "code": 145}]

  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
// {
//   "root": true,
//   "env": {
//       "node": true
//   },
//   "extends": [
//       "eslint:recommended",
//       "google"
//   ],
//   "rules": {
//       "quotes": ["error", "double"]
//   }
// }
// export default {
//     env: {
//       node: true,
//       es2020: true,
//     },
//     extends: ['eslint:recommended', 'google'],
//     parserOptions: {
//       ecmaVersion: 2020,
//       sourceType: 'module',
//     },
//     rules: {
//       // Custom rules if needed
//     },
//   };
  