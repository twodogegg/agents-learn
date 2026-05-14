# Coding Skills

这类 skill 用来处理软件开发、测试、重构和发布。

## 已收录

| Skill | 主要用途 | 适合场景 | 常用方式 |
| --- | --- | --- | --- |
| `deploy-to-vercel` | 把项目部署到 Vercel，默认生成 preview deployment | 需要快速上线网页、应用、demo，或拿到预览链接 | `vercel link`、`vercel deploy`、`git push` |

## deploy-to-vercel

| 项目 | 说明 |
| --- | --- |
| 默认策略 | 先部署 preview，不直接上 production |
| 最佳状态 | 项目已连接 Git remote 和 Vercel project，push 后自动部署 |
| CLI 路线 | 登录 Vercel CLI 后，先 link，再 deploy |
| 无登录 fallback | 使用 skill 自带脚本上传并返回 `previewUrl` 和 `claimUrl` |
| 公开访问 | 如果 preview URL 要给别人访问，需要到项目 Settings -> Deployment Protection 检查保护设置，必要时关闭对应 URL 的保护 |
| 注意事项 | 涉及 `git push` 前需要确认，避免误触发 production |

### 常用触发词

| 触发词 | 说明 |
| --- | --- |
| `deploy my app` | 部署当前应用 |
| `deploy and give me the link` | 部署并返回访问链接 |
| `push this live` | 把项目发布到线上 |
| `create a preview deployment` | 创建 preview deployment |
| `部署到 Vercel` | 中文表达，语义上会匹配部署任务 |

## 后续追加

| Skill | 主要用途 | 适合场景 | 常用方式 |
| --- | --- | --- | --- |
|  |  |  |  |
