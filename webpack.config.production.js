const merge = require("webpack-merge").merge;
const baseWebpackConfig = require("./webpack.config.base.js");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = merge(baseWebpackConfig, {
  mode: "production",
  module: {
    rules: [],
  },
  optimization: {
    runtimeChunk: {
      name: "runtime",
    },
    splitChunks: {
      hidePathInfo: true,
    },
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
      new CssMinimizerPlugin(), // 这个插件使用 cssnano 优化和压缩 CSS，内置了 cssnano
    ],
    // minimize: true, // 将在开发环境也开启优化，否则只在生产环境开启，当然，要将 minimizer 配置到 dev 中去，当前只配置在 production 中
  },
});
