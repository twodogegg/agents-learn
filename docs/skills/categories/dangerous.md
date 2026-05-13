# Dangerous / Experimental Skills

这类 skill 用来标记高风险或实验性能力。

常见类型：

- 真实账号操作
- 自动发布
- 真实审批
- 逆向接口
- 批量删除或修改
- live debug

适合场景：

- 你明确知道风险
- 已经准备好回滚方案
- 有人工确认步骤

设计建议：

- 在 skill 名称或 metadata 里标记风险
- 默认 dry run
- 高风险动作前必须确认
- 记录操作日志

