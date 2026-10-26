<script setup lang="ts">
import type { ProductCategory } from '#shared/types/kitloom'

defineProps<{ category: ProductCategory }>()
const { toPath } = useLinks()
</script>

<template>
  <NuxtLink :to="toPath(category.link)" class="card category">
    <img v-if="category.image" :src="category.image" :alt="category.name" width="600" height="400" loading="lazy">
    <div class="body">
      <h3>{{ category.name }}</h3>
      <p>{{ category.description }}</p>
      <span class="count">{{ category.count }} products →</span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.category { display: block; overflow: hidden; text-decoration: none; color: var(--ink); transition: transform 0.2s ease; }
.category:hover { transform: translateY(-3px); }
.category img { aspect-ratio: 3 / 2; width: 100%; object-fit: cover; }
.body { padding: 1.1rem 1.3rem 1.3rem; }
.body p { color: var(--ink-soft); margin-bottom: 0.5rem; }
.count { color: var(--rust); font-weight: 600; }
</style>
