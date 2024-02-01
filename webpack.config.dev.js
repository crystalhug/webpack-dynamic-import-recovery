const merge = require("webpack-merge").merge;
const baseWebpackConfig = require("./webpack.config.base.js");

module.exports = merge(baseWebpackConfig, {
  mode: "development",
  devServer: {
    port: 9000,
    hot: true,
  },
});
