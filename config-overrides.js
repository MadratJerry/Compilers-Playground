const path = require('path')
const RewireReactHotLoader = require('react-app-rewire-hot-loader')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = module.exports = {
  webpack: function(config, env) {
    config = RewireReactHotLoader(config, env)
    config.plugins.push(new MonacoWebpackPlugin())
    config.resolve = {
      ...config.resolve,
      alias: { '@': path.resolve(__dirname, 'src') },
    }
    return config
  },
  jest: function(config) {
    config.moduleNameMapper = {
      ...config.moduleNameMapper,
      '^@/(.*)$': '<rootDir>/src/$1',
    }
    return config
  },
}
