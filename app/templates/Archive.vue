<script setup lang="ts">
import type { Page } from '#shared/types/kitloom'

const props = defineProps<{ page: Page }>()

const content = computed(() => props.page.content)
const posts = computed(() => props.page.posts!)

const heading = computed(() => {
  if (props.page.kind === 'search') return `Results for “${content.value?.title}”`
  return content.value?.title
})

const eyebrow = computed(() => ({
  category: 'Category', tag: 'Tag', author: 'Author', search: 'Search', home: 'Journal', date: 'Archive',
})[props.page.kind] ?? 'Archive')
</script>

<template>
  <div class="container section">
    <Breadcrumbs :items="page.breadcrumbs" />
    <header class="archive-head">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ heading }}</h1>
      <HtmlContent v-if="content?.content" :html="content.content" class="lede" />
      <p v-if="page.kind === 'search'" class="lede">{{ posts.pagination.total }} found</p>
    </header>

    <div v-if="posts.items.length" class="grid cols-3">
      <PostCard v-for="post in posts.items" :key="post.id ?? post.link" :post="post" />
    </div>
    <p v-else class="empty card">Nothing here yet.</p>

    <Pager :pagination="posts.pagination" />
  </div>
</template>

<style scoped>
.archive-head { margin-bottom: 2.5rem; }
.empty { padding: 2rem; text-align: center; color: var(--muted); }
</style>
