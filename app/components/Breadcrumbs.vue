<script setup lang="ts">
import type { Breadcrumb } from '#shared/types/kitloom'

defineProps<{ items: Breadcrumb[] | undefined }>()
const { toPath } = useLinks()
</script>

<template>
  <nav v-if="items && items.length > 1" class="crumbs" aria-label="Breadcrumb">
    <ol>
      <li v-for="(item, index) in items" :key="item.url">
        <NuxtLink v-if="index < items.length - 1" :to="toPath(item.url)">{{ item.title }}</NuxtLink>
        <span v-else aria-current="page">{{ item.title }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.crumbs ol { list-style: none; display: flex; flex-wrap: wrap; gap: 0.35rem; margin: 0 0 1rem; padding: 0; font-size: 0.9rem; color: var(--muted); }
.crumbs li + li::before { content: '›'; margin-right: 0.35rem; color: var(--pumpkin); }
.crumbs a { color: var(--muted); text-decoration: none; }
.crumbs a:hover { color: var(--rust); }
</style>
