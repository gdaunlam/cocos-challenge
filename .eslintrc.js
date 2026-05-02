module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'no-unused-imports': 'error',
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          unknown: "Use a specific type instead of 'unknown'. Define your environment interface.",
        },
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
  ],
};