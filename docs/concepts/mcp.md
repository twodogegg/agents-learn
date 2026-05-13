# MCP

MCP，全称是 Model Context Protocol，可以理解成 agent 连接外部工具、数据和工作流的一套标准协议。

如果只靠普通对话，模型能做的事情主要来自两部分：它训练时学到的知识，以及当前聊天窗口里给它的上下文。这个模式很快会遇到限制：它不知道你本地浏览器里发生了什么，也不能天然访问数据库、文件系统、设计稿、浏览器控制台或第三方服务。

MCP 的作用，就是在 agent 和外部系统之间放一层统一接口。agent 不需要为每个工具都学习一套特殊接法，只要客户端支持 MCP，就可以连接不同的 MCP server，让模型发现并调用这些能力。

## 它解决了什么问题

MCP 解决的核心问题是：怎样让 AI 应用稳定地接入外部能力。

没有 MCP 时，每接一个工具都像单独拉一根线。浏览器调试要一套接口，数据库查询要一套接口，设计工具要一套接口，本地文件又是另一套接口。工具多了以后，集成成本会越来越高，也很难迁移到其他客户端。

有了 MCP 后，外部能力会被包装成标准形态：

- `tools`：可执行动作，比如打开页面、截图、读取 console、分析网络请求。
- `resources`：可读取的上下文，比如文件、数据库 schema、文档片段。
- `prompts`：可复用的提示词模板或工作流入口。

这样 agent 面对的不是一堆零散插件，而是一组可以被发现、描述和调用的能力。

## 怎么理解 MCP server

MCP server 不是一个聊天机器人，而是一个能力提供者。

比如 `chrome-devtools-mcp` 这个 server，提供的是 Chrome DevTools 相关能力。它能让 coding agent 控制和检查一个真实的 Chrome 浏览器，包括：

- 打开页面和切换页面。
- 获取页面截图。
- 查看 console 报错。
- 检查 network 请求。
- 读取页面结构。
- 做 performance trace。

所以它特别适合前端调试。它不是为了普通网页浏览准备的，因为每一次快照、截图、DOM 信息和调试信息都会占用比较多 token。普通浏览可以用更轻量的 browser 或 Playwright；但遇到样式、控制台、网络和性能问题时，Chrome DevTools MCP 的定位更精准。

## 我的配置

我最后使用的是固定版本加隔离参数的配置：

```toml
[mcp_servers.chrome-devtools]
command = "npx"
args = [
  "-y",
  "chrome-devtools-mcp@0.26.0",
  "--isolated",
  "--no-usage-statistics",
  "--no-performance-crux",
]
```

这几个参数的含义：

- `chrome-devtools-mcp@0.26.0`：固定版本，避免每次使用 `latest` 带来不可控变化。
- `--isolated`：使用临时 Chrome 用户数据目录，浏览器关闭后自动清理，减少旧状态干扰。
- `--no-usage-statistics`：关闭使用统计上报。
- `--no-performance-crux`：关闭 performance trace 里向 CrUX API 发送 URL 的行为。

这里最重要的是：不要直接照着下面这种方式安装：

```bash
codex mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
```

这个命令本身是官方 README 里给 Codex 的简化安装方式，但我的实际经验是：前两轮对话还能用，后面一旦对话中断或 server 状态异常，就可能一直连不上。对学习和调试来说，稳定比追最新版本更重要。

## 我是怎么使用它的

这次我主要把它用在前端样式调试上。

一开始页面里有几个样式问题一直调不好。Codex 使用 Playwright 截图分析时，整体能做到大概 80 分：能看到页面长什么样，也能根据截图猜出问题方向。但是截图只能看到结果，不能直接告诉你某个样式到底来自哪条 CSS、哪个组件、哪个选择器。

后来我专门问 Codex：为什么 `chrome-devtools` 这个 MCP 总是断开。定位到配置问题后，我把安装方式改成上面的固定版本配置。

连上以后，调试方式就变了：

1. 先打开目标页面。
2. 用 DevTools 能力查看当前页面结构。
3. 定位具体元素。
4. 检查生效的样式来源。
5. 回到代码里精准修改。

这和只看截图最大的区别是：截图只能告诉我“这里看起来不对”，DevTools 可以告诉我“这里为什么不对”。

## 遇到的困难

第一个困难是连接不稳定。

刚开始我使用的是：

```bash
codex mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
```

这个方式安装很快，但它有两个问题：

- 使用 `latest`，版本可能变化，复现问题更困难。
- 对话中断后，MCP server 可能进入异常状态，后续一直连不上。

第二个困难是 fallback 工具能解决大部分问题，但很难解决最后几个细节。

当 `chrome-devtools` 连不上时，Codex 会退回用 Playwright 进行截图调试。这个方案不是不能用，很多布局问题确实能靠截图解决。但是一些细节问题，比如：

- 某个样式到底有没有生效。
- 哪条 CSS 被覆盖了。
- 元素真实宽高是多少。
- 页面状态变化后 DOM 有没有更新。
- console 里有没有隐藏报错。

这些只靠截图就比较慢，容易进入反复试错。

## 最后怎么解决

最终的解决方式是：不用临时 CLI add 的方式，而是直接写稳定的 MCP 配置，并固定版本。

也就是：

```toml
[mcp_servers.chrome-devtools]
command = "npx"
args = [
  "-y",
  "chrome-devtools-mcp@0.26.0",
  "--isolated",
  "--no-usage-statistics",
  "--no-performance-crux",
]
```

改完以后，Codex 可以重新稳定连接 `chrome-devtools`。接着它不再只凭截图猜，而是直接用 DevTools 定位元素和样式来源。最后那个一直调不准的样式问题，一次就改好了。

这次经验给我的结论是：

- MCP 不是越多越好，要按任务选择。
- `chrome-devtools-mcp` 很适合前端 debug，不适合拿来普通浏览网页。
- 复杂页面样式问题，截图只能辅助判断，DevTools 才能看到真实原因。
- 配置里固定版本，比直接使用 `latest` 更适合长期学习和复盘。
- 涉及隐私、浏览器内容和网络请求时，要注意 MCP server 能看到什么。

## 参考资料

- [Model Context Protocol 官方介绍](https://modelcontextprotocol.io/docs/getting-started/intro)
- [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)
