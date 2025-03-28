import globals from "globals";
import pluginJs from "@eslint/js";
import prettier from 'eslint-config-prettier';
import pluginJest from 'eslint-plugin-jest';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {languageOptions: { globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.jest,
    }},
    plugins: {
      jest: pluginJest,
    },
    extends: ['plugin:jest/recommended', 'plugin:jest/style'],
  },
  pluginJs.configs.recommended,
  prettier,
];