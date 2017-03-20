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
        extensions: ['', '.js', '.jsx', '.scss', '.json'],
        modulesDirectories: ['node_modules'],
    },

    devtool: 'source-map',

    module: {
        loaders: [{
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract(
                    'style', // The backup style loader
                    'css?sourceMap!sass?sourceMap',
                ),
            },
            { test: /\.json$/, loader: 'json-loader' },
            { test: /\.png$/, loader: 'url?limit=65000&mimetype=image/png&name=[name].[ext]' },
            { test: /\.svg$/, loader: 'url?limit=65000&mimetype=image/svg+xml&name=[name].[ext]' },
            { test: /\.woff$/, loader: 'url?limit=65000&mimetype=application/font-woff&name=[name].[ext]' },
            { test: /\.woff2$/, loader: 'url?limit=65000&mimetype=application/font-woff2&name=[name].[ext]' },
            { test: /\.[ot]tf$/, loader: 'url?limit=65000&mimetype=application/octet-stream&name=[name].[ext]' },
            { test: /\.eot$/, loader: 'url?limit=65000&mimetype=application/vnd.ms-fontobject&name=[name].[ext]' },
            {
                test: /\.css$/,
                loaders: [
                    'style?sourceMap',
                    'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
                ],
            },
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
    plugins: [
        new ExtractTextPlugin('styles.css'),
    ],
};
