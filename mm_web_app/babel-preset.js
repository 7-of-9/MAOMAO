// babel-preset.js

const preset = require('next/babel')

preset.plugins = removeStyledJsx(preset.plugins)

module.exports = preset

function removeStyledJsx (plugins) {
  return plugins.filter(plugin => plugin.indexOf('styled-jsx') === -1)
}
