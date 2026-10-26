<script setup lang="ts">
/**
 * Words written in the admin. Links to the site become links of the theme, and a click on
 * one navigates without leaving the app.
 */
const props = defineProps<{ html: string | null | undefined }>()

const { rewrite, isInternal, toPath } = useLinks()

const html = computed(() => rewrite(props.html))

const onClick = (event: MouseEvent) => {
  const anchor = (event.target as HTMLElement).closest('a')
  if (!anchor || anchor.target === '_blank' || event.metaKey || event.ctrlKey) return

  const href = anchor.getAttribute('href') ?? ''
  if (href.startsWith('#') || !isInternal(href)) return

  event.preventDefault()
  navigateTo(toPath(href))
}
</script>

<template>
  <div v-html="html" @click="onClick" />
</template>
