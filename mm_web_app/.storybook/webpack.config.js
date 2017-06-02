// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add addional webpack configurations.
// For more information refer the docs: https://getstorybook.io/docs/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to 'React Create App'. This only has babel loader to load JavaScript.

const path = require('path');
const webpack = require('webpack');
const env = process.env.NODE_ENV || 'development';

module.exports = {
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
        include: path.resolve(__dirname, '..'),
      },
      { test: /\.gif$/, loader: 'url-loader?limit=65000&mimetype=image/gif&name=[name].[ext]' },
      { test: /\.png$/, loader: 'url-loader?limit=65000&mimetype=image/png&name=[name].[ext]' },
      { test: /\.svg$/, loader: 'url-loader?limit=65000&mimetype=image/svg+xml&name=[name].[ext]' },
      { test: /\.woff$/, loader: 'url-loader?limit=65000&mimetype=application/font-woff&name=[name].[ext]' },
      { test: /\.woff2$/, loader: 'url-loader?limit=65000&mimetype=application/font-woff2&name=[name].[ext]' },
      { test: /\.[ot]tf$/, loader: 'url-loader?limit=65000&mimetype=application/octet-stream&name=[name].[ext]' },
      { test: /\.eot$/, loader: 'url-loader?limit=65000&mimetype=application/vnd.ms-fontobject&name=[name].[ext]' },
    ],
  },
};
