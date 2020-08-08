const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ZipWebpackPlugin = require('zip-webpack-plugin');
const { PROJECT_PATH } = require('../config/getPathConfig');

module.exports = {
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      { from: path.join(PROJECT_PATH, './public'), to: path.join(PROJECT_PATH, './dist') },
    ]),
    new ZipWebpackPlugin({
      path: path.join(PROJECT_PATH, './'),
      filename: 'dist.zip',
      pathPrefix: '',
    }),
  ],
  stats: 'normal', // 输出所有异常时候打印输出
};
