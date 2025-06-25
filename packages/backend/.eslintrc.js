module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'eslint-config-prettier',
  ],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'off', // Console is common in server-side code
    'no-unused-vars': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-duplicate-imports': 'error',
    'consistent-return': 'warn',
    'no-implicit-globals': 'error',
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.test.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off', // Allow console in tests for debugging
      },
    },
  ],
};
