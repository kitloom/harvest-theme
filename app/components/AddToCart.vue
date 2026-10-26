<script setup lang="ts">
import type { Product } from '#shared/types/kitloom'

const props = withDefaults(defineProps<{ product: Product; quantity?: number; compact?: boolean }>(), { quantity: 1 })
const { add, busy } = useCart()
const { toPath } = useLinks()

const canAdd = computed(() => props.product.purchasable && props.product.inStock && props.product.type !== 'variable')
const adding = ref(false)

const onClick = async () => {
  adding.value = true
  await add(props.product.id, props.quantity)
  adding.value = false
}
</script>

<template>
  <!-- A variable product is chosen on its page; the rest goes straight in. -->
  <NuxtLink v-if="product.type === 'variable'" :to="toPath(product.link)" class="button ghost" :class="{ small: compact }">
    Choose options
  </NuxtLink>
  <button
    v-else
    type="button"
    class="button"
    :class="{ small: compact, icon: compact }"
    :disabled="!canAdd || busy"
    :aria-label="compact ? `Add ${product.title} to cart` : undefined"
    @click="onClick"
  >
    <svg v-if="!adding" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 7h15l-1.5 8H7.5z"/><path d="M6 7 5 3H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path v-if="compact" d="M12 9v4m-2-2h4"/></svg>
    <svg v-else class="spin" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9"/></svg>
    <span v-if="!compact">{{ canAdd ? 'Add to cart' : 'Sold out' }}</span>
  </button>
</template>

<style scoped>
.button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.button.icon { padding: 0.45rem 0.6rem; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
