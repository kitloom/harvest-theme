<script setup lang="ts">
import type { Comment, CommentFormData } from '#shared/types/kitloom'

/** A thread: every comment with its replies, a "Reply" under those the site allows a reply to. */
defineProps<{ comments: Comment[] }>()

const thread = inject<{
  form: CommentFormData | null
  replyTo: Ref<number | null>
  posted: (comment: Comment, message: string | null) => void
}>('kitloom:thread')
</script>

<template>
  <ol class="comments">
    <li v-for="comment in comments" :id="`comment-${comment.id}`" :key="comment.id" class="comment">
      <div class="avatar" :class="{ author: comment.author.isPostAuthor }">{{ comment.author.initials }}</div>
      <div class="bubble" :class="{ held: comment.status !== 'approved' }">
        <div class="who">
          <a v-if="comment.author.url" :href="comment.author.url" rel="nofollow ugc noopener" target="_blank"><strong>{{ comment.author.name }}</strong></a>
          <strong v-else>{{ comment.author.name }}</strong>
          <span v-if="comment.author.isPostAuthor" class="badge moss">Author</span>
          <span v-if="comment.status !== 'approved'" class="badge">Awaiting moderation</span>
          <time>{{ comment.dateText }}</time>
        </div>
        <p v-for="(paragraph, index) in comment.paragraphs" :key="index">{{ paragraph }}</p>
        <button
          v-if="thread?.form && !thread.form.mustLogIn && comment.canReply && comment.status === 'approved' && thread.replyTo.value !== comment.id"
          type="button"
          class="reply-link"
          @click="thread.replyTo.value = comment.id"
        >Reply</button>
        <CommentForm
          v-if="thread?.form && thread.replyTo.value === comment.id"
          :form="thread.form"
          :parent="comment"
          @posted="thread.posted"
          @cancel="thread.replyTo.value = null"
        />
        <CommentList v-if="comment.children.length" :comments="comment.children" />
      </div>
    </li>
  </ol>
</template>

<style scoped>
.comments { list-style: none; margin: 0; padding: 0; display: grid; gap: 1.25rem; }
.comment { display: grid; grid-template-columns: 44px 1fr; gap: 0.9rem; }
.avatar { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; background: var(--mustard); color: #2e1f14; font-size: 0.9rem; }
.avatar.author { background: var(--rust); color: #fff8ee; }
.bubble { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 0.9rem 1.1rem; min-width: 0; }
.bubble.held { border-style: dashed; }
.who { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; flex-wrap: wrap; }
.who a { color: var(--ink); text-decoration: none; }
.who time { color: var(--muted); font-size: 0.85rem; margin-left: auto; }
.bubble p:last-of-type { margin-bottom: 0.25rem; }
.bubble .comments { margin-top: 1rem; }
.reply-link { background: none; border: 0; padding: 0; color: var(--rust); font: inherit; font-weight: 600; font-size: 0.9rem; cursor: pointer; }
.reply-link:hover { text-decoration: underline; }
</style>
