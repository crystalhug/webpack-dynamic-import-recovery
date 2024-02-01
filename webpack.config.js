const devWebpackConfig = require("./webpack.config.dev.js");
const proWebpackConfig = require("./webpack.config.production.js");
const isProduction = process.env.NODE_ENV === "production"; // 使用全局变量查看当前环境

module.exports = isProduction ? proWebpackConfig : devWebpackConfig;
