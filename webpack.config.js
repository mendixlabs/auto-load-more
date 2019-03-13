const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const widgetConfig = {
    entry: "./src/AutoLoadMore/widget/AutoLoadMore.ts",
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: "src/AutoLoadMore/widget/AutoLoadMore.js",
        libraryTarget: "amd"
    },
    resolve: {
        extensions: [ ".ts", ".js", ".json" ],
        alias: {
            "tests": path.resolve(__dirname, "./tests")
        }
    },
    module: {
        rules: [
            { test: /\.ts$/, use: "ts-loader" },
            { test: /\.css$/, loader: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader"
            }) }
        ]
    },
    mode: "development",
    devtool: "source-map",
    externals: [ /^mxui\/|^mendix\/|^dojo\/|^dijit\// ],
    plugins: [
        new CopyWebpackPlugin([
            { from: "src/**/*.js" },
            { from: "src/**/*.xml" }
        ], { copyUnmodified: true }),
        new ExtractTextPlugin({ filename: "./src/AutoLoadMore/widget/ui/AutoLoadMore.css" })
    ]
};

const previewConfig = {
    entry: "./src/AutoLoadMore/widget/AutoLoadMore.webmodeler.ts",
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: "src/AutoLoadMore/widget/AutoLoadMore.webmodeler.js",
        libraryTarget: "commonjs"
    },
    resolve: {
        extensions: [ ".ts", ".js" ]
    },
    module: {
        rules: [
            { test: /\.ts$/, use: "ts-loader" },
            { test: /\.css$/, use: "css-loader" }
        ]
    },
    mode: "development",
    devtool: "inline-source-map",
    externals: [ "react", "react-dom" ]
};

module.exports = [ widgetConfig, previewConfig ];
