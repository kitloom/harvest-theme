<script setup lang="ts">
import type { Page } from '#shared/types/kitloom'

defineProps<{ page: Page }>()
const search = ref('')
</script>

<template>
  <div class="container section lost">
    <p class="eyebrow">404</p>
    <h1>This leaf has fallen.</h1>
    <p class="lede">There is no page at this address. Try a search, or go back to the start.</p>
    <form class="find" @submit.prevent="search.trim() && navigateTo({ path: '/', query: { s: search.trim() } })">
      <input v-model="search" type="search" placeholder="Search the site…" aria-label="Search">
      <button type="submit" class="button">Search</button>
    </form>
    <NuxtLink to="/" class="button ghost">Home</NuxtLink>
  </div>
</template>

<style scoped>
.lost { text-align: center; padding-block: 6rem; }
.lede { margin-inline: auto; }
.find { display: flex; gap: 0.5rem; justify-content: center; margin: 2rem 0 1rem; }
.find input { font: inherit; padding: 0.7rem 1rem; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); width: min(360px, 100%); }
</style>
