// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const unusedImports = require('eslint-plugin-unused-imports');

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/*', '.expo/*'] },
  {
    plugins: { 'unused-imports': unusedImports },
    rules: {
      'react/no-unescaped-entities': 'off',
      'unused-imports/no-unused-imports': 'error',
    },
  },
]);

