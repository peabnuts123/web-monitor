module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    "eslint:recommended",
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "semi": 2,
    "no-console": 2,
    "eol-last": 2,
  },
};
