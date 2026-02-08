import js from "@eslint/js";

export default [
    // Base recommended rules
    js.configs.recommended,

    {
        ignores: [
            "public/js/**",
            "e2e/**",
            "playwright-report/**",
            "coverage/**",
            "generate-coverage.js",
        ],
    },

    // Node.js / CommonJS files
    {
        files: [
            "**/*.js",
            "**/*.cjs",
            "jest.config.js",
        ],
        languageOptions: {
            globals: {
                require: "readonly",
                module: "readonly",
                exports: "readonly",
                process: "readonly",
                __dirname: "readonly",
                console: "readonly",
                URL: "readonly",
            },
        },
    },

    // Browser-side JavaScript
    {
        files: ["public/js/**/*.js"],
        languageOptions: {
            globals: {
                document: "readonly",
                window: "readonly",
                fetch: "readonly",
                setTimeout: "readonly",
                confirm: "readonly",
                console: "readonly",
            },
        },
    },

    // Jest unit tests
    {
        files: ["tests/**/*.js"],
        languageOptions: {
            globals: {
                describe: "readonly",
                it: "readonly",
                expect: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
                jest: "readonly",
                console: "readonly",
                require: "readonly",
                process: "readonly",
                __dirname: "readonly",
            },
        },
    },
];
