import { defineConfig } from 'vitepress'

const base = process.env.SITE_BASE || '/'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "agents-learn",
  description: "我的agents笔记",
  base,
  srcDir: './docs',
  appearance: false,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Guide', link: '/guide/overview' },
      { text: 'Prompts', link: '/prompts/overview' },
      { text: 'Workspace', link: '/workspace/overview' },
      { text: 'Recipes', link: '/recipes/coding-workspace' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: '总览', link: '/guide/overview' },
          { text: '快速开始', link: '/guide/quick-start' }
        ]
      },
      {
        text: 'Concepts',
        items: [
          { text: 'Prompt', link: '/concepts/prompt' },
          { text: 'Agent', link: '/concepts/agent' },
          { text: 'Skill', link: '/concepts/skill' },
          { text: 'MCP', link: '/concepts/mcp' },
          { text: 'Workspace', link: '/concepts/workspace' }
        ]
      },
      {
        text: 'Agents',
        items: [
          { text: '总览', link: '/agents/overview' },
          { text: 'Instructions', link: '/agents/instructions' },
          { text: 'Roles', link: '/agents/roles' },
          { text: 'Memory', link: '/agents/memory' },
          { text: 'Workflows', link: '/agents/workflows' }
        ]
      },
      {
        text: 'Prompts',
        items: [
          { text: '总览', link: '/prompts/overview' },
          { text: 'Templates', link: '/prompts/templates' },
          { text: 'Writing', link: '/prompts/writing' },
          { text: 'Thinking', link: '/prompts/thinking' },
          { text: 'Coding', link: '/prompts/coding' },
          { text: 'Research', link: '/prompts/research' },
          { text: 'Review', link: '/prompts/review' },
          { text: 'Imagegen', link: '/prompts/imagegen' }
        ]
      },
      {
        text: 'Skills',
        items: [
          { text: '总览', link: '/skills/overview' },
          { text: 'Skill 是什么', link: '/skills/what-is-skill' },
          { text: 'Skill 结构', link: '/skills/anatomy' },
          { text: '创建 Skill', link: '/skills/create-skill' },
          { text: '安装 Skill', link: '/skills/install' },
          { text: 'Claude / Codex 插件安装', link: '/skills/claude-codex-install' },
          { text: '使用 Skill', link: '/skills/use-skill' },
          { text: '分类总览', link: '/skills/categories/overview' },
          {
            text: '分类',
            items: [
              { text: 'Workflow', link: '/skills/categories/workflow' },
              { text: 'Coding', link: '/skills/categories/coding' },
              { text: 'Research', link: '/skills/categories/research' },
              { text: 'Writing', link: '/skills/categories/writing' },
              { text: 'Visual', link: '/skills/categories/visual' },
              { text: 'Browser / Automation', link: '/skills/categories/browser' },
              { text: 'Office / Document', link: '/skills/categories/office' },
              { text: 'Knowledge Base', link: '/skills/categories/knowledge-base' },
              { text: 'Integrations', link: '/skills/categories/integrations' },
              { text: 'Dangerous / Experimental', link: '/skills/categories/dangerous' }
            ]
          },
        ]
      },
      {
        text: 'MCP',
        items: [
          { text: '总览', link: '/mcp/overview' },
          { text: 'Servers', link: '/mcp/servers' },
          { text: 'Tools / Resources / Prompts', link: '/mcp/tools-resources-prompts' },
          { text: '配置', link: '/mcp/config' },
          { text: '安全边界', link: '/mcp/security' },
          { text: '示例', link: '/mcp/examples' }
        ]
      },
      {
        text: 'Workspace',
        items: [
          { text: '总览', link: '/workspace/overview' },
          { text: '目录结构', link: '/workspace/structure' },
          { text: 'AGENTS.md', link: '/workspace/agents-md' },
          { text: '上下文准备', link: '/workspace/context' },
          { text: 'Skills', link: '/workspace/skills' },
          { text: 'MCP', link: '/workspace/mcp' },
          { text: '生命周期', link: '/workspace/lifecycle' }
        ]
      },
      {
        text: 'Recipes',
        items: [
          { text: 'Coding Workspace', link: '/recipes/coding-workspace' },
          { text: 'Writing Workspace', link: '/recipes/writing-workspace' },
          { text: 'Research Workspace', link: '/recipes/research-workspace' },
          { text: 'Review Workspace', link: '/recipes/review-workspace' },
          { text: 'Imagegen Workspace', link: '/recipes/imagegen-workspace' },
          { text: 'Team Workspace', link: '/recipes/team-workspace' },
          { text: 'AI 开发网页流程', link: '/recipes/ai-web-development' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: '术语表', link: '/reference/glossary' },
          { text: 'AGENTS.md 参考', link: '/reference/agents-md' },
          { text: 'Codex 配置参考', link: '/reference/codex-config' },
          { text: '配置字段参考', link: '/reference/config-fields' }
        ]
      },
      {
        text: 'Troubleshooting',
        items: [
          { text: '常见问题', link: '/troubleshooting/common-issues' },
          { text: '排查方法', link: '/troubleshooting/debugging' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/twodogegg/agents-learn' }
    ]
  }
})
