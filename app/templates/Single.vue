<script setup lang="ts">
import type { Comment, Page, Term } from '#shared/types/kitloom'

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
// The thread as the site drew it, then with what this visitor posted on the page.
const comments = ref(props.page.comments ? structuredClone(toRaw(props.page.comments)) : null)
const replyTo = ref<number | null>(null)
const { notify } = useNotice()

const insert = (list: Comment[], comment: Comment): boolean => {
  for (const item of list) {
    if (item.id === comment.parentId) {
      item.children.push(comment)
      return true
    }
    if (insert(item.children, comment)) return true
  }
  return false
}

const posted = async (comment: Comment, message: string | null) => {
  if (!comments.value) return
  if (!comment.parentId || !insert(comments.value.items, comment)) comments.value.items.push(comment)
  if (comment.status === 'approved') comments.value.count++
  replyTo.value = null
  notify(message ?? 'Your comment is published.')
  await nextTick()
  document.getElementById(`comment-${comment.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

provide('kitloom:thread', { form: comments.value?.form ?? null, replyTo, posted })
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

    <section v-if="comments && (comments.count || comments.open || comments.items.length)" id="comments" class="comments">
      <h2>{{ comments.count ? `${comments.count} ${comments.count === 1 ? 'comment' : 'comments'}` : 'Comments' }}</h2>
      <nav v-if="comments.pages > 1" class="comment-pages">
        <NuxtLink v-if="comments.prevUrl" :to="toPath(comments.prevUrl) + '#comments'">← Older comments</NuxtLink>
        <span v-else />
        <NuxtLink v-if="comments.nextUrl" :to="toPath(comments.nextUrl) + '#comments'">Newer comments →</NuxtLink>
      </nav>
      <CommentList v-if="comments.items.length" :comments="comments.items" />
      <p v-else-if="comments.open" class="muted">No comments yet. Be the first.</p>
      <CommentForm v-if="comments.open && comments.form && replyTo === null" id="respond" :form="comments.form" @posted="posted" />
      <p v-else-if="!comments.open" class="muted closed">Comments are closed.</p>
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
.comment-pages { display: flex; justify-content: space-between; margin-bottom: 1rem; }
.comment-pages a { text-decoration: none; font-weight: 600; }
.muted { color: var(--muted); }
.closed { margin-top: 1.5rem; }
</style>
