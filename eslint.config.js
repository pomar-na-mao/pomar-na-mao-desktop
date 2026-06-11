// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    ignores: ["src-tauri/**/*", "dist/**/*", "release/**/*", "src/environments/*.ts", "coverage/**/*"]
  },
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        project: [
          "./tsconfig.serve.json",
          "./src/tsconfig.app.json",
          "./src/tsconfig.spec.json",
        ],
        createDefaultProgram: true,
      },
    },
    rules: {
      "prefer-arrow/prefer-arrow-functions": 0,
      "@angular-eslint/directive-selector": 0,
      "@angular-eslint/prefer-on-push-component-change-detection": "off",
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "no-underscore-dangle": 0,
      "@typescript-eslint/naming-convention": 0,
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
    ],
    rules: {},
  }
);
