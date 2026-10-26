<script setup lang="ts">
const { notice } = useNotice()
</script>

<template>
  <Transition name="notice">
    <div v-if="notice" class="notice" role="status">
      <span>{{ notice.text }}</span>
      <NuxtLink v-if="notice.link" :to="notice.link.to" class="view">{{ notice.link.label }} →</NuxtLink>
    </div>
  </Transition>
</template>

<style scoped>
.notice {
  position: fixed; left: 50%; bottom: 1.5rem; transform: translateX(-50%); z-index: 30;
  display: flex; gap: 1rem; align-items: center; max-width: calc(100% - 32px);
  background: var(--ink); color: var(--bg); padding: 0.8rem 1.2rem; border-radius: 999px; box-shadow: var(--shadow);
}
.view { color: var(--mustard); font-weight: 600; text-decoration: none; white-space: nowrap; }
.notice-enter-active, .notice-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.notice-enter-from, .notice-leave-to { opacity: 0; transform: translate(-50%, 10px); }
</style>
