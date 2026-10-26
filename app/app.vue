<script setup lang="ts">
// A page is one component for every address; the key remounts it when the address changes.
</script>

<template>
  <NuxtLoadingIndicator color="var(--rust)" :height="3" />
  <NuxtLayout>
    <NuxtPage :page-key="route => route.fullPath" :transition="{ name: 'page', mode: 'out-in' }" />
  </NuxtLayout>
</template>
