<script setup>
import { useData, withBase } from 'vitepress'
import { ref } from 'vue'

const { frontmatter, site, page } = useData()
const copied = ref(false)

function resolveImageUrls(md) {
  const baseUrl = `https://agents-learn.darl.cn${site.value.base}`
  const dir = page.value.relativePath.replace(/[^/]+$/, '')
  return md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    if (src.startsWith('http://') || src.startsWith('https://')) return match
    const resolved = src.startsWith('/')
      ? `${baseUrl}${src.slice(1)}`
      : `${baseUrl}${dir}${src}`
    return `![${alt}](${resolved})`
  })
}

function copyMarkdown() {
  const raw = frontmatter.value.rawMarkdown
  if (!raw) return
  const content = resolveImageUrls(raw)
  navigator.clipboard.writeText(content).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}
</script>

<template>
  <button
    v-if="frontmatter.layout !== 'page'"
    class="copy-md-btn"
    :class="{ copied }"
    :title="copied ? '已复制!' : '复制 Markdown'"
    @click="copyMarkdown"
  >
    <img :src="withBase('/copy-icon.png')" alt="copy" class="copy-md-icon" />
  </button>
</template>
