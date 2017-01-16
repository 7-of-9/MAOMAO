const path = require('path');

module.exports = {

  entry: [
    './dunghd/event/src/index.js',
  ],

  output: {
    filename: 'event.js',
    path: path.join(__dirname, '../../app/', 'build'),
  },

  devtool: 'source-map',

  resolve: {
    extensions: ['', '.js', '.json'],
    modulesDirectories: ['node_modules'],
  },

  module: {
    loaders: [
      // { test: require.resolve('moment'), loader: 'expose-loader?moment' },
      // { test: require.resolve('underscore'), loader: 'expose-loader?_!expose-loader?underscore' },
      // { test: require.resolve('jquery'), loader: 'expose-loader?$!expose-loader?jQuery' },
      // { test: require.resolve('underscore'), loader: 'expose-loader?_!expose-loader?underscore' },
      {
        test: /\.(js)?$/,
        loader: 'babel',
        exclude: /(node_modules)/,
        include: path.join(__dirname, 'src'),
        query: {
          presets: ['es2015', 'react'],
        },
      },
    ],
  },
};
