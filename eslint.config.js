import { fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';
import configPrettier from 'eslint-config-prettier';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import plunginReactRefresh from 'eslint-plugin-react-refresh';
import pluginReactConfigRecommended from 'eslint-plugin-react/configs/recommended.js';
import globals from 'globals';
import { dirname } from 'path';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    ...pluginReactConfigRecommended,
    ...pluginReactHooks.configs.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react: fixupPluginRules(pluginReactConfigRecommended.plugins.react),
      'react-hooks': fixupPluginRules(pluginReactHooks),
      'react-refresh': plunginReactRefresh,
    },
    rules: {
      ...pluginReactConfigRecommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      ...pluginReactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'error',
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    ignores: [
      'dist/*',
      'vite.config.ts',
      'eslint.config.js',
      'babel.config.js',
      'jest.config.ts',
    ],
  },
  configPrettier, // For disabling conflicting rules with Prettier, require as the last config
);
