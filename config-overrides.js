const RewireReactHotLoader = require('react-app-rewire-hot-loader')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = function override(config, env) {
  config = RewireReactHotLoader(config, env)
  config.plugins.push(new MonacoWebpackPlugin())
  return config
}
