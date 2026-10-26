<script setup lang="ts">
import type { Pagination } from '#shared/types/kitloom'

defineProps<{ pagination: Pagination }>()
const { toPath } = useLinks()
</script>

<template>
  <nav v-if="pagination.pages > 1" class="pager" aria-label="Pages">
    <NuxtLink v-if="pagination.previous" :to="toPath(pagination.previous)" class="button ghost small">← Newer</NuxtLink>
    <span v-else />
    <span class="where">Page {{ pagination.page }} of {{ pagination.pages }}</span>
    <NuxtLink v-if="pagination.next" :to="toPath(pagination.next)" class="button ghost small">Older →</NuxtLink>
    <span v-else />
  </nav>
</template>

<style scoped>
.pager { display: flex; justify-content: space-between; align-items: center; margin-top: 2.5rem; gap: 1rem; }
.where { color: var(--muted); }
</style>
