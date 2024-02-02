const { Template, RuntimeGlobals } = require("webpack");
const JsonpChunkLoadingRuntimeModule = require("webpack/lib/web/JsonpChunkLoadingRuntimeModule");

module.exports = class DynamicImportRecoveryPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(
      "RuntimeLoadDeferredChunksPlugin",
      (compilation) => {
        function generate() {
          const { runtimeTemplate } = compilation;

          const fn = RuntimeGlobals.ensureChunkHandlers;

          return Template.asString([
            Template.asString([
              "var retryCount = 0;",
              "",
              `${fn}.j = ${runtimeTemplate.basicFunction(
                `chunkId, promises${""}`,
                Template.indent([
                  "// JSONP chunk loading for javascript",
                  `var installedChunkData = ${RuntimeGlobals.hasOwnProperty}(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;`,
                  'if(installedChunkData !== 0) { // 0 means "already installed".',
                  Template.indent([
                    "",
                    '// a Promise means "currently loading".',
                    "if(installedChunkData) {",
                    Template.indent(["promises.push(installedChunkData[2]);"]),
                    "} else {",
                    Template.indent([
                      `if("runtime" != chunkId) {`,
                      Template.indent([
                        "// setup Promise in chunk cache",
                        `var promise = new Promise(${runtimeTemplate.expressionFunction(
                          `installedChunkData = installedChunks[chunkId] = [resolve, reject]`,
                          "resolve, reject"
                        )});`,
                        "promises.push(installedChunkData[2] = promise);",
                        "",
                        "// start chunk loading",
                        `var url = ${RuntimeGlobals.publicPath} + ${RuntimeGlobals.getChunkScriptFilename}(chunkId);`,
                        "// create error before stack unwound to get useful stacktrace later",
                        "var error = new Error();",
                        `var loadingEnded = ${runtimeTemplate.basicFunction(
                          "event",
                          [
                            `if(${RuntimeGlobals.hasOwnProperty}(installedChunks, chunkId)) {`,
                            Template.indent([
                              "installedChunkData = installedChunks[chunkId];",
                              "if (installedChunkData && installedChunkData !== 0) {",
                              "if(retryCount < 1) {",
                              Template.indent([
                                "// retryCount 只是举例子可以添加容灾请求次数等限制",
                                `${
                                  RuntimeGlobals.loadScript
                                }(url, loadingEnded, "chunk-" + chunkId, chunkId${""});`,
                                "return;",
                              ]),
                              "}",
                              "}",
                              "if(installedChunkData !== 0) installedChunks[chunkId] = undefined;",
                              "if(installedChunkData) {",
                              Template.indent([
                                "var errorType = event && (event.type === 'load' ? 'missing' : event.type);",
                                "var realSrc = event && event.target && event.target.src;",
                                "error.message = 'Loading chunk ' + chunkId + ' failed.\\n(' + errorType + ': ' + realSrc + ')';",
                                "error.name = 'ChunkLoadError';",
                                "error.type = errorType;",
                                "error.request = realSrc;",
                                "installedChunkData[1](error);",
                              ]),
                              "}",
                            ]),
                            "}",
                          ]
                        )};`,
                        "",
                        "// 强行执行错误，为了测试 loadingEnded 中的容灾逻辑",
                        `${
                          RuntimeGlobals.loadScript
                        }(url + "error", loadingEnded, "chunk-" + chunkId, chunkId${""});`,
                      ]),
                      "} else installedChunks[chunkId] = 0;",
                    ]),
                    "}",
                  ]),
                  "}",
                ])
              )};`,
            ]),
            "",
          ]);
        }

        compilation.hooks.runtimeModule.tap(
          "RuntimeLoadDeferredChunksPlugin",
          (module, chunk) => {
            if (module instanceof JsonpChunkLoadingRuntimeModule) {
              // Intercepting the JsonpChunkLoadingRuntimeModule so that we can change its output
              const origGenerate = module.generate.bind(module);

              module.generate = () => {
                const result = origGenerate();
                const newResult = generate();

                return [result, newResult].join("\n");
              };
            }
          }
        );
      }
    );
  }
};
