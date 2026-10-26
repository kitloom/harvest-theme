<script setup lang="ts">
import type { Comment } from '#shared/types/kitloom'

defineProps<{ comments: Comment[] }>()
</script>

<template>
  <ol class="comments">
    <li v-for="comment in comments" :key="comment.id" :id="`comment-${comment.id}`" class="comment">
      <div class="avatar" :class="{ author: comment.author.isPostAuthor }">{{ comment.author.initials }}</div>
      <div class="bubble">
        <div class="who">
          <strong>{{ comment.author.name }}</strong>
          <span v-if="comment.author.isPostAuthor" class="badge moss">Author</span>
          <time>{{ comment.dateText }}</time>
        </div>
        <p v-for="(paragraph, index) in comment.paragraphs" :key="index">{{ paragraph }}</p>
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
.bubble { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 0.9rem 1.1rem; }
.who { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; }
.who time { color: var(--muted); font-size: 0.85rem; margin-left: auto; }
.bubble p:last-child { margin-bottom: 0; }
.bubble .comments { margin-top: 1rem; }
</style>
