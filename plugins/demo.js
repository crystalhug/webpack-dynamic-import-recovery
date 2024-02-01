const Template = require("webpack/lib/Template");
const RuntimeGlobals = require("webpack/lib/RuntimeGlobals");
const RuntimeModule = require("webpack/lib/RuntimeModule");
const { getInitialChunkIds } = require("webpack/lib/javascript/StartupHelpers");
const chunkHasJs =
  require("webpack").javascript.JavascriptModulesPlugin.chunkHasJs;

// TODO: tap callback 执行先于 JsonpChunkLoadingRuntimeModule，但生成代码位置相反，导致无法覆盖
class MyPlugin {
  apply(compiler) {
    compiler.hooks.make.tap("MyPlugin", (compilation) => {
      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.ensureChunkHandlers)
        // .for(compilation.runtimeTemplate, "JsonpChunkLoadingRuntimeModule")
        .tap("MyPlugin", (chunk, set) => {
          set.add(RuntimeGlobals.ensureChunkHandlers);
          if (chunk.hasRuntime()) {
            const runtimeModule = new MyRuntimeModule(set);
            compilation.addRuntimeModule(chunk, runtimeModule);
            return runtimeModule;
          }
        });
    });
  }
}

class MyRuntimeModule extends RuntimeModule {
  constructor(runtimeRequirements) {
    super("jsonp chunk MyRuntimeModule demo", RuntimeModule.STAGE_ATTACH);
    this._runtimeRequirements = runtimeRequirements;
  }

  generate() {
    const compilation = /** @type {Compilation} */ (this.compilation);
    const {
      runtimeTemplate,
      outputOptions: {
        chunkLoadingGlobal,
        hotUpdateGlobal,
        crossOriginLoading,
        scriptType,
      },
    } = compilation;
    const globalObject = runtimeTemplate.globalObject;
    const chunkLoadingGlobalExpr = `${globalObject}[${JSON.stringify(
      chunkLoadingGlobal
    )}]`;
    const withLoading = this._runtimeRequirements.has(
      RuntimeGlobals.ensureChunkHandlers
    );
    const withCallback = this._runtimeRequirements.has(
      RuntimeGlobals.chunkCallback
    );
    const withOnChunkLoad = this._runtimeRequirements.has(
      RuntimeGlobals.onChunksLoaded
    );
    const withFetchPriority = this._runtimeRequirements.has(
      RuntimeGlobals.hasFetchPriority
    );
    const withHmr = this._runtimeRequirements.has(
      RuntimeGlobals.hmrDownloadUpdateHandlers
    );
    const stateExpression = withHmr
      ? `${RuntimeGlobals.hmrRuntimeStatePrefix}_jsonp`
      : undefined;
    const fn = RuntimeGlobals.ensureChunkHandlers;
    const chunkGraph = /** @type {ChunkGraph} */ (this.chunkGraph);
    const chunk = /** @type {Chunk} */ (this.chunk);
    const initialChunkIds = getInitialChunkIds(chunk, chunkGraph, chunkHasJs);
    // const initialChunkIds = ["runtime"];
    // test add code
    return Template.asString([
      `var installedChunks = ${
        stateExpression ? `${stateExpression} = ${stateExpression} || ` : ""
      }{`,
      Template.indent(
        Array.from(initialChunkIds, (id) => `${JSON.stringify(id)}: 0`).join(
          ",\n"
        )
      ),
      "};",
      "",
      withLoading
        ? Template.asString([
            `${fn}.j = ${runtimeTemplate.basicFunction(
              `chunkId, promises${withFetchPriority ? ", fetchPriority" : ""}`,
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
                            "if(installedChunkData !== 0) installedChunks[chunkId] = undefined;",
                            "if(installedChunkData) {",
                            Template.indent([
                              "var errorType = event && (event.type === 'load' ? 'missing' : event.type);",
                              "var realSrc = event && event.target && event.target.src;",
                              "error.message = 'Loading chunk ' + chunkId + ' failed.\\n(' + errorType + ': ' + realSrc + ')';",
                              "error.name = 'ChunkLoadErrorlalalalala';",
                              "error.type = errorType;",
                              "error.request = realSrc;",
                              "installedChunkData[1](error);",
                            ]),
                            "}",
                          ]),
                          "}",
                        ]
                      )};`,
                      `${
                        RuntimeGlobals.loadScript
                      }(url, loadingEnded, "chunk-" + chunkId, chunkId${
                        withFetchPriority ? ", fetchPriority" : ""
                      });`,
                    ]),
                    "} else installedChunks[chunkId] = 0;",
                  ]),
                  "}",
                ]),
                "}",
              ])
            )};`,
          ])
        : "// no chunk on demand loading",
      "",
      withOnChunkLoad
        ? `${
            RuntimeGlobals.onChunksLoaded
          }.j = ${runtimeTemplate.returningFunction(
            "installedChunks[chunkId] === 0",
            "chunkId"
          )};`
        : "// no on chunks loaded",
      "",
      withCallback || withLoading
        ? Template.asString([
            "// install a JSONP callback for chunk loading",
            `var webpackJsonpCallback = ${runtimeTemplate.basicFunction(
              "parentChunkLoadingFunction, data",
              [
                runtimeTemplate.destructureArray(
                  ["chunkIds", "moreModules", "runtime"],
                  "data"
                ),
                '// add "moreModules" to the modules object,',
                '// then flag all "chunkIds" as loaded and fire callback',
                "var moduleId, chunkId, i = 0;",
                `if(chunkIds.some(${runtimeTemplate.returningFunction(
                  "installedChunks[id] !== 0",
                  "id"
                )})) {`,
                Template.indent([
                  "for(moduleId in moreModules) {",
                  Template.indent([
                    `if(${RuntimeGlobals.hasOwnProperty}(moreModules, moduleId)) {`,
                    Template.indent(
                      `${RuntimeGlobals.moduleFactories}[moduleId] = moreModules[moduleId];`
                    ),
                    "}",
                  ]),
                  "}",
                  `if(runtime) var result = runtime(${RuntimeGlobals.require});`,
                ]),
                "}",
                "if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);",
                "for(;i < chunkIds.length; i++) {",
                Template.indent([
                  "chunkId = chunkIds[i];",
                  `if(${RuntimeGlobals.hasOwnProperty}(installedChunks, chunkId) && installedChunks[chunkId]) {`,
                  Template.indent("installedChunks[chunkId][0]();"),
                  "}",
                  "installedChunks[chunkId] = 0;",
                ]),
                "}",
                withOnChunkLoad
                  ? `return ${RuntimeGlobals.onChunksLoaded}(result);`
                  : "",
              ]
            )}`,
            "",
            `var chunkLoadingGlobal = ${chunkLoadingGlobalExpr} = ${chunkLoadingGlobalExpr} || [];`,
            "chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));",
            "chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));",
          ])
        : "// no jsonp function",
    ]);
  }
}

module.exports = MyPlugin;
