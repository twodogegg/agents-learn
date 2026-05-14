# skills 的安装

`skills.sh` 是一个公开的 Agent Skills 目录，可以用来搜索别人已经整理好的 skill。实际安装通常通过 npm 包 `skills` 提供的 CLI 完成。

官网入口：

- https://www.skills.sh/

## 最短安装命令

在项目根目录执行：

```bash
npx skills add <owner/repo>
```

例如：

```bash
npx skills add vercel-labs/agent-skills
```

这里的 `<owner/repo>` 一般来自 `skills.sh` 页面或 GitHub 仓库地址。CLI 也支持直接传完整 GitHub URL：

```bash
npx skills add https://github.com/vercel-labs/agent-skills
```

## 安装到 Codex

如果只想给 Codex 安装，显式指定 agent：

```bash
npx skills add <owner/repo> -a codex
```

如果仓库里有多个 skills，只安装其中一个：

```bash
npx skills add <owner/repo> -s <skill-name> -a codex
```

如果要安装仓库里的全部 skills 到全部支持的 agents：

```bash
npx skills add <owner/repo> --all
```

## Project 和 global

默认在项目里执行时，优先安装到当前 project。适合团队共享的 workspace skills。

```bash
npx skills add <owner/repo>
```

安装到用户级别，用 `-g`：

```bash
npx skills add <owner/repo> -g
```

global 适合你自己长期使用的通用 skill；project 适合这个仓库独有的流程、规范和工具。

## 先看仓库里有哪些 skills

安装前可以只列出仓库内容：

```bash
npx skills add <owner/repo> -l
```

如果目录很深，补上：

```bash
npx skills add <owner/repo> -l --full-depth
```

`--full-depth` 没有短写。它的意思是：即使仓库根目录已经有 `SKILL.md`，也继续往更深的子目录搜索。

## 常用 npm skills 命令

```bash
npx skills find
npx skills find typescript
npx skills list
npx skills list -g
npx skills update
npx skills remove <skill-name>
```

几个常见参数：

- `-a, --agent <agent>`：指定安装到哪个 agent，比如 `codex`、`claude-code`、`cursor`
- `-s, --skill <skill>`：指定只安装某个 skill
- `-g, --global`：安装到用户级别
- `-y, --yes`：跳过确认
- `-l, --list`：只列出 repo 里的 skills，不安装
- `--copy`：复制文件，而不是软链接
- `--all`：等价于安装全部 skills 到全部 agents，并跳过确认
- `--full-depth`：深度扫描子目录，没有短写

命令本身也有一些短写：

- `add` 可以写成 `a`
- `list` 可以写成 `ls`
- `remove` 可以写成 `rm`
- `update` 可以写成 `upgrade`

例如：

```bash
npx skills a <owner/repo> -s my-skill -a codex -g -y
npx skills ls -g
npx skills rm my-skill -a codex -y
```

## 安装后的检查

安装完成后，先看列表：

```bash
npx skills list
```

如果是 global：

```bash
npx skills list -g
```

项目级安装通常会更新 `skills-lock.json`，并把 skill 同步到对应 agent 能读取的位置。提交代码时，project 级 skill 需要把相关 skill 文件和 lock 文件一起检查。
