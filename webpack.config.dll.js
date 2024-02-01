// webpack.config.dll.js
const path = require("path");
const webpack = require("webpack");
// 这里是第三方依赖库
const vendors = ["react", "react-dom"];
module.exports = {
  mode: "production",
  entry: {
    // 定义程序中打包公共文件的入口文件vendor.js
    vendor: vendors,
  },
  output: {
    filename: "[name]_[fullhash].js",
    // 这里是使用将 verdor 作为 library 导出，并且指定全局变量名字是[name]_[contenthash]
    library: "[name]_[fullhash]",
  },
  plugins: [
    new webpack.DllPlugin({
      context: __dirname,
      name: "[name]_[fullhash]",
      path: path.join(__dirname, "manifest.json"),
    }),
  ],
};
