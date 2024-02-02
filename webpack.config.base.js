const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const { WYWinJSDebugPlugin } = require("@wyw-in-js/webpack-loader");
const dev = process.env.NODE_ENV !== "production";
const HTMLPlugin = require("html-webpack-plugin");
const DynamicImportRecoveryPlugin = require("./plugins/DynamicImportRecoveryPlugin");
const DemoPlugin = require("./plugins/DemoPlugin");
const { publicPath } = require("webpack/lib/RuntimeGlobals");

module.exports = {
  entry: "./src/index.jsx",
  output: {
    path: path.resolve(__dirname, "output"),
    filename: "[name].bundle.js",
  },
  devtool: "source-map",
  resolve: {
    extensions: [".js", ".jsx", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              // babel 转义的配置选项
              babelrc: true,
              // targets: {
              //   edge: "17",
              //   firefox: "60",
              //   chrome: "67",
              //   safari: "11.1",
              // },
              // useBuiltIns: "usage",
              // // corejs: "3.6.5",
              // cacheDirectory: true,
            },
          },
          // {
          //   loader: require.resolve("@wyw-in-js/webpack-loader"),
          //   options: { sourceMap: dev },
          // },
        ],
      },
      {
        test: /\.css?$/,
        use: [
          {
            loader: !dev ? MiniCssExtractPlugin.loader : "style-loader",
          },
          {
            loader: "css-loader",
            options: { importLoaders: 1, sourceMap: true },
          },
          { loader: "postcss-loader", options: { sourceMap: true } },
        ],
      },
      { test: /\.html$/, use: ["html-loader"] },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 3 * 1024,
          },
        },
      },
    ],
  },
  optimization: {
    runtimeChunk: {
      name: "runtime",
    },
    splitChunks: {
      chunks: "all",
    },
  },
  stats: {
    modules: true, // 输出模块信息，包括 Module Graph
  },
  plugins: [
    new HTMLPlugin({ template: "./src/index.html" }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    // new DemoPlugin(),
    new DynamicImportRecoveryPlugin({ desc: "DynamicImportRecoveryPlugin" }),
  ],
};
