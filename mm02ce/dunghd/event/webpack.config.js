const path = require('path');
const webpack = require('webpack');

const env = process.env.NODE_ENV || 'development';
const isProduction = env !== 'development';
let sourceMap = '';
let plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(env),
  }),
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
  }),
];
if (isProduction) {
  sourceMap = 'source-map';
  plugins = plugins.concat([
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
    }),
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
    './dunghd/event/src/index.js',
  ],

  output: {
    filename: 'event.js',
    path: path.join(__dirname, '../../app/', 'build'),
  },

  devtool: sourceMap,

  resolve: {
    extensions: ['.js', '.json'],
    modules: ['node_modules'],
    alias: {
      jquery: 'jquery/src/jquery',
      'stacktrace-js': 'stacktrace-js/stacktrace',
    },
  },

  module: {
    rules: [
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
