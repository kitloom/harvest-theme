<script setup lang="ts">
/** The storefront names Bootstrap icons; a few are drawn here, the rest fall back to a leaf. */
const props = defineProps<{ name: string }>()

const paths: Record<string, string> = {
  'tree': 'M12 2 6 11h3l-4 6h5v3h4v-3h5l-4-6h3z',
  'heart-pulse': 'M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9zM3 12h4l2-3 2 6 2-4h4',
  'piggy-bank': 'M5 11a7 7 0 0 1 12-4l3-1v4l-2 1v3l-2 3h-2l-1-2H9l-1 2H6l-1-3V11zM15 10h.01',
  'box-seam': 'M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10',
  'snow3': 'M12 2v20M4 6l16 12M4 18 20 6',
  'fire': 'M12 22c-4 0-7-3-7-7 0-3 2-5 3-7 0 3 2 4 2 4 0-4 3-7 5-10 1 4 4 6 4 11 0 5-3 9-7 9z',
}

const d = computed(() => paths[props.name] ?? 'M12 3c5 2 8 7 6 13-5-1-9-5-9-10 0-1 .2-2 .5-3zM11 6c-2 4-2 8 1 12')
</script>

<template>
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="d" />
  </svg>
</template>
