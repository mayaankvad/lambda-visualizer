const globals = require("globals");
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = [
    {
        ignores: ["dist/", "eslint.config.cjs"],
    },

    eslint.configs.recommended,

    ...tseslint.configs.recommended,

    {
        files: ["**/*.js", "**/*.ts"],

        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",

            globals: {
                ...globals.node,
            },
        },

        rules: {
            quotes: ["error", "double"],
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                    destructuredArrayIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/no-explicit-any": "off",
            "no-console": "warn",
            "no-warning-comments": [
                "warn",
                {
                    terms: ["todo", "fixme"],
                    location: "anywhere",
                },
            ],
            "max-len": [
                "warn",
                {
                    code: 120,
                    ignoreComments: true,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                    ignoreRegExpLiterals: true,
                },
            ],
            "no-trailing-spaces": "error",
        },
    },
];
