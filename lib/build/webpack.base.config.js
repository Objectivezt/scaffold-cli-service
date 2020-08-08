const Webpack = require('webpack');
const os = require('os');
const path = require('path');
const HappyPack = require('happypack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const autoprefixer = require('autoprefixer');

const { PROJECT_PATH } = require('../config/getPathConfig');
const { name, description } = require(path.join(PROJECT_PATH, './package.json'));
const {
  JSAryUrl,
  CssAryUrl,
  ScriptStringAfter,
  ScriptStringBefore,
} = require('../config/libCdnConfig');
const { theme } = require('../config/exportWebpackConfig');
const babelLoaderConfig = require('../config/babelLoaderConfig');

const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const { NODE_ENV, WEBPACK_SVG, SPRITE_SVG, ANALYZER } = process.env;

const IS_DEV = NODE_ENV == 'development';

const CSS_LESS_REGEXP = /\.(less|css)$/;
const CSS_LESS_MODULE_REGEXP = /\.module\.(less|css)$/;
const JS_REGEXP = /\.(js|jsx|ts|tsx)$/;
const IMG_REGEXP = /\.(png|jpe?g|gif|woff|woff2|ttf|eot|svg|ico)$/;
const WEBPACK_SVG_REGEXP = new RegExp(`.${WEBPACK_SVG || 'webpack'}.svg(\\?v=\\d+.\\d+.\\d+)?$`);
const SPRITE_SVG_REGEXP = new RegExp(`.${SPRITE_SVG || 'sprite'}.svg$`);

const EXCLUDE_SCAFFOLD_COMMON_REGEXP = new RegExp(`node_modules\\${path.sep}(?!@scaffold|antd)`);

module.exports = {
  mode: NODE_ENV,
  devtool: 'eval-source-map', // https://webpack.js.org/configuration/devtool/#root
  stats: 'errors-warnings', // https://webpack.js.org/configuration/stats/#root
  context: PROJECT_PATH,
  entry: {
    index: path.join(PROJECT_PATH, './src/index.js'),
  },
  output: {
    filename: IS_DEV ? 'js/[name].js' : 'js/[name].[hash:8].js',
    chunkFilename: IS_DEV ? 'js/[name].js' : 'js/[name].[hash:8].js',
    path: path.join(PROJECT_PATH, './dist'), // 打包到dist目录下
    publicPath: '/',
    jsonpFunction: `webpackJsonp_${name}`,
  },
  optimization: {
    runtimeChunk: false,
  },
  module: {
    rules: [
      // JS TS 转化
      {
        test: JS_REGEXP,
        exclude: EXCLUDE_SCAFFOLD_COMMON_REGEXP,
        use: ['happypack/loader?id=js', 'eslint-loader'],
      },
      // 样式转化
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
              sourceMap: IS_DEV,
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-flexbugs-fixes'),
                autoprefixer({
                  flexbox: 'no-2009',
                }),
              ],
            },
          },
        ],
      },
      {
        test: /\.less$/,
        exclude: [/node_modules/],
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: require.resolve('css-loader'),
            options: {
              sourceMap: IS_DEV,
              modules: {
                localIdentName: IS_DEV
                  ? '[path][name]__[local]--[hash:base64:5]----2'
                  : '[hash:base64]----1',
              },
            },
          },
          {
            loader: require.resolve('less-loader'),
            options: {
              sourceMap: IS_DEV,
              javascriptEnabled: true,
              modifyVars: theme,
            },
          },
        ],
      },
      {
        test: /\.less$/,
        exclude: [/src/, EXCLUDE_SCAFFOLD_COMMON_REGEXP],
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: require.resolve('css-loader'),
          },
          {
            loader: require.resolve('less-loader'),
            options: {
              javascriptEnabled: true,
              modifyVars: theme,
            },
          },
        ],
      },
      // 图片文件转换
      {
        test: IMG_REGEXP,
        exclude: EXCLUDE_SCAFFOLD_COMMON_REGEXP,
        use: [
          {
            loader: 'url-loader',
            options: {
              esModule: false,
              limit: 2048,
              name: 'images/[name].[hash:8].[ext]',
            },
          },
        ],
      },
      // 文件加载
      {
        exclude: [
          EXCLUDE_SCAFFOLD_COMMON_REGEXP,
          /\.html$/,
          /\.json$/,
          JS_REGEXP,
          IMG_REGEXP,
          CSS_LESS_REGEXP,
          CSS_LESS_MODULE_REGEXP,
        ],
        loader: 'file-loader',
        options: {
          limit: 10000,
          name: 'assets/[name].[hash:8].[ext]',
        },
      },
      // svg 处理
      {
        test: SPRITE_SVG_REGEXP,
        exclude: EXCLUDE_SCAFFOLD_COMMON_REGEXP,
        loader: 'svg-sprite-loader',
      },
      {
        test: WEBPACK_SVG_REGEXP,
        exclude: [EXCLUDE_SCAFFOLD_COMMON_REGEXP, SPRITE_SVG_REGEXP],
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: '@svgr/webpack',
            options: {
              native: false,
              babel: false,
              icon: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // 文件头
    new Webpack.BannerPlugin({
      banner:
        'hash:[hash], chunkhash:[chuckhash], name:[name], filebase:[filebase], query:[query],file:[file]',
    }),
    // style
    new MiniCssExtractPlugin({
      filename: IS_DEV ? 'css/[name].css' : 'css/[contenthash:8].css',
      chunkFilename: IS_DEV ? 'css/[name].css' : 'css/[contenthash:8].css',
    }),
    // html
    new HtmlWebpackPlugin({
      context: PROJECT_PATH,
      filename: 'index.html', // 打包出来的文件名
      template: './public/index.html',
      hash: true, // 在引用资源的后面增加hash
      inject: true, // 将js文件插入body的底部
      favicon: './public/favicon.ico',
      title: description,
      JSAryUrl: JSAryUrl,
      CssAryUrl: CssAryUrl,
      ScriptStringAfter: ScriptStringAfter,
      ScriptStringBefore: ScriptStringBefore,
      minify: {
        html5: true,
        collapseWhitespace: !IS_DEV,
        preserveLineBreaks: false,
        minifyCSS: true,
        minifyJS: true,
        removeComments: !IS_DEV,
      },
    }),
    // 环境变量
    new Webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
    // 包分析
    ANALYZER === 'true'
      ? new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerHost: '127.0.0.1',
          analyzerPort: 8888,
          reportFilename: 'report.html',
          openAnalyzer: true,
          statsFilename: 'stats.json',
          statsOptions: null,
          logLevel: 'info',
          defaultSizes: 'parsed',
          generateStatsFile: false,
        })
      : () => {},
    // webpack增效
    new HappyPack({
      id: 'js',
      loaders: [babelLoaderConfig()],
      threadPool: happyThreadPool,
      verbose: true, // 输出日志
    }),
    // 文件索引
    new ManifestPlugin({
      fileName: './asset-manifest.json',
    }),
    // DLL
    new Webpack.DllReferencePlugin({
      manifest: require(path.resolve(
        __dirname,
        '../../',
        `./dll/vendor${IS_DEV ? '.dev' : ''}-manifest.json`,
      )),
    }),
    // 文件复制
    new CopyWebpackPlugin([
      {
        from: path.join(PROJECT_PATH, './src/assets/'),
        to: path.join(PROJECT_PATH, './dist/assets/'),
      },
      {
        from: path.join(PROJECT_PATH, './public'),
        to: path.join(PROJECT_PATH, './dist'),
      },
    ]),
  ],
  resolve: {
    alias: {
      '@': path.join(PROJECT_PATH, 'src'),
      '@assets': path.join(PROJECT_PATH, 'src/assets/'),
      '@common': path.join(PROJECT_PATH, 'src/common/'),
      '@components': path.join(PROJECT_PATH, 'src/components/'),
      '@containers': path.join(PROJECT_PATH, 'src/containers/'),
      '@layouts': path.join(PROJECT_PATH, 'src/layouts/'),
      '@models': path.join(PROJECT_PATH, 'src/models/'),
      '@services': path.join(PROJECT_PATH, 'src/services/'),
      '@styles': path.join(PROJECT_PATH, 'src/styles/'),
      '@utils': path.join(PROJECT_PATH, 'src/utils/'),
      '@setting': path.join(PROJECT_PATH, 'src/setting/'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.less'],
    modules: ['node_modules', 'src'],
  },
};
