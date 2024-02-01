## 资源请求容灾

资源请求主要分为直接在 html 中通过 `script` 标签插入的请求，和 `Dynamic Import` 方式请求的资源，前者通过 `error` 事件在捕获阶段处理，后者则有点复杂，需要搞清楚 webpack runtime 如何进行 `Dynamic Import` 资源的调度，再次基础上做自定义插件兜底。

在了解 webpack 对 `Dynamic Import` 是如何调度的，就要先搞明白其打包产物是什么，可以参考随笔：【Webpack 中 Dynamic Import 打包产物是啥】https://juejin.cn/post/7325642452818952204 。了解产物之后，还需要稍微学习一些 webpack 源码知识，然后动起小手，写个小小的插件。
