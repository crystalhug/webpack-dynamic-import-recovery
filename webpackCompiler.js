const fs = require("fs");
const CircularJSON = require("circular-json"); // 防止循环引用
const webpackConfig = require("./webpack.config.testbundle");
const webpack = require("webpack");

const compiler = webpack(webpackConfig);

compiler.run((err, stats) => {
  writeFile(stats.toJson(stats.toJson()));
});

function writeFile(obj, output = "output-1") {
  try {
    fs.writeFileSync(`${output}.json`, CircularJSON.stringify(obj));
    console.log("Object has been written to file");
  } catch (err) {
    console.error("Error writing to file:", err);
  }
}
