const { NODE_ENV } = process.env;
const IS_DEV = NODE_ENV === 'development';
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { theme } = require('./exportWebpackConfig');

module.exports = function(cssModules, type) {
  let cssLoaderOptions = {
    sourceMap: IS_DEV,
  };
  if (cssModules) {
    cssLoaderOptions.modules = {
      localIdentName: IS_DEV ? '[path][name]__[local]--[hash:base64:5]' : '[hash:base64]',
    };
  }
  let config = [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: cssLoaderOptions,
    },
    {
      loader: 'postcss-loader',
      options: {
        plugins: [require('autoprefixer')],
      },
    },
  ];
  if (type === 'scss') {
    config.push({
      loader: 'sass-loader',
      options: {
        implementation: require('sass'),
        sourceMap: IS_DEV,
      },
    });
  } else {
    let lessOptions = {
      sourceMap: IS_DEV,
      javascriptEnabled: true,
    };
    if (theme) {
      lessOptions.modifyVars = theme;
    }
    config.push({
      loader: 'less-loader',
      options: lessOptions,
    });
  }

  return config;
};
