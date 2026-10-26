<script setup lang="ts">
import { resolveTemplate } from '~/utils/templates'

// Every address of the site is this page: the site says which template the address is.
const { page } = usePage()

usePageHead(page)

const template = computed(() => resolveTemplate(page.value))
</script>

<template>
  <component :is="template" :page="page" />
</template>
