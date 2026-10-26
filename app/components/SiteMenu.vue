<script setup lang="ts">
import type { MenuItem } from '#shared/types/kitloom'

defineProps<{ items: MenuItem[] }>()

const { isInternal, toPath } = useLinks()
</script>

<template>
  <ul class="menu">
    <li v-for="item in items" :key="item.id" :class="{ 'has-children': item.children.length }">
      <NuxtLink v-if="isInternal(item.url)" :to="toPath(item.url)">{{ item.title }}</NuxtLink>
      <a v-else :href="item.url" :target="item.target || undefined" rel="noopener">{{ item.title }}</a>

      <ul v-if="item.children.length" class="sub">
        <li v-for="child in item.children" :key="child.id">
          <NuxtLink v-if="isInternal(child.url)" :to="toPath(child.url)">{{ child.title }}</NuxtLink>
          <a v-else :href="child.url" rel="noopener">{{ child.title }}</a>
        </li>
      </ul>
    </li>
  </ul>
</template>

<style scoped>
.menu, .sub { list-style: none; margin: 0; padding: 0; }
.menu { display: flex; gap: 0.25rem; }
.menu > li { position: relative; }
.menu a { display: block; padding: 0.5rem 0.75rem; border-radius: 10px; color: var(--ink); text-decoration: none; font-weight: 600; }
.menu a:hover, .menu a.router-link-active { color: var(--rust); background: rgba(221, 122, 44, 0.1); }
.sub {
  position: absolute; top: 100%; left: 0; min-width: 190px; padding: 0.4rem;
  background: var(--surface); border: 1px solid var(--line); border-radius: 12px; box-shadow: var(--shadow);
  opacity: 0; visibility: hidden; transform: translateY(6px); transition: all 0.15s ease;
}
.has-children:hover .sub, .has-children:focus-within .sub { opacity: 1; visibility: visible; transform: none; }
.sub a { font-weight: 500; padding: 0.45rem 0.7rem; }

@media (max-width: 900px) {
  .menu { flex-direction: column; }
  .sub { position: static; opacity: 1; visibility: visible; transform: none; box-shadow: none; border: 0; background: none; padding: 0 0 0 1rem; }
}
</style>
