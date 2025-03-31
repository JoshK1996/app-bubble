module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb-typescript/base', // Airbnb style guide for TypeScript (base doesn't include React rules)
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended', // Integrates Prettier with ESLint
  ],
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  parserOptions: {
    project: './tsconfig.json', // Point ESLint to your tsconfig.json
    tsconfigRootDir: __dirname, 
    ecmaVersion: 2022, // Allows modern ECMAScript features
    sourceType: 'module', // Allows using import/export statements
  },
  env: {
    node: true, // Defines Node.js global variables and Node.js scoping.
    jest: true, // Adds Jest global variables for testing
  },
  rules: {
    'prettier/prettier': 'error', // Show prettier errors as ESLint errors
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_|^next$' }], // Warn about unused vars, ignore _ and next
    '@typescript-eslint/no-explicit-any': 'warn', // Warn against using `any` type
    'import/prefer-default-export': 'off', // Allow named exports without default export
    'class-methods-use-this': 'off', // Allow class methods that don't use `this`
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }], // Allow console.warn/error/info, warn on console.log
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.ts',
          '**/*.spec.ts',
          '**/*.integration.test.ts',
          'jest.config.js',
          'jest.integration.config.js', 
          'src/tests/**', // Allow dev deps in test setup files
        ],
        optionalDependencies: false,
      },
    ],
    // Add any project-specific rule overrides here
  },
  settings: {
    'import/resolver': {
      typescript: { 
          project: './tsconfig.json'
      }, 
      node: true, // Ensure node module resolution still works
    },
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    '*.js', // Ignore compiled JS files if any
    '*.d.ts', // Ignore declaration files
    'tsoa.json', // Ignore tsoa generated file
    'src/routes.ts', // Ignore tsoa generated routes file
  ],
}; 