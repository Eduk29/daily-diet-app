import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["projects/**/*"],
}, {
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.jasmine,
            ...globals.node,
        },
    },
}, ...compat.extends(
    "plugin:prettier/recommended",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@angular-eslint/recommended",
    "plugin:@angular-eslint/template/process-inline-templates",
).map(config => ({
    ...config,
    files: ["**/*.ts"],
})), {
    files: ["**/*.ts"],

    rules: {
        "@angular-eslint/directive-selector": ["error", {
            type: "attribute",
            prefix: "",
            style: "camelCase",
        }],

        "@angular-eslint/component-selector": ["error", {
            type: "element",
            prefix: "",
            style: "kebab-case",
        }],

        "prettier/prettier": ["error", {
            endOfLine: "auto",
        }],

        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "error",
    },
}, ...compat.extends(
    "plugin:@angular-eslint/template/recommended",
    "plugin:@angular-eslint/template/accessibility",
).map(config => ({
    ...config,
    files: ["**/*.html"],
})), {
    files: ["**/*.html"],
    rules: {},
}, ...compat.extends("plugin:prettier/recommended").map(config => ({
    ...config,
    files: ["**/*.html"],
    ignores: ["**/*inline-template-*.component.html"],
})), {
    files: ["**/*.html"],
    ignores: ["**/*inline-template-*.component.html"],

    rules: {
        "prettier/prettier": ["error", {
            parser: "angular",
        }],
    },
}];
