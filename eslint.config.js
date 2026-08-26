import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

const typescriptRules = {
  ...tseslint.configs.recommended.rules,
  "@typescript-eslint/explicit-function-return-type": [
    "error",
    {
      allowExpressions: true,
    },
  ],
};

export default [
  {
    ignores: [
      ".git/**",
      ".venv/**",
      "dist/**",
      "apps/web/dist/**",
      "node_modules/**",
    ],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: js.configs.recommended.rules,
  },
  {
    files: ["scripts/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.scripts.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: typescriptRules,
  },
  {
    files: ["packages/typescript/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./packages/typescript/trace-contracts/tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: typescriptRules,
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        project: "./apps/web/tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: typescriptRules,
  },
  eslintConfigPrettier,
];
