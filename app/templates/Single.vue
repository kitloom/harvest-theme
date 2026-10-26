<script setup lang="ts">
import type { Page, Term } from '#shared/types/kitloom'

const props = defineProps<{ page: Page }>()
const { toPath } = useLinks()

const content = computed(() => props.page.content!)
const isPost = computed(() => content.value.type === 'post')

const termsOf = (taxonomy: string): Term[] => {
  const terms = content.value.terms
  return Array.isArray(terms) ? [] : terms[taxonomy] ?? []
}
const categories = computed(() => termsOf('category'))
const tags = computed(() => termsOf('post_tag'))
const comments = computed(() => props.page.comments)
</script>

<template>
  <article class="container section">
    <Breadcrumbs :items="page.breadcrumbs" />

    <header class="head" :class="{ wide: !content.thumbnail }">
      <div v-if="categories.length" class="eyebrow">
        <NuxtLink v-for="term in categories" :key="term.id" :to="toPath(term.link)">{{ term.name }}</NuxtLink>
      </div>
      <h1>{{ content.title }}</h1>
      <p v-if="isPost && content.excerpt" class="lede">{{ content.excerpt }}</p>
      <p v-if="isPost && content.formattedDate" class="meta">
        <time :datetime="content.date ?? undefined">{{ content.formattedDate }}</time>
        <template v-if="content.author"> · by {{ content.author.name }}</template>
      </p>
    </header>

    <figure v-if="content.thumbnail" class="cover">
      <img :src="content.thumbnail.url" :alt="content.thumbnail.alt" :width="content.thumbnail.width" :height="content.thumbnail.height">
    </figure>

    <HtmlContent :html="content.content" class="prose" />

    <ul v-if="tags.length" class="pill-list tags">
      <li v-for="tag in tags" :key="tag.id"><NuxtLink :to="toPath(tag.link)" class="pill">#{{ tag.name }}</NuxtLink></li>
    </ul>

    <section v-if="comments && (comments.count || comments.open)" class="comments">
      <h2>{{ comments.count ? `${comments.count} comments` : 'Comments' }}</h2>
      <CommentList v-if="comments.items.length" :comments="comments.items" />
      <p v-if="comments.open" class="reply">
        <a :href="content.link + '#respond'" class="button ghost small">Leave a comment on the site</a>
      </p>
    </section>
  </article>
</template>

<style scoped>
.head { max-width: 760px; margin-bottom: 2rem; }
.eyebrow a { text-decoration: none; color: inherit; margin-right: 0.6rem; }
.meta { color: var(--muted); }
.cover { margin: 0 0 2.5rem; }
.cover img { width: 100%; max-height: 520px; object-fit: cover; border-radius: 24px; box-shadow: var(--shadow); }
.tags { margin-top: 2rem; }
.comments { max-width: 760px; margin-top: 3.5rem; padding-top: 2rem; border-top: 1px solid var(--line); }
.reply { margin-top: 1.5rem; }
</style>
