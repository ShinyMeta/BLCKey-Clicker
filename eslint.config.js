import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import babelParser from '@babel/eslint-parser'

export default [
  // add more generic rulesets here, such as:
  // js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  // ...pluginVue.configs['flat/vue2-recommended'], // Use this if you are using Vue.js 2.x.
  {
    rules: {
      // override/add rules settings here, such as:
      // 'vue/no-unused-vars': 'error'
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: 'module',
      globals: {
        ...globals.browser
      }
    }
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      parser: babelParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      },
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          plugins: ['@babel/plugin-syntax-import-attributes']
        }
      }
    }
  }
]