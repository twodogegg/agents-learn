# Claude 和 Codex 的插件安装

Claude Code 和 Codex 都有自己的插件市场。这里的重点不是手动把 skill 文件复制到目录里，而是通过官方 plugin marketplace 安装。插件通常会把 skills、MCP servers、外部 app 集成一起打包。

## Claude Code

Claude Code 使用 `/plugin` 命令管理插件市场。

官方 Anthropic 市场默认可用。打开 Claude Code 后运行：

```text
/plugin
```

进入发现页后，可以浏览、安装和管理插件。

也可以直接安装官方市场里的插件：

```text
/plugin install github@claude-plugins-official
```

如果提示找不到插件，先更新官方市场：

```text
/plugin marketplace update claude-plugins-official
```

如果本地还没有官方市场，添加它：

```text
/plugin marketplace add anthropics/claude-plugins-official
```

Claude 也支持添加第三方 marketplace：

```text
/plugin marketplace add owner/repo
```

添加以后再安装：

```text
/plugin install plugin-name@marketplace-name
```

安装后，如果当前会话没有立刻看到插件变化，运行：

```text
/reload-plugins
```

常用管理命令：

```text
/plugin marketplace list
/plugin marketplace update marketplace-name
/plugin marketplace remove marketplace-name
/plugin enable plugin-name@marketplace-name
/plugin disable plugin-name@marketplace-name
/plugin uninstall plugin-name@marketplace-name
```



### Claude 插件自动更新

Claude Code 的 plugin auto-update 是按 marketplace 设置的。启用后，Claude Code 启动时会刷新 marketplace 数据，并把已安装插件更新到最新版本。如果有插件被更新，会提示你运行：

```text
/reload-plugins
```

在 UI 里开启：

1. 运行 `/plugin`
2. 进入 Marketplaces
3. 选择一个 marketplace
4. 选择 Enable auto-update

官方 Anthropic marketplace 默认开启 auto-update。第三方 marketplace 和本地开发 marketplace 默认关闭。

团队项目也可以在 `.claude/settings.json` 里给 marketplace 显式开启：

![Codex 插件配置示例](/images/claude-codex-install/codex-plugin-settings.png)

```json
{
  "extraKnownMarketplaces": {
    "team-tools": {
      "source": {
        "source": "github",
        "repo": "your-org/claude-plugins"
      },
      "autoUpdate": true
    }
  }
}
```

![Claude Code 插件 marketplace 列表](/images/claude-codex-install/claude-plugin-marketplaces.png)

如果你关闭了 Claude Code 自身自动更新，但仍想保留插件自动更新，设置：

```bash
export DISABLE_AUTOUPDATER=1
export FORCE_AUTOUPDATE_PLUGINS=1
```

Claude 的安装范围有三种：

- 用户范围：给自己所有项目使用
- 项目范围：写入项目配置，团队协作使用
- 本地范围：只在当前仓库自己使用

官方文档：

- https://code.claude.com/docs/zh-CN/discover-plugins

## Codex

Codex 使用 Plugins 安装可复用能力。插件可以包含 skills、apps 和 MCP servers。

在 Codex app 里，打开：

```text
Plugins
```

然后搜索或浏览插件，进入详情页，点击安装。官方文档里写的是：在 app 里选择加号或 Add to Codex。

在 Codex CLI 里，先进入 Codex：

```bash
codex
```

然后打开插件列表：

```text
/plugins
```

在插件列表里可以切换 marketplace、查看插件详情、安装或卸载插件。已安装的插件也可以用 Space 切换启用状态。

安装流程：

1. 打开 Plugins 或 `/plugins`
2. 搜索或浏览插件
3. 打开插件详情
4. 选择安装
5. 如果插件需要外部 app，就按提示登录或连接
6. 开一个新 thread，让 Codex 使用这个插件

使用方式有两种：

```text
总结今天未读的 Gmail threads
```

这种写法让 Codex 自己选择合适的已安装插件。

也可以显式点名插件或 bundled skill：

```text
@github
```


Codex 官方文档：

- https://developers.openai.com/codex/plugins
- https://developers.openai.com/codex/skills

## 怎么选

如果只是从 `skills.sh` 安装普通 skill，用：

```bash
npx skills add <owner/repo> -a codex
```

如果是 Claude Code 或 Codex 自带市场里的插件，优先用它们自己的 marketplace：

- Claude Code：`/plugin`
- Codex：`Plugins` 或 `/plugins`

插件市场更适合安装一整套能力，比如 GitHub、Slack、Gmail、Linear 这类带 app auth 或 MCP server 的集成；`npx skills` 更适合安装单个轻量 skill。
