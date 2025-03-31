module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'jest.config.js', 'dist', 'node_modules'],
  rules: {
    // Allow console logs for development
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    // Enforce consistent import sorting
    'import/order': [
      'error',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        'alphabetize': { order: 'asc' },
      },
    ],
    // Allow named exports only
    'import/prefer-default-export': 'off',
    // Maximum line length
    'max-len': ['error', { code: 100, ignoreComments: true, ignoreUrls: true }],
    // Enforce semicolons
    '@typescript-eslint/semi': ['error', 'always'],
    // Enforce consistent function return types
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      },
    ],
    // Enforce consistent member delimiter style for interfaces and type literals
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
      },
    ],
  },
}; 