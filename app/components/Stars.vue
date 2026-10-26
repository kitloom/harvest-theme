<script setup lang="ts">
const props = defineProps<{ rating: number; count?: number }>()
const label = computed(() => `${props.rating.toFixed(1)} out of 5`)
</script>

<template>
  <span class="stars" :title="label">
    <span class="row" aria-hidden="true">
      <span class="fill" :style="{ width: `${(rating / 5) * 100}%` }">★★★★★</span>
      <span class="base">★★★★★</span>
    </span>
    <span class="visually-hidden">{{ label }}</span>
    <small v-if="count !== undefined" class="count">({{ count }})</small>
  </span>
</template>

<style scoped>
.stars { display: inline-flex; align-items: center; gap: 0.35rem; }
.row { position: relative; display: inline-block; font-size: 0.95rem; letter-spacing: 0.05em; line-height: 1; }
.base { color: var(--line); }
.fill { position: absolute; inset: 0 auto 0 0; overflow: hidden; white-space: nowrap; color: var(--mustard); }
.count { color: var(--muted); }
</style>
