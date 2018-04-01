import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'

const OUTPUT_PATH = path.resolve(__dirname, 'dist')

const config = {
  mode: 'development',
  entry: {
    app: './index.js',
    'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
    'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
    'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
    'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
    'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
  },
  output: {
    filename: '[name].bundle.js',
    path: OUTPUT_PATH,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin(/^((fs)|(path)|(os)|(crypto)|(source-map-support))$/, /vs\/language\/typescript\/lib/),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve('./index.html'),
      chunks: ['app'],
    }),
  ],
  devServer: {
    contentBase: OUTPUT_PATH,
    compress: true,
    port: 3000,
  },
}

export default config
