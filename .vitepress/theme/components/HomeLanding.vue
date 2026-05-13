<script setup lang="ts">
import { useData } from 'vitepress'

const { site } = useData()

const pillars = [
  {
    title: 'Prompts',
    kicker: 'LEVEL 01',
    text: '写清目标、上下文和约束，先把任务入口做稳。',
    link: '/prompts/overview'
  },
  {
    title: 'Skills',
    kicker: 'LEVEL 02',
    text: '把稳定流程封装成 skill，变成可重复使用的技能卡。',
    link: '/skills/overview'
  },
  {
    title: 'Workspace',
    kicker: 'LEVEL 03',
    text: '整理目录、配置和上下文，让每次开局都有基地。',
    link: '/workspace/overview'
  },
  {
    title: 'MCP',
    kicker: 'LEVEL 04',
    text: '接入 tools、resources 和 prompts，把外部系统连进地图。',
    link: '/mcp/overview'
  }
]

const routes = [
  { text: '快速开始', link: '/guide/quick-start' },
  { text: 'Agent 概念', link: '/concepts/agent' },
  { text: '创建 Skill', link: '/skills/create-skill' },
  { text: '配置 Workspace', link: '/workspace/overview' }
]

const notes = [
  'Prompt → Agent → Skill → MCP → Workspace',
  'AGENTS.md、memory、roles 的职责边界',
  '把一次性经验升级成可复用 workflow'
]
</script>

<template>
  <div class="home-landing">
    <header class="home-nav">
      <a class="home-brand" href="/">{{ site.title }}</a>
      <nav aria-label="首页导航">
        <a href="/guide/overview">Guide</a>
        <a href="/prompts/overview">Prompts</a>
        <a href="/skills/overview">Skills</a>
        <a href="/workspace/overview">Workspace</a>
      </nav>
    </header>

    <section class="home-hero-panel">
      <div class="home-hero-copy">
        <p class="home-eyebrow">PLAYER GUIDE / AI QUEST</p>
        <h1>AI Agent Quest Map</h1>
        <p class="home-lead">
          用 8-bit 地图整理 prompts、skills、MCP 和 workspace，把零散经验升级成可复用的工作环境。
        </p>
        <div class="home-actions" aria-label="主要入口">
          <a class="home-action primary" href="/guide/quick-start">START QUEST</a>
          <a class="home-action secondary" href="/workspace/overview">BASE CAMP</a>
        </div>
      </div>

      <div class="home-visual" aria-label="像素风 Agent Workspace 信息图">
        <img src="/images/pixel-agent-workspace-quest.png" alt="" />
      </div>
    </section>

    <section class="home-route-strip" aria-label="推荐路线">
      <a v-for="route in routes" :key="route.link" :href="route.link">
        {{ route.text }}
      </a>
    </section>

    <section class="home-section home-pillar-section">
      <div class="home-section-heading">
        <p>WORLD MAP</p>
        <h2>四个区域，一条升级路线</h2>
      </div>
      <div class="home-pillars">
        <a v-for="pillar in pillars" :key="pillar.link" class="home-pillar" :href="pillar.link">
          <span>{{ pillar.kicker }}</span>
          <strong>{{ pillar.title }}</strong>
          <p>{{ pillar.text }}</p>
        </a>
      </div>
    </section>

    <section class="home-section home-journal">
      <div>
        <p class="home-eyebrow">SAVE POINT</p>
        <h2>不是堆资料，而是把做事方式存档</h2>
      </div>
      <ul>
        <li v-for="note in notes" :key="note">{{ note }}</li>
      </ul>
    </section>
  </div>
</template>
