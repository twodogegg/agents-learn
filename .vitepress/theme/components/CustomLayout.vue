<script setup>
import DefaultTheme from 'vitepress/theme'
import CopyMarkdown from './CopyMarkdown.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #doc-before>
      <CopyMarkdown />
    </template>
  </Layout>
</template>
