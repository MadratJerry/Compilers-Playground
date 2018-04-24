import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const { NODE_ENV } = process.env
const OUTPUT_PATH = path.resolve(__dirname, 'dist')

const config = {
  mode: NODE_ENV,
  devtool: NODE_ENV === 'production' ? 'source-map' : 'cheap-module-source-map',
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
