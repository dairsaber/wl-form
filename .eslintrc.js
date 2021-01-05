module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["eslint:recommended", "plugin:vue/base", "typescript", "standard"],
  plugins: ["vue", "@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "@typescript-eslint/no-explicit-any": ["off"]
  }
};
