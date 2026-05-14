# Codex 配置参考

这篇记录 Codex 怎么配置。重点不是概念，而是：配置写在哪里、怎么覆盖、哪些配置适合放全局、哪些适合放项目级，以及 `config.toml` 里有哪些 key。

资料来源：

- [Config basics](https://developers.openai.com/codex/config-basic)
- [Advanced configuration](https://developers.openai.com/codex/config-advanced)
- [Configuration reference](https://developers.openai.com/codex/config-reference)
- [config-schema.json](https://developers.openai.com/codex/config-schema.json)

## 配置分层

Codex 有几层配置。日常最常用的是全局配置和项目级配置。

| 层级 | 文件位置 | 适合放什么 |
| --- | --- | --- |
| 用户级 | `~/.codex/config.toml` | 个人默认模型、provider、TUI、通知、history、MCP、skills、插件 |
| 项目级 | `<repo>/.codex/config.toml` | 当前 repo 专属模型、sandbox、hooks、项目指令、MCP 覆盖 |
| 临时覆盖 | `codex --config key=value` | 一次性试验，不改文件 |
| profile | `[profiles.<name>]` | 一组可切换的命名配置 |

项目级 `.codex/config.toml` 只有在项目被 trust 后才会加载。未 trust 时，Codex 会跳过项目 `.codex/` 里的 config、hooks 和 rules，但仍会加载用户级配置。

## 优先级

从高到低：

1. CLI flags 和 `--config`
2. `--profile <name>` 选中的 profile
3. 项目级 `.codex/config.toml`，从项目根到当前目录逐层加载，越近越优先
4. 用户级 `~/.codex/config.toml`
5. 内置默认值

使用原则：

- 个人习惯放 `~/.codex/config.toml`。
- repo 相关配置放 `<repo>/.codex/config.toml`。
- 临时测试用 `--config`。
- 同一套配置要经常切换时，用 profile。

## 全局配置怎么写

打开或创建：

```bash
mkdir -p ~/.codex
$EDITOR ~/.codex/config.toml
```

建议在文件顶部放 schema：

```toml
#:schema https://developers.openai.com/codex/config-schema.json
```

一个偏稳妥的全局模板：

```toml
#:schema https://developers.openai.com/codex/config-schema.json

model = "gpt-5.5"
review_model = "gpt-5.5"
approval_policy = "on-request"
sandbox_mode = "workspace-write"
web_search = "cached"
personality = "pragmatic"
file_opener = "cursor"

[sandbox_workspace_write]
network_access = false

[features]
codex_hooks = true
multi_agent = true
shell_snapshot = true
memories = false
undo = false

[history]
max_bytes = 104857600

[shell_environment_policy]
inherit = "core"
ignore_default_excludes = false
exclude = ["*_KEY", "*_SECRET", "*_TOKEN"]
```

全局配置适合放：

- `model`、`review_model`、`personality`
- `approval_policy`、`sandbox_mode`
- `web_search`
- `file_opener`
- `[tui]`
- `[history]`
- `[analytics]`、`[feedback]`
- `[mcp_servers.<id>]`
- `[model_providers.<id>]`
- `[skills]`、`[plugins]`

## 项目级配置怎么写

在 repo 里创建：

```bash
mkdir -p .codex
$EDITOR .codex/config.toml
```

项目级模板：

```toml
model = "gpt-5.5"
approval_policy = "on-request"
sandbox_mode = "workspace-write"
model_reasoning_effort = "high"

project_doc_max_bytes = 32768
project_doc_fallback_filenames = ["AGENTS.md"]

[sandbox_workspace_write]
network_access = false

[features]
codex_hooks = true

[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = "./.codex/hooks/pre_tool_use_policy.py"
timeout = 30
statusMessage = "Checking command policy"
```

项目级配置适合放：

- 当前项目更适合的 `model` 或 `model_reasoning_effort`
- 当前项目的 `approval_policy`、`sandbox_mode`
- 当前项目的 `.codex/hooks.json` 或内联 `[hooks]`
- 当前项目需要的 `model_instructions_file`
- 当前项目需要的 MCP server 或 MCP tool 限制
- 当前项目的 `project_root_markers`

项目级配置里使用相对路径时，例如 `model_instructions_file`，相对的是包含这个 `config.toml` 的 `.codex/` 目录。

## 子目录项目配置

Codex 会从项目根一路走到当前工作目录，加载沿途所有 `.codex/config.toml`。如果同一个 key 重复，离当前目录最近的 wins。

例子：

```txt
repo/
  .codex/config.toml
  packages/api/.codex/config.toml
```

在 `repo/packages/api` 里启动 Codex 时，两份都会加载，`packages/api/.codex/config.toml` 覆盖根目录同名 key。

## profile 怎么写

profile 是命名配置组：

```toml
model = "gpt-5.5"
approval_policy = "on-request"

[profiles.deep-review]
model = "gpt-5-pro"
model_reasoning_effort = "high"
approval_policy = "on-request"

[profiles.lightweight]
model = "gpt-4.1"
model_reasoning_effort = "low"
approval_policy = "untrusted"
```

使用：

```bash
codex --profile deep-review
```

设置默认 profile：

```toml
profile = "deep-review"
```

注意：官方文档说 profile 仍是 experimental，并且目前不支持 Codex IDE extension。

profile 可覆盖的常见项包括：模型、provider、reasoning、sandbox、approval、web search、TUI 部分设置、feature flags、Windows sandbox 等。完整项见后面的 `profiles.<name>` 表。

## 临时覆盖怎么写

优先用专门 flag：

```bash
codex --model gpt-5.4
```

任意 key 用 `-c` 或 `--config`：

```bash
codex --config model='"gpt-5.4"'
codex --config sandbox_workspace_write.network_access=true
codex --config 'shell_environment_policy.include_only=["PATH","HOME"]'
codex --config mcp_servers.context7.enabled=false
```

要点：

- `--config` 的值按 TOML 解析，不是 JSON。
- 嵌套字段用 dot notation。
- 字符串通常需要双层引号，避免 shell 提前吃掉。

## 最重要的配置组合

### 普通开发

```toml
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[sandbox_workspace_write]
network_access = false
```

### 陌生项目

```toml
approval_policy = "untrusted"
sandbox_mode = "read-only"
web_search = "cached"
```

### 自动化任务

```toml
approval_policy = "never"
sandbox_mode = "workspace-write"
```

不要轻易把 `approval_policy = "never"` 和 `sandbox_mode = "danger-full-access"` 放在全局配置。它们适合放到单独 profile 或已经隔离的环境。

### 允许网络但限制域名

```toml
default_permissions = "workspace-net"

[permissions.workspace-net.filesystem]
":project_roots" = { "." = "write", "**/*.env" = "none" }

[permissions.workspace-net.network]
enabled = true
mode = "limited"

[permissions.workspace-net.network.domains]
"api.openai.com" = "allow"
"*.example.com" = "allow"
```

## 完整配置项：顶层 key

下面是 `config.toml` 的顶层 key。动态表项用 `<name>`、`<id>`、`<path>` 表示。

| key | 类型 | 用途 |
| --- | --- | --- |
| `agents` | table | subagent 线程数量、深度、角色配置 |
| `allow_login_shell` | boolean | 是否允许 shell tool 使用 login shell |
| `analytics` | table | analytics 开关 |
| `approval_policy` | string / table | 命令审批策略 |
| `approvals_reviewer` | string | 审批交给用户还是 `auto_review` |
| `apps` | table | ChatGPT Apps / connectors 控制 |
| `audio` | table | realtime audio 的本机设备偏好 |
| `auto_review` | table | 自动审批 reviewer 的本地 policy |
| `background_terminal_max_timeout` | integer | 后台终端空轮询最大等待毫秒数 |
| `chatgpt_base_url` | string | ChatGPT 登录流 base URL |
| `check_for_update_on_startup` | boolean | 启动时是否检查 Codex 更新 |
| `cli_auth_credentials_store` | string | CLI credential 存储方式 |
| `commit_attribution` | string | Codex commit trailer 文本 |
| `compact_prompt` | string | 历史压缩 prompt |
| `debug` | table | 调试与复现实验配置 |
| `default_permissions` | string | 默认 permission profile |
| `developer_instructions` | string | 注入 developer role 的额外指令 |
| `disable_paste_burst` | boolean | 禁用 TUI 粘贴 burst 检测 |
| `experimental_compact_prompt_file` | path | 从文件加载压缩 prompt |
| `experimental_realtime_start_instructions` | string | realtime start 指令覆盖，实验项 |
| `experimental_realtime_ws_backend_prompt` | string | realtime websocket backend prompt，实验项 |
| `experimental_realtime_ws_base_url` | string | realtime websocket base URL，实验项 |
| `experimental_realtime_ws_model` | string | realtime websocket model，实验项 |
| `experimental_realtime_ws_startup_context` | string | realtime startup context，实验项 |
| `experimental_thread_config_endpoint` | string | 远程 thread config endpoint，实验项 |
| `experimental_thread_store` | table | thread store 实验配置 |
| `experimental_use_freeform_apply_patch` | boolean | freeform apply patch 实验开关 |
| `experimental_use_unified_exec_tool` | boolean | unified exec 旧实验开关，优先用 `[features].unified_exec` |
| `features` | table | feature flags |
| `feedback` | table | `/feedback` 反馈开关 |
| `file_opener` | string | 文件引用点击打开方式 |
| `forced_chatgpt_workspace_id` | string | 限制 ChatGPT workspace |
| `forced_login_method` | string | 限制登录方式：`chatgpt` 或 `api` |
| `ghost_snapshot` | table | legacy ghost snapshot 兼容配置 |
| `hide_agent_reasoning` | boolean | 隐藏 reasoning 事件 |
| `history` | table | session history 持久化 |
| `hooks` | table | 内联 lifecycle hooks |
| `include_apps_instructions` | boolean | 是否注入 apps instructions |
| `include_environment_context` | boolean | 是否注入 environment context |
| `include_permissions_instructions` | boolean | 是否注入 permissions instructions |
| `instructions` | string | 系统指令；官方更推荐 `model_instructions_file` 或 `AGENTS.md` |
| `log_dir` | path | log 目录 |
| `marketplaces` | table | 用户级 marketplace 配置 |
| `mcp_oauth_callback_port` | integer | MCP OAuth callback 固定端口 |
| `mcp_oauth_callback_url` | string | MCP OAuth redirect URI |
| `mcp_oauth_credentials_store` | string | MCP OAuth credential 存储方式 |
| `mcp_servers` | table | MCP server 定义 |
| `memories` | table | memories 子系统 |
| `model` | string | 默认模型 |
| `model_auto_compact_token_limit` | integer | 自动压缩上下文的 token 阈值 |
| `model_catalog_json` | path | 自定义 model catalog |
| `model_context_window` | integer | 模型 context window |
| `model_instructions_file` | path | 用文件替换内置模型指令 |
| `model_provider` | string | 使用哪个 provider |
| `model_providers` | table | 自定义 provider |
| `model_reasoning_effort` | string | reasoning effort |
| `model_reasoning_summary` | string | reasoning summary |
| `model_supports_reasoning_summaries` | boolean | 强制声明模型支持 reasoning summaries |
| `model_verbosity` | string | 输出详细度 |
| `notice` | table | 产品内提示记录 |
| `notify` | array | 外部通知命令 |
| `openai_base_url` | string | 内置 OpenAI provider 的 base URL |
| `oss_provider` | string | `--oss` 默认本地 provider |
| `otel` | table | OpenTelemetry 配置 |
| `permissions` | table | 命名 permission profiles |
| `personality` | string | 输出风格 |
| `plan_mode_reasoning_effort` | string | plan mode reasoning effort |
| `plugins` | table | plugin 配置 |
| `profile` | string | 默认 profile 名称 |
| `profiles` | table | profile 定义 |
| `project_doc_fallback_filenames` | array | 找不到 `AGENTS.md` 时的 fallback 文件名 |
| `project_doc_max_bytes` | integer | 每个项目指令文件最多读取字节数 |
| `project_root_markers` | array | 项目根识别标记 |
| `projects` | table | 项目 trust 配置 |
| `realtime` | table | realtime websocket 配置，实验项 |
| `review_model` | string | `/review` 使用的模型 |
| `sandbox_mode` | string | sandbox 模式 |
| `sandbox_workspace_write` | table | `workspace-write` 的细节 |
| `service_tier` | string | `fast` 或 `flex` |
| `shell_environment_policy` | table | 子进程环境变量策略 |
| `show_raw_agent_reasoning` | boolean | 显示 raw reasoning 内容 |
| `skills` | table | skill 配置 |
| `sqlite_home` | path | SQLite state DB 目录 |
| `suppress_unstable_features_warning` | boolean | 隐藏不稳定功能警告 |
| `tool_output_token_limit` | integer | tool 输出进历史的 token 上限 |
| `tool_suggest` | table | tool suggestion 配置 |
| `tools` | table | tool 开关与选项 |
| `tui` | table | TUI 配置 |
| `web_search` | string | web search 模式 |
| `windows` | table | Windows 专属配置 |
| `windows_wsl_setup_acknowledged` | boolean | Windows WSL onboarding 状态 |
| `zsh_path` | path | zsh-exec-bridge 使用的 zsh 路径 |

## 常用枚举值

| key | 可选值 |
| --- | --- |
| `approval_policy` | `untrusted`、`on-request`、`never`、granular table；`on-failure` 已 deprecated |
| `approvals_reviewer` | `user`、`auto_review`、`guardian_subagent` |
| `sandbox_mode` | `read-only`、`workspace-write`、`danger-full-access` |
| `model_reasoning_effort` | `none`、`minimal`、`low`、`medium`、`high`、`xhigh` |
| `model_reasoning_summary` | `auto`、`concise`、`detailed`、`none` |
| `model_verbosity` | `low`、`medium`、`high` |
| `personality` | `none`、`friendly`、`pragmatic` |
| `service_tier` | `fast`、`flex` |
| `web_search` | `disabled`、`cached`、`live` |
| `file_opener` | `vscode`、`vscode-insiders`、`windsurf`、`cursor`、`none` |
| `cli_auth_credentials_store` | `file`、`keyring`、`auto`、`ephemeral` |
| `mcp_oauth_credentials_store` | `auto`、`file`、`keyring` |
| `forced_login_method` | `chatgpt`、`api` |
| `oss_provider` | 常见为 `ollama`、`lmstudio` |

## `approval_policy` granular 写法

```toml
approval_policy = { granular = {
  sandbox_approval = true,
  rules = true,
  mcp_elicitations = true,
  request_permissions = false,
  skill_approval = false
} }
```

| key | 用途 |
| --- | --- |
| `sandbox_approval` | 是否允许 sandbox escalation 审批弹出 |
| `rules` | 是否允许 rules 触发的审批弹出 |
| `mcp_elicitations` | 是否允许 MCP elicitation 弹出 |
| `request_permissions` | 是否允许 `request_permissions` 工具弹出 |
| `skill_approval` | 是否允许 skill 脚本审批弹出 |

## `[sandbox_workspace_write]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `writable_roots` | array | `workspace-write` 额外可写路径 |
| `network_access` | boolean | 是否允许网络 |
| `exclude_tmpdir_env_var` | boolean | 是否排除 `$TMPDIR` |
| `exclude_slash_tmp` | boolean | 是否排除 `/tmp` |

## `[permissions.<name>]`

```toml
default_permissions = "workspace-net"

[permissions.workspace-net.filesystem]
":project_roots" = { "." = "write", "**/*.env" = "none" }
glob_scan_max_depth = 3

[permissions.workspace-net.network]
enabled = true
mode = "limited"
```

| key | 类型 | 用途 |
| --- | --- | --- |
| `permissions.<name>.filesystem` | table | 文件权限 profile |
| `permissions.<name>.filesystem.glob_scan_max_depth` | number | glob 扫描深度 |
| `permissions.<name>.filesystem.<path-or-glob>` | string / table | 路径或 glob 权限：`read`、`write`、`none` |
| `permissions.<name>.filesystem.":project_roots".<subpath-or-glob>` | string | 相对项目根的权限 |
| `permissions.<name>.network.enabled` | boolean | 是否启用网络代理 |
| `permissions.<name>.network.mode` | string | `limited` 或 `full` |
| `permissions.<name>.network.domains` | table | 域名 allow / deny |
| `permissions.<name>.network.unix_sockets` | table | Unix socket allow / none |
| `permissions.<name>.network.proxy_url` | string | HTTP proxy |
| `permissions.<name>.network.socks_url` | string | SOCKS proxy |
| `permissions.<name>.network.enable_socks5` | boolean | 是否开 SOCKS5 |
| `permissions.<name>.network.enable_socks5_udp` | boolean | 是否允许 SOCKS5 UDP |
| `permissions.<name>.network.allow_upstream_proxy` | boolean | 是否允许上游代理 |
| `permissions.<name>.network.allow_local_binding` | boolean | 是否允许本地监听 |
| `permissions.<name>.network.dangerously_allow_non_loopback_proxy` | boolean | 允许非 loopback 代理监听，危险项 |
| `permissions.<name>.network.dangerously_allow_all_unix_sockets` | boolean | 允许任意 Unix socket，危险项 |

内置 permission profile：

| 值 | 含义 |
| --- | --- |
| `:read-only` | 只读 |
| `:workspace` | workspace 可写 |
| `:danger-no-sandbox` | 无 sandbox |

## `[shell_environment_policy]`

```toml
[shell_environment_policy]
inherit = "none"
set = { PATH = "/usr/bin", MY_FLAG = "1" }
ignore_default_excludes = false
exclude = ["AWS_*", "AZURE_*"]
include_only = ["PATH", "HOME"]
```

| key | 类型 | 用途 |
| --- | --- | --- |
| `inherit` | string | 继承策略，如 `none` 或 `core` |
| `set` | table | 明确设置环境变量 |
| `exclude` | array | 排除变量，支持 glob |
| `include_only` | array | 只包含这些变量 |
| `ignore_default_excludes` | boolean | 是否忽略默认 secret 过滤 |
| `experimental_use_profile` | boolean | 实验项 |

## `[mcp_servers.<id>]`

stdio server：

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
enabled = true
startup_timeout_sec = 10
tool_timeout_sec = 60
```

HTTP server：

```toml
[mcp_servers.example]
url = "https://mcp.example.com/mcp"
bearer_token_env_var = "EXAMPLE_MCP_TOKEN"
enabled_tools = ["search", "fetch"]
```

| key | 类型 | 用途 |
| --- | --- | --- |
| `command` | string | stdio server 启动命令 |
| `args` | array | 启动参数 |
| `cwd` | string | server 工作目录 |
| `env` | table | 传给 server 的环境变量 |
| `env_vars` | array | 额外允许的环境变量 |
| `url` | string | streamable HTTP server 地址 |
| `bearer_token_env_var` | string | bearer token 来源环境变量 |
| `http_headers` | table | 静态 HTTP headers |
| `env_http_headers` | table | 从环境变量读取 HTTP headers |
| `enabled` | boolean | 是否启用 |
| `required` | boolean | 启动失败时是否让 Codex 失败 |
| `startup_timeout_sec` | number | 启动超时秒数 |
| `startup_timeout_ms` | integer | 启动超时毫秒数 |
| `tool_timeout_sec` | number | tool 调用超时秒数 |
| `enabled_tools` | array | tool allowlist |
| `disabled_tools` | array | tool denylist |
| `tools` | table | 单个 tool 的配置 |
| `tools.<tool>.approval_mode` | string | 单个 tool 审批模式 |
| `default_tools_approval_mode` | string | 默认 tool 审批模式 |
| `supports_parallel_tool_calls` | boolean | 是否支持并行 tool call |
| `scopes` | array | OAuth scopes |
| `oauth_resource` | string | OAuth resource 参数 |
| `experimental_environment` | string | `local` 或 `remote`，实验项 |
| `name` | string | legacy 展示名 |

## `[model_providers.<id>]`

简单 proxy：

```toml
model = "gpt-5.4"
model_provider = "proxy"

[model_providers.proxy]
name = "OpenAI using LLM proxy"
base_url = "https://proxy.example.com/v1"
env_key = "OPENAI_API_KEY"
wire_api = "responses"
```

| key | 类型 | 用途 |
| --- | --- | --- |
| `name` | string | 展示名 |
| `base_url` | string | OpenAI-compatible API base URL |
| `env_key` | string | API key 环境变量 |
| `env_key_instructions` | string | 缺少 key 时给用户的提示 |
| `wire_api` | string | provider 协议，目前常见为 `responses` |
| `http_headers` | table | 静态 headers |
| `env_http_headers` | table | 从环境变量读取 headers |
| `query_params` | table | URL query params |
| `request_max_retries` | integer | HTTP request 重试次数 |
| `stream_max_retries` | integer | stream 重连次数 |
| `stream_idle_timeout_ms` | integer | stream idle timeout |
| `supports_websockets` | boolean | 是否支持 Responses API websocket transport |
| `websocket_connect_timeout_ms` | integer | websocket 连接超时 |
| `requires_openai_auth` | boolean | 是否需要 OpenAI auth |
| `experimental_bearer_token` | string | 直接写 bearer token，不推荐 |
| `auth` | table | command-backed token |
| `auth.command` | string | 取 token 命令 |
| `auth.args` | array | 命令参数 |
| `auth.cwd` | string | 命令工作目录 |
| `auth.timeout_ms` | integer | 命令超时 |
| `auth.refresh_interval_ms` | integer | token 刷新间隔 |
| `aws` | table | AWS Bedrock 配置 |
| `aws.profile` | string | AWS profile |
| `aws.region` | string | AWS region |

不要定义 `[model_providers.openai]`、`[model_providers.ollama]`、`[model_providers.lmstudio]`，这些是 reserved built-in provider id。要改内置 OpenAI provider 的地址，用：

```toml
openai_base_url = "https://us.api.openai.com/v1"
```

## 第三方模型怎么配置

配置第三方模型的核心是三步：

1. 把 API key 放到环境变量里，不要直接写进 `config.toml`。
2. 在 `[model_providers.<id>]` 里定义 provider。
3. 用顶层 `model_provider` 和 `model` 选中它。

OpenAI-compatible 的 proxy、router、国产模型网关通常可以这样写：

```toml
model = "your-model-name"
model_provider = "thirdparty"

[model_providers.thirdparty]
name = "Third-party OpenAI-compatible API"
base_url = "https://api.example.com/v1"
env_key = "THIRDPARTY_API_KEY"
wire_api = "responses"
```

然后在 shell 里设置 key：

```bash
export THIRDPARTY_API_KEY="..."
```

## `[features]`

| key | 默认倾向 | 用途 |
| --- | --- | --- |
| `apps` | off | ChatGPT Apps / connectors |
| `codex_git_commit` | off | Codex 生成 commit 和 attribution trailer |
| `codex_hooks` | on | hooks |
| `fast_mode` | on | Fast mode 和 `service_tier = "fast"` |
| `memories` | off | memories |
| `multi_agent` | on | subagent 协作工具 |
| `personality` | on | personality 控制 |
| `shell_snapshot` | on | shell snapshot 加速 |
| `shell_tool` | on | 默认 shell tool |
| `unified_exec` | on，Windows 除外 | unified PTY exec |
| `undo` | off | per-turn git snapshot undo |
| `web_search` | deprecated | 旧开关，改用顶层 `web_search` |
| `web_search_cached` | deprecated | 旧开关，映射到 `web_search = "cached"` |
| `web_search_request` | deprecated | 旧开关，映射到 `web_search = "live"` |
| `enable_request_compression` | on | request body zstd 压缩 |
| `skill_mcp_dependency_install` | on | 允许安装 skill 缺失的 MCP 依赖 |
| `prevent_idle_sleep` | off | 任务运行时防止机器睡眠，实验项 |

## `[tui]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `notifications` | boolean / array | TUI 通知开关，可限制事件类型 |
| `notification_method` | string | `auto`、`osc9`、`bel` |
| `notification_condition` | string | `unfocused` 或 `always` |
| `animations` | boolean | 动画、shimmer、spinner |
| `alternate_screen` | string | `auto`、`always`、`never` |
| `show_tooltips` | boolean | 欢迎页 tooltip |
| `status_line` | array / null | footer status line 项 |
| `status_line_use_colors` | boolean | status line 是否用颜色 |
| `terminal_title` | array / null | terminal title 项 |
| `theme` | string | 语法高亮主题名 |
| `keymap` | table | 快捷键 |
| `model_availability_nux` | table | 内部启动 tooltip 状态 |
| `raw_output_mode` | boolean | 启动时使用 raw scrollback mode |
| `session_picker_view` | string | resume / fork session picker 布局 |
| `terminal_resize_reflow_max_rows` | integer | resize reflow 最大行数 |
| `vim_mode_default` | boolean | composer 默认 Vim mode |

## `[tui.keymap]`

可配置的 context：

| context | action |
| --- | --- |
| `global` | `clear_terminal`、`copy`、`open_external_editor`、`open_transcript`、`queue`、`submit`、`toggle_fast_mode`、`toggle_raw_output`、`toggle_shortcuts`、`toggle_vim_mode` |
| `chat` | `decrease_reasoning_effort`、`edit_queued_message`、`increase_reasoning_effort` |
| `composer` | `history_search_next`、`history_search_previous`、`queue`、`submit`、`toggle_shortcuts` |
| `editor` | `delete_backward`、`delete_backward_word`、`delete_forward`、`delete_forward_word`、`insert_newline`、`kill_line_end`、`kill_line_start`、`kill_whole_line`、`move_down`、`move_left`、`move_line_end`、`move_line_start`、`move_right`、`move_up`、`move_word_left`、`move_word_right`、`yank` |
| `pager` | `close`、`close_transcript`、`half_page_down`、`half_page_up`、`jump_bottom`、`jump_top`、`page_down`、`page_up`、`scroll_down`、`scroll_up` |
| `list` | `accept`、`cancel`、`move_down`、`move_up` |
| `approval` | `approve`、`approve_for_prefix`、`approve_for_session`、`cancel`、`decline`、`deny`、`open_fullscreen`、`open_thread` |
| `vim_normal` | `append_after_cursor`、`append_line_end`、`cancel_operator`、`delete_char`、`delete_to_line_end`、`enter_insert`、`insert_line_start`、`move_down`、`move_left`、`move_line_end`、`move_line_start`、`move_right`、`move_up`、`move_word_backward`、`move_word_end`、`move_word_forward`、`open_line_above`、`open_line_below`、`paste_after`、`start_delete_operator`、`start_yank_operator`、`yank_line` |
| `vim_operator` | `cancel`、`delete_line`、`motion_down`、`motion_left`、`motion_line_end`、`motion_line_start`、`motion_right`、`motion_up`、`motion_word_backward`、`motion_word_end`、`motion_word_forward`、`yank_line` |

写法：

```toml
[tui.keymap.global]
open_transcript = "ctrl-t"

[tui.keymap.composer]
submit = ["enter", "ctrl-m"]

[tui.keymap.approval]
deny = []
```

空数组表示 unbind。

## `[history]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `persistence` | string | `save-all` 或 `none` |
| `max_bytes` | number | history 文件大小上限 |

关闭本地历史：

```toml
[history]
persistence = "none"
```

## `[otel]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `environment` | string | 环境标签，默认 `dev` |
| `exporter` | string / table | log exporter：`none`、`otlp-http`、`otlp-grpc` |
| `trace_exporter` | string / table | trace exporter |
| `metrics_exporter` | string / table | metrics exporter |
| `log_user_prompt` | boolean | 是否导出原始 user prompt |
| `span_attributes` | table | 附加 span attributes |
| `tracestate` | string | W3C tracestate |
| `exporter.<id>.endpoint` | string | OTLP endpoint |
| `exporter.<id>.protocol` | string | `binary` 或 `json` |
| `exporter.<id>.headers` | table | headers |
| `exporter.<id>.tls.ca-certificate` | string | CA certificate |
| `exporter.<id>.tls.client-certificate` | string | client certificate |
| `exporter.<id>.tls.client-private-key` | string | client private key |

一般不要打开：

```toml
[otel]
log_user_prompt = true
```

除非你明确接受 prompt 被导出。

## `[analytics]` 和 `[feedback]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `analytics.enabled` | boolean | 是否启用匿名使用与健康数据 |
| `feedback.enabled` | boolean | 是否启用 `/feedback` |

```toml
[analytics]
enabled = false

[feedback]
enabled = false
```

## `[memories]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `generate_memories` | boolean | 是否从新 thread 生成 memory |
| `use_memories` | boolean | 是否向未来 session 注入 memory |
| `disable_on_external_context` | boolean | 使用外部 context 时是否跳过 memory |
| `max_raw_memories_for_consolidation` | number | consolidation 保留 raw memory 数 |
| `max_unused_days` | number | memory 未使用最大天数 |
| `max_rollout_age_days` | number | 参与 memory 生成的 thread 最大天数 |
| `max_rollouts_per_startup` | number | 每次启动处理 rollout 上限 |
| `min_rollout_idle_hours` | number | thread 空闲多久后可处理 |
| `min_rate_limit_remaining_percent` | number | 剩余 rate limit 百分比下限 |
| `extract_model` | string | memory extraction 模型 |
| `consolidation_model` | string | memory consolidation 模型 |

## `[agents]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `max_threads` | number | 最大并发 agent threads |
| `max_depth` | number | 最大嵌套深度 |
| `job_max_runtime_seconds` | number | agent job worker 默认超时 |
| `interrupt_message` | boolean | interrupt 时是否记录 model-visible message |
| `agents.<name>.description` | string | role 描述 |
| `agents.<name>.config_file` | path | role 专用 TOML 配置 |
| `agents.<name>.nickname_candidates` | array | role 昵称池 |

## `[skills]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `include_instructions` | boolean | 是否注入自动 skills instructions |
| `bundled.enabled` | boolean | 是否启用 bundled skills |
| `config` | array | skill 配置列表 |
| `config[].path` | path | skill 文件夹 |
| `config[].name` | string | skill 名称 |
| `config[].enabled` | boolean | 是否启用 |

## `[apps]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `apps._default.enabled` | boolean | 默认是否启用 app |
| `apps._default.destructive_enabled` | boolean | 默认允许 destructive tools |
| `apps._default.open_world_enabled` | boolean | 默认允许 open world tools |
| `apps.<id>.enabled` | boolean | 某个 app 是否启用 |
| `apps.<id>.destructive_enabled` | boolean | 某个 app 是否允许 destructive tools |
| `apps.<id>.open_world_enabled` | boolean | 某个 app 是否允许 open world tools |
| `apps.<id>.default_tools_enabled` | boolean | app 内 tools 默认是否启用 |
| `apps.<id>.default_tools_approval_mode` | string | app 内 tools 默认审批模式 |
| `apps.<id>.tools.<tool>.enabled` | boolean | 单个 tool 是否启用 |
| `apps.<id>.tools.<tool>.approval_mode` | string | 单个 tool 审批模式 |

## `[plugins]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `plugins.<name>.enabled` | boolean | 是否启用 plugin |
| `plugins.<name>.mcp_servers` | table | plugin 贡献的 MCP server policy 覆盖 |
| `plugins.<name>.mcp_servers.<id>.enabled` | boolean | server 是否启用 |
| `plugins.<name>.mcp_servers.<id>.enabled_tools` | array | tool allowlist |
| `plugins.<name>.mcp_servers.<id>.disabled_tools` | array | tool denylist |
| `plugins.<name>.mcp_servers.<id>.default_tools_approval_mode` | string | 默认审批模式 |
| `plugins.<name>.mcp_servers.<id>.tools.<tool>.approval_mode` | string | 单个 tool 审批模式 |

## `[tools]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `tools.view_image` | boolean | 启用本地图片查看 tool |
| `tools.web_search` | boolean / table | web search tool 细节 |
| `tools.web_search.context_size` | string | `low`、`medium`、`high` |
| `tools.web_search.allowed_domains` | array | 允许搜索的域名 |
| `tools.web_search.location.country` | string | 搜索位置国家 |
| `tools.web_search.location.region` | string | 搜索位置地区 |
| `tools.web_search.location.city` | string | 搜索位置城市 |
| `tools.web_search.location.timezone` | string | 搜索位置时区 |

顶层 `web_search` 控制模式，`tools.web_search` 控制 tool 参数。

## `[profiles.<name>]`

profile 可以覆盖这些项：

| key | 类型 |
| --- | --- |
| `analytics` | table |
| `approval_policy` | string / table |
| `approvals_reviewer` | string |
| `chatgpt_base_url` | string |
| `experimental_compact_prompt_file` | path |
| `experimental_use_freeform_apply_patch` | boolean |
| `experimental_use_unified_exec_tool` | boolean |
| `features` | table |
| `include_apply_patch_tool` | boolean |
| `include_apps_instructions` | boolean |
| `include_environment_context` | boolean |
| `include_permissions_instructions` | boolean |
| `model` | string |
| `model_catalog_json` | path |
| `model_instructions_file` | path |
| `model_provider` | string |
| `model_reasoning_effort` | string |
| `model_reasoning_summary` | string |
| `model_verbosity` | string |
| `oss_provider` | string |
| `personality` | string |
| `plan_mode_reasoning_effort` | string |
| `sandbox_mode` | string |
| `service_tier` | string |
| `tools` | table |
| `tools_view_image` | boolean |
| `tui` | table |
| `web_search` | string |
| `windows` | table |
| `zsh_path` | path |

## `[hooks]`

支持的事件：

| event | 用途 |
| --- | --- |
| `PreToolUse` | tool 使用前 |
| `PostToolUse` | tool 使用后 |
| `PermissionRequest` | 权限请求时 |
| `SessionStart` | session 开始时 |
| `UserPromptSubmit` | 用户提交 prompt 时 |
| `PreCompact` | compact 前 |
| `PostCompact` | compact 后 |
| `Stop` | session 停止时 |
| `state` | hook 状态 |

基本结构：

```toml
[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = "./.codex/hooks/pre_tool_use_policy.py"
timeout = 30
statusMessage = "Checking command policy"
```

同一层同时存在 `hooks.json` 和内联 `[hooks]` 时，Codex 会都加载并提示。为了维护简单，同一层最好只用一种形式。

## `[projects.<path>]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `trust_level` | string | `trusted` 或 `untrusted` |

例子：

```toml
[projects."/Users/me/code/project-a"]
trust_level = "trusted"
```

## `[windows]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `sandbox` | string | `elevated` 或 `unelevated` |
| `sandbox_private_desktop` | boolean | 是否在 private desktop 运行 sandbox child process |

官方建议 Windows native 优先用：

```toml
[windows]
sandbox = "elevated"
```

## `[notice]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `hide_full_access_warning` | boolean | 隐藏 full access warning |
| `hide_world_writable_warning` | boolean | 隐藏 Windows world-writable warning |
| `hide_rate_limit_model_nudge` | boolean | 隐藏 rate limit model 提醒 |
| `hide_gpt5_1_migration_prompt` | boolean | 隐藏 GPT-5.1 migration 提醒 |
| `hide_gpt-5.1-codex-max_migration_prompt` | boolean | 隐藏 gpt-5.1-codex-max migration 提醒 |
| `model_migrations` | table | 已确认的 model migration |
| `fast_default_opt_out` | boolean | fast default opt-out 状态 |
| `external_config_migration_prompts` | table | 外部配置迁移提示状态 |

## `[debug]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `config_lockfile` | table | config lockfile 调试配置 |
| `config_lockfile.export_dir` | path | 导出目录 |
| `config_lockfile.load_path` | path | 加载路径 |
| `config_lockfile.allow_codex_version_mismatch` | boolean | 是否允许 Codex version 不匹配 |
| `config_lockfile.save_fields_resolved_from_model_catalog` | boolean | 是否保存从 model catalog 解析出的字段 |

## `[realtime]`、`[audio]`

这些多为 realtime / voice 相关配置。

| key | 类型 | 用途 |
| --- | --- | --- |
| `realtime.version` | string | realtime version |
| `realtime.type` | string | realtime 类型 |
| `realtime.transport` | string | realtime transport |
| `realtime.voice` | string | voice |
| `audio.microphone` | string | 麦克风设备偏好 |
| `audio.speaker` | string | 扬声器设备偏好 |

## `[tool_suggest]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `discoverables` | array | 允许建议的 connector / plugin |
| `discoverables[].type` | string | `connector` 或 `plugin` |
| `discoverables[].id` | string | id |
| `disabled_tools` | array | 禁用建议的 connector / plugin |
| `disabled_tools[].type` | string | `connector` 或 `plugin` |
| `disabled_tools[].id` | string | id |

## `[marketplaces]`

| key | 类型 | 用途 |
| --- | --- | --- |
| `marketplaces.<name>.source_type` | string | marketplace 来源类型 |
| `marketplaces.<name>.source` | string | 来源 |
| `marketplaces.<name>.ref` | string | ref |
| `marketplaces.<name>.sparse_paths` | array | sparse checkout paths |
| `marketplaces.<name>.last_revision` | string | 最近 revision |
| `marketplaces.<name>.last_updated` | string | 最近更新时间 |

## 排查清单

配置不生效时按这个顺序查：

1. 当前命令是否用了 CLI flag 或 `--config`。
2. 是否启用了 `--profile`，或顶层 `profile = "..."`。
3. 项目是否被 trust。
4. 当前目录附近是否有更近的 `.codex/config.toml`。
5. `--config` 的值是否是合法 TOML。
6. 是否用了 deprecated key，例如 `experimental_instructions_file` 应改为 `model_instructions_file`。
7. 是否修改了 `CODEX_HOME`，导致你改的不是当前实际读取的配置目录。
