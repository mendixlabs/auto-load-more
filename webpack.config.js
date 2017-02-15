const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const rootFilePath = "src/com/mendix/widget/autoloadmore/";
const fileName = "AutoLoadMore";

module.exports = {
    entry: "./" + rootFilePath + fileName + ".ts",
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: rootFilePath + fileName + ".js",
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
        "dijit/registry"
    ],
    plugins: [
        new CopyWebpackPlugin([
            { from: "src/**/*.js" },
            { from: "src/**/*.xml" }
        ], {
            copyUnmodified: true
        }),
        new ExtractTextPlugin({ filename: "./" + rootFilePath + "ui/" + fileName + ".css" }),
        new webpack.LoaderOptionsPlugin({
            debug: true
        })
    ]
};
