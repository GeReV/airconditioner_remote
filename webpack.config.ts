import * as webpack from "webpack";
import * as path from "path";
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';

const devMode = process.env.NODE_ENV !== 'production';

const config: webpack.Configuration = {
    mode: devMode ? 'development' : 'production',

    target: 'web',

    entry: [
        "./src/web/js/index.ts",
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: "bundle.[hash].js",
        chunkFilename: "[id].[contenthash].chunk.js",
        publicPath: devMode ? '/' : '/assets/',
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".js"]
    },

    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'airconditioner-remote',
            chunksSortMode: 'dependency',
            template: path.resolve(__dirname, './src/web/index.html')
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].[hash].css',
            chunkFilename: '[id].[hash].css',
        }),
    ],

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            {
                test: /\.ts$/,
                use: [
                    "ts-loader"
                ],
                exclude: path.resolve(__dirname, 'node_modules'),
                include: path.resolve(__dirname, 'src/web/js'),
            },
            {
                test: /\.scss$/,
                // @ts-ignore
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            //   hmr: process.env.NODE_ENV === 'development',
                        },
                    },
                    'css-loader',
                    'postcss-loader',
                    'sass-loader',
                ]
            }
        ]
    },

    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
    }
};

export default config;