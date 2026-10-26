<script setup lang="ts">
/**
 * Cloudflare Turnstile, drawn where the site's form asks for it. The token goes out through
 * v-model; `reset()` asks for a new one after a submission, since a token is used once.
 * The theme's address has to be among the widget's hostnames in Cloudflare (a test key works
 * anywhere).
 */
const props = defineProps<{ siteKey: string }>()
const token = defineModel<string>({ default: '' })

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

const box = ref<HTMLElement | null>(null)
let widget: string | null = null

const api = (): Promise<TurnstileApi> => {
  const w = window as unknown as { turnstile?: TurnstileApi; __turnstileLoading?: Promise<TurnstileApi> }
  if (w.turnstile) return Promise.resolve(w.turnstile)
  w.__turnstileLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => resolve(w.turnstile!)
    script.onerror = () => reject(new Error('Turnstile did not load.'))
    document.head.appendChild(script)
  })
  return w.__turnstileLoading
}

onMounted(async () => {
  const turnstile = await api()
  if (!box.value) return
  widget = turnstile.render(box.value, {
    'sitekey': props.siteKey,
    'theme': 'auto',
    'callback': (value: string) => { token.value = value },
    'expired-callback': () => { token.value = '' },
    'error-callback': () => { token.value = '' },
  })
})

onBeforeUnmount(() => {
  const w = window as unknown as { turnstile?: TurnstileApi }
  if (widget && w.turnstile) w.turnstile.remove(widget)
})

defineExpose({
  reset: () => {
    token.value = ''
    const w = window as unknown as { turnstile?: TurnstileApi }
    if (widget && w.turnstile) w.turnstile.reset(widget)
  },
})
</script>

<template>
  <div ref="box" class="turnstile" />
</template>

<style scoped>
.turnstile { min-height: 65px; margin: 0.5rem 0 1rem; }
</style>
