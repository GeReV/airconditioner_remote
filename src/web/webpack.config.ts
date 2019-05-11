import * as webpack from "webpack";
import * as path from "path";
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';

const devMode = process.env.NODE_ENV !== 'production';

const config: webpack.Configuration = {
    target: 'web',

    entry: [
        "./js/index.ts",
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: "bundle.js",
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
        new HtmlWebpackPlugin({
            title: 'airconditioner-remote',
            chunksSortMode: 'dependency',
            template: path.resolve(__dirname, './index.html')
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
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
                include: path.resolve(__dirname, "js"),
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

};

export default config;