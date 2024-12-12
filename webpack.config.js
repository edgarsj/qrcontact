const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[contenthash].js',
        clean: true,
        assetModuleFilename: 'assets/[name][ext]'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader, // Extracts CSS into separate files
                    'css-loader' // Translates CSS into CommonJS
                ]
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif|ico|webmanifest)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[name][ext]'
                }
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'styles.[contenthash].css' // This will be the output CSS filename
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            favicon: path.resolve(__dirname, 'src/assets/favicon.ico'),
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: false,
                removeScriptTypeAttributes: false,
                removeStyleLinkTypeAttributes: false,
                useShortDoctype: true
            }
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000,
        host: '0.0.0.0',
        allowedHosts: 'all'
    },
};
