const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');

const env = process.env.NODE_ENV || 'development';
const isProduction = env !== 'development';
let sourceMap = '';
let plugins = [
  new ExtractTextPlugin('styles.css'),
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
  }),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(env),
  }),
];
if (isProduction) {
  sourceMap = 'source-map';
  plugins = plugins.concat([
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    // FIXME: production build fail on content.js
    // new webpack.optimize.UglifyJsPlugin({
    //   sourceMap: true,
    // }),
  ]);
} else {
  sourceMap = 'eval';
  plugins = plugins.concat([
    new webpack.LoaderOptionsPlugin({
      minimize: false,
      debug: true,
    }),
  ]);
}

module.exports = {

  entry: [
    './dunghd/content/src/scripts/index.jsx',
  ],

  output: {
    filename: 'content.js',
    path: path.join(__dirname, '../../app/', 'build'),
    publicPath: '/',
  },

  devtool: sourceMap,

  resolve: {
    extensions: ['.js', '.jsx', '.scss', '.json'],
    modules: ['node_modules'],
    alias: {
      jquery: 'jquery/src/jquery',
    },
  },

  module: {
    rules: [{
      test: /\.scss$/,
      use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader?sourceMap!sass-loader?sourceMap' }),
    },
    { test: /\.gif$/, loader: 'url-loader?limit=65000&mimetype=image/gif&name=[name].[ext]' },
    { test: /\.png$/, loader: 'url-loader?limit=65000&mimetype=image/png&name=[name].[ext]' },
    { test: /\.svg$/, loader: 'url-loader?limit=65000&mimetype=image/svg+xml&name=[name].[ext]' },
    { test: /\.woff$/, loader: 'url-loader?limit=65000&mimetype=application/font-woff&name=[name].[ext]' },
    { test: /\.woff2$/, loader: 'url-loader?limit=65000&mimetype=application/font-woff2&name=[name].[ext]' },
    { test: /\.[ot]tf$/, loader: 'url-loader?limit=65000&mimetype=application/octet-stream&name=[name].[ext]' },
    { test: /\.eot$/, loader: 'url-loader?limit=65000&mimetype=application/vnd.ms-fontobject&name=[name].[ext]' },
    {
      test: /\.css$/,
      use: [
        {
          loader: 'style-loader?sourceMap',
        },
        {
          loader: 'css-loader?modules&importrules=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
        },
      ],
    },
    {
      test: /\.(jsx|js)?$/,
      use: [
        {
          loader: 'babel-loader',
          options: { presets: ['es2015', 'react'] },
        },
      ],
      exclude: /(node_modules)/,
      include: path.join(__dirname, 'src'),
    },
    ],
  },
  plugins,
};
