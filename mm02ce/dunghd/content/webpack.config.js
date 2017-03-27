const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

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
        extensions: ['.js', '.jsx', '.scss', '.json'],
        modules: ['node_modules'],
    },

    devtool: 'source-map',

    module: {
        rules: [{
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader?sourceMap!sass-loader?sourceMap' }),
            },
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
    plugins: [
        new ExtractTextPlugin('styles.css'),
    ],
};
