import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importPlugin from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: ["node_modules", "dist", "build", "out", "coverage", "**/lib.*/**", "*.config.{js,mjs,cjs,ts}", ".lintstagedrc.{js,mjs,cjs,ts}"],
        name: "root-eslint-config",
    },
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.stylisticTypeChecked,
    ...tseslint.configs.strict,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    eslintPluginPrettier,
    eslintConfigPrettier,
    {
        settings: {
            "import/resolver-next": [createTypeScriptImportResolver()],
        },
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "prettier/prettier": "warn",

            "sort-imports": "off",
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            "import/newline-after-import": "error",

            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-member-accessibility": "warn",
            "@typescript-eslint/consistent-type-exports": "error",
            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    fixStyle: "inline-type-imports",
                },
            ],
        },
    },
];
