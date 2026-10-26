<script setup lang="ts">
import type { Order } from '#shared/types/kitloom'

/** What an order holds and where it goes: the same block on the receipt and in the account. */
defineProps<{ order: Order }>()
const { toPath } = useLinks()
</script>

<template>
  <div class="columns">
    <div class="card items">
      <h2>What you ordered</h2>
      <ul>
        <li v-for="item in order.items" :key="item.productId + (item.variation ?? '')">
          <span>
            <NuxtLink :to="toPath(item.link)">{{ item.name }}</NuxtLink>
            <small v-if="item.variation"> · {{ item.variation }}</small>
            <small> × {{ item.quantity }}</small>
          </span>
          <strong>{{ item.totalFormatted }}</strong>
        </li>
      </ul>
      <dl class="totals">
        <dt>Subtotal</dt><dd>{{ order.subtotalFormatted }}</dd>
        <template v-if="order.needsShipping"><dt>{{ order.shippingLabel || 'Delivery' }}</dt><dd>{{ order.shippingFormatted }}</dd></template>
        <dt class="grand">Total</dt><dd class="grand">{{ order.totalFormatted }}</dd>
      </dl>
    </div>

    <div class="addresses">
      <div class="card address">
        <h2>Billing</h2>
        <p v-for="line in order.billing" :key="line">{{ line }}</p>
        <p v-if="order.phone">{{ order.phone }}</p>
        <p>{{ order.email }}</p>
      </div>
      <div v-if="order.needsShipping" class="card address">
        <h2>Delivery</h2>
        <p v-for="line in order.shipping" :key="line">{{ line }}</p>
      </div>
      <p v-if="order.customerNote" class="note card"><strong>Your note:</strong> {{ order.customerNote }}</p>
    </div>
  </div>
</template>

<style scoped>
.columns { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1.5rem; }
.card { padding: 1.5rem; }
.card h2 { font-size: 1.25rem; }
.items ul { list-style: none; margin: 0 0 1rem; padding: 0; }
.items li { display: flex; justify-content: space-between; gap: 1rem; padding: 0.6rem 0; border-bottom: 1px solid var(--line); }
.items li a { color: var(--ink); text-decoration: none; font-weight: 600; }
.items li small { color: var(--muted); }
.totals { display: grid; grid-template-columns: 1fr auto; gap: 0.4rem 1rem; margin: 0; }
.totals dt { color: var(--ink-soft); }
.totals dd { margin: 0; text-align: right; font-weight: 600; }
.grand { font-size: 1.2rem; color: var(--ink); padding-top: 0.5rem; }
dd.grand { color: var(--rust); font-family: var(--font-display); }
.addresses { display: grid; gap: 1.5rem; align-content: start; }
.address p { margin: 0; }
.note { color: var(--ink-soft); }
@media (max-width: 800px) { .columns { grid-template-columns: minmax(0, 1fr); } }
</style>
