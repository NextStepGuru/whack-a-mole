module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  globals: {
    "chrome": true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    'standard',
    // 'plugin:@typescript-eslint/recommended',
    'plugin:vue/recommended',
    'prettier',
    'prettier/vue'
  ],
  // required to lint *.vue files
  plugins: [
    'vue',
    'prettier'
  ],
  // add your custom rules here
  rules: {
    // '@typescript-eslint/indent': ['error', 2],
    'no-multiple-empty-lines': ['error', {max: 2}],
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0
  }
}
