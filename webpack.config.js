const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: "./src/AutoLoadMore/widget/AutoLoadMore.ts",
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: "src/AutoLoadMore/widget/AutoLoadMore.js",
        libraryTarget:  "umd"
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
    devtool: "source-map",
    externals: [
        "mxui/widget/_WidgetBase",
        "dojo/aspect",
        "dojo/_base/declare",
        "dojo/dom-class",
        "dojo/dom-style",
        "dojo/dom-construct",
        "dijit/registry"
    ],
    plugins: [
        new CopyWebpackPlugin([
            { from: "src/**/*.js" },
            { from: "src/**/*.xml" }
        ], {
            copyUnmodified: true
        }),
        new ExtractTextPlugin({ filename: "./src/AutoLoadMore/widget/ui/AutoLoadMore.css" }),
        new webpack.LoaderOptionsPlugin({
            debug: true
        })
    ]
};
