// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    files: [
      'src/screens/**/*.{js,ts,tsx}',
      'src/components/**/*.{js,ts,tsx}',
      'src/features/**/components/**/*.{js,ts,tsx}',
      'src/app/**/*.{js,ts,tsx}',
      'src/navigation/**/*.{js,ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/services/mock/**', '**/services/repository', '**/fixtures/**'],
              message: 'UI uses feature hooks; data drivers belong behind the repository.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/model/**/*.{js,ts}', 'src/lib/**/*.{js,ts}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: ['react', 'react-native', 'expo-router'], patterns: ['@react-native-*/*'] },
      ],
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
