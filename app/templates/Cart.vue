<script setup lang="ts">
import type { Page } from '#shared/types/kitloom'
import { shortcode } from '~/utils/templates'

const props = defineProps<{ page: Page }>()
const { toPath } = useLinks()
const { cart, busy, setQuantity, remove } = useCart()

// The page came with the cart as the site drew it for this visitor: the freshest there is.
const initial = shortcode(props.page, 'woocommerce_cart')?.cart
if (initial) cart.value = initial

const shopPath = computed(() => toPath(props.page.store?.shop ?? '/shop/'))
const checkoutPath = computed(() => toPath(props.page.cart?.checkoutUrl ?? '/checkout/'))

const change = async (key: string, quantity: number) => {
  if (quantity < 1) return remove(key)
  await setQuantity(key, quantity)
}
</script>

<template>
  <div class="container section">
    <Breadcrumbs :items="page.breadcrumbs" />
    <p class="eyebrow">Shop</p>
    <h1>{{ page.content?.title ?? 'Cart' }}</h1>

    <div v-if="!cart || cart.isEmpty" class="empty card">
      <p>Your cart is empty.</p>
      <NuxtLink :to="shopPath" class="button">Back to the shop</NuxtLink>
    </div>

    <div v-else class="cart" :class="{ busy }">
      <ul class="lines">
        <li v-for="line in cart.lines" :key="line.key" class="line card">
          <NuxtLink :to="toPath(line.product.link)" class="thumb">
            <img v-if="line.product.image" :src="line.product.image" :alt="line.product.title" width="120" height="120">
          </NuxtLink>
          <div class="what">
            <NuxtLink :to="toPath(line.product.link)" class="title">{{ line.product.title }}</NuxtLink>
            <small v-if="line.variation?.title" class="variation">{{ line.variation.title }}</small>
            <small class="each">{{ line.priceFormatted }} each</small>
          </div>
          <div class="quantity">
            <button type="button" aria-label="Less" :disabled="busy" @click="change(line.key, line.quantity - 1)">−</button>
            <span>{{ line.quantity }}</span>
            <button type="button" aria-label="More" :disabled="busy || line.quantity >= line.maxQuantity" @click="change(line.key, line.quantity + 1)">+</button>
          </div>
          <strong class="total">{{ line.totalFormatted }}</strong>
          <button type="button" class="remove" :disabled="busy" :aria-label="`Remove ${line.product.title}`" @click="remove(line.key)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 5l14 14M19 5L5 19"/></svg>
          </button>
        </li>
      </ul>

      <aside class="summary card">
        <h2>Summary</h2>
        <dl>
          <dt>Subtotal</dt><dd>{{ cart.subtotalFormatted }}</dd>
          <template v-if="cart.needsShipping">
            <dt>Shipping<small v-if="cart.shippingRates.find(r => r.chosen)"> · {{ cart.shippingRates.find(r => r.chosen)?.label }}</small></dt>
            <dd>{{ cart.shippingTotalFormatted }}</dd>
          </template>
          <dt class="grand">Total</dt><dd class="grand">{{ cart.totalFormatted }}</dd>
        </dl>
        <p v-if="cart.untilFreeShippingFormatted" class="hint">{{ cart.untilFreeShippingFormatted }} more for free delivery.</p>

        <NuxtLink :to="checkoutPath" class="button wide">Proceed to checkout →</NuxtLink>
        <NuxtLink :to="shopPath" class="continue">← Continue shopping</NuxtLink>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.empty { padding: 3rem; text-align: center; }
.empty p { color: var(--muted); font-size: 1.15rem; }
.cart { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 2rem; align-items: start; }
.cart.busy { opacity: 0.7; }
.lines { list-style: none; margin: 0; padding: 0; display: grid; gap: 1rem; }
.line { display: grid; grid-template-columns: 84px minmax(0, 1fr) auto auto auto; gap: 1.25rem; align-items: center; padding: 1rem; }
.thumb { width: 84px; height: 84px; border-radius: 12px; overflow: hidden; background: var(--bg-deep); display: block; }
.thumb img { width: 100%; height: 100%; object-fit: cover; }
.what { display: flex; flex-direction: column; gap: 0.2rem; }
.title { color: var(--ink); text-decoration: none; font-weight: 600; font-size: 1.05rem; }
.title:hover { color: var(--rust); }
.variation, .each { color: var(--muted); }
.quantity { display: inline-flex; align-items: center; border: 1px solid var(--line); border-radius: 999px; background: var(--bg); }
.quantity button { border: 0; background: none; color: var(--ink); width: 34px; height: 36px; font-size: 1.1rem; cursor: pointer; }
.quantity button:disabled { opacity: 0.4; cursor: default; }
.quantity span { min-width: 1.5rem; text-align: center; font-weight: 600; }
.total { color: var(--rust); font-size: 1.1rem; min-width: 4.5rem; text-align: right; }
.remove { border: 0; background: none; color: var(--muted); cursor: pointer; padding: 0.4rem; border-radius: 8px; }
.remove:hover { color: var(--wine); background: var(--bg-deep); }
.summary { padding: 1.5rem; position: sticky; top: 90px; }
.summary h2 { font-size: 1.4rem; }
dl { display: grid; grid-template-columns: 1fr auto; gap: 0.5rem 1rem; margin: 0 0 1rem; }
dt { color: var(--ink-soft); }
dt small { color: var(--muted); }
dd { margin: 0; text-align: right; font-weight: 600; }
.grand { font-size: 1.25rem; color: var(--ink); border-top: 1px solid var(--line); padding-top: 0.6rem; }
dd.grand { color: var(--rust); font-family: var(--font-display); }
.hint { color: var(--moss); font-size: 0.95rem; }
.wide { width: 100%; justify-content: center; }
.button:disabled { opacity: 0.6; cursor: wait; }
.continue { display: inline-block; margin-top: 1rem; text-decoration: none; }
@media (max-width: 860px) {
  .cart { grid-template-columns: 1fr; }
  .line { grid-template-columns: 64px minmax(0, 1fr) auto; }
  .thumb { width: 64px; height: 64px; }
  .quantity { grid-column: 2; }
  .total { grid-column: 3; }
  .summary { position: static; }
}
</style>
