import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import boundaries from 'eslint-plugin-boundaries';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      boundaries: boundaries,
    },
    settings: {
      'boundaries/elements': [
        { type: 'infrastructure', pattern: 'src/services/infrastructure/**/*' },
        { type: 'services', pattern: 'src/services/**/*' },
        { type: 'types', pattern: 'src/types/**/*' },
        { type: 'utils', pattern: 'src/utils/**/*' },
        { type: 'context', pattern: 'src/context/**/*' },
        { type: 'hooks', pattern: 'src/hooks/**/*' },
        { type: 'components', pattern: 'src/components/**/*' },
        { type: 'pages', pattern: 'src/pages/**/*' },
        { type: 'test', pattern: 'src/test/**/*' },
      ],
    },
    rules: {
      'no-undef': 'off',
      'prefer-const': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      // A11y: enforced as errors
      'jsx-a11y/label-has-associated-control': ['error', { assert: 'either', depth: 3 }],
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      'jsx-a11y/no-autofocus': ['error', { ignoreNonDOM: true }],
      'jsx-a11y/anchor-is-valid': 'error',

      // Architectural boundaries
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'pages',
              allow: [
                'components',
                'hooks',
                'context',
                'services',
                'utils',
                'types',
                'infrastructure',
                'test',
              ],
            },
            {
              from: 'components',
              allow: [
                'components',
                'hooks',
                'context',
                'services',
                'utils',
                'types',
                'infrastructure',
                'test',
              ],
            },
            {
              from: 'hooks',
              allow: ['hooks', 'context', 'services', 'utils', 'types', 'infrastructure', 'test'],
            },
            {
              from: 'context',
              allow: ['context', 'services', 'utils', 'types', 'infrastructure', 'test'],
            },
            { from: 'services', allow: ['services', 'utils', 'types', 'infrastructure', 'test'] },
            { from: 'utils', allow: ['utils', 'types', 'infrastructure', 'test'] },
            { from: 'infrastructure', allow: ['infrastructure', 'utils', 'types'] },
            {
              from: 'test',
              allow: [
                'test',
                'components',
                'hooks',
                'context',
                'services',
                'utils',
                'types',
                'infrastructure',
                'pages',
              ],
            },
          ],
        },
      ],
    },
  },

  eslintConfigPrettier,
);
