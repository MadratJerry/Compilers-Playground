import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const { NODE_ENV } = process.env
const OUTPUT_PATH = path.resolve(__dirname, 'dist')

const config = {
  mode: NODE_ENV,
  entry: path.resolve(__dirname, './src/index.tsx'),
  devtool: NODE_ENV === 'production' ? 'source-map' : 'cheap-module-source-map',
  output: {
    filename: '[name].bundle.js',
    path: OUTPUT_PATH,
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve('./src/public/index.html'),
      chunks: ['main'],
    }),
  ],
  devServer: {
    contentBase: OUTPUT_PATH,
    compress: true,
    port: 3000,
  },
}

export default config
