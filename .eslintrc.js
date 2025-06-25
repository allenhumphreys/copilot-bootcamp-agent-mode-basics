module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  overrides: [
    {
      // Frontend React configuration
      files: ['packages/frontend/**/*.{js,jsx}'],
      env: {
        browser: true,
        es6: true,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'prettier',
      ],
      plugins: ['react', 'react-hooks', 'jsx-a11y', 'prettier'],
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        'prettier/prettier': 'error',
        'react/prop-types': 'warn',
        'react/no-unused-prop-types': 'warn',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'jsx-a11y/anchor-is-valid': 'warn',
        'no-console': 'warn',
      },
    },
    {
      // Backend Node.js configuration
      files: ['packages/backend/**/*.js'],
      env: {
        node: true,
        es2022: true,
      },
      extends: ['eslint:recommended', 'prettier'],
      plugins: ['prettier'],
      rules: {
        'prettier/prettier': 'error',
        'no-console': 'off', // Allow console in backend
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
    {
      // Test files configuration
      files: ['**/*.test.js', '**/__tests__/**/*.js'],
      env: {
        jest: true,
        node: true,
      },
      extends: ['eslint:recommended', 'prettier'],
      plugins: ['prettier'],
      rules: {
        'prettier/prettier': 'error',
        'no-console': 'off',
      },
    },
  ],
};
