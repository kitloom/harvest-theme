<script setup lang="ts">
import type { Entry, Term } from '#shared/types/kitloom'

const props = defineProps<{ post: Entry }>()
const { toPath } = useLinks()

const categories = computed<Term[]>(() => {
  const terms = props.post.terms
  if (Array.isArray(terms)) return []
  return terms.category ?? terms.product_cat ?? Object.values(terms)[0] ?? []
})
</script>

<template>
  <article class="card post">
    <NuxtLink :to="toPath(post.link)" class="cover" :aria-label="post.title">
      <img v-if="post.thumbnail" :src="post.thumbnail.url" :alt="post.thumbnail.alt" :width="post.thumbnail.width" :height="post.thumbnail.height" loading="lazy">
      <div v-else class="cover-empty" />
    </NuxtLink>
    <div class="body">
      <div v-if="categories.length" class="eyebrow">
        <NuxtLink v-for="term in categories" :key="term.id" :to="toPath(term.link)">{{ term.name }}</NuxtLink>
      </div>
      <h3><NuxtLink :to="toPath(post.link)">{{ post.title }}</NuxtLink></h3>
      <p v-if="post.excerpt" class="excerpt">{{ post.excerpt }}</p>
      <p v-if="post.formattedDate" class="meta">
        <time :datetime="post.date ?? undefined">{{ post.formattedDate }}</time>
        <template v-if="post.author"> · {{ post.author.name }}</template>
      </p>
    </div>
  </article>
</template>

<style scoped>
.post { overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.post:hover { transform: translateY(-3px); box-shadow: 0 18px 40px -20px rgba(46, 31, 20, 0.5); }
.cover { display: block; aspect-ratio: 16 / 9; background: var(--bg-deep); }
.cover img { width: 100%; height: 100%; object-fit: cover; }
.cover-empty { height: 100%; background: linear-gradient(135deg, var(--pumpkin), var(--mustard)); }
.body { padding: 1.25rem 1.4rem 1.4rem; }
.eyebrow a { text-decoration: none; color: inherit; margin-right: 0.6rem; }
h3 { font-size: 1.3rem; }
h3 a { color: var(--ink); text-decoration: none; }
h3 a:hover { color: var(--rust); }
.excerpt { color: var(--ink-soft); margin-bottom: 0.75rem; }
.meta { margin: 0; font-size: 0.875rem; color: var(--muted); }
</style>
