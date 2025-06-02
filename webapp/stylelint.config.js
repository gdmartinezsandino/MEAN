module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-tailwindcss',
    'stylelint-config-prettier'
  ],
  plugins: [
    'stylelint-order'
  ],
  rules: {
    // Optional: enforce order of properties
    'order/properties-alphabetical-order': true,

    // Optional: ensure no duplicate selectors, empty blocks, etc.
  },
  ignoreFiles: ['**/*.js', '**/*.ts', '**/*.json', 'node_modules/**']
};
