/* eslint-disable */
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
        "unused-imports",
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    rules: {
        'arrow-parens': 'off',
        "unused-imports/no-unused-imports": "warn",
        indent: [
            'error',
            4,
            { SwitchCase: 1 },
        ],
        '@typescript-eslint/indent': [
            'error',
            4,
            {
                'SwitchCase': 1
            },
        ],
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: [
                    '.js',
                    '.ts',
                ],
                paths: [
                    '.',
                ],
            },
            typescript: {},
        },
    },
};