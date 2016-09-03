const path = require('path');

module.exports = {

  entry: [
    './dunghd/content/src/scripts/index.jsx',
  ],

  output: {
    filename: 'content.js',
    path: path.join(__dirname, '../../app/', 'build'),
    publicPath: '/',
  },

  resolve: {
    extensions: ['', '.js', '.jsx', '.scss', '.json'],
    modulesDirectories: ['node_modules'],
  },

  module: {
    loaders: [
      {
        test: /\.(jsx|js)?$/,
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
