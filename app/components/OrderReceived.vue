<script setup lang="ts">
import type { Order } from '#shared/types/kitloom'

defineProps<{
  order: Order
  paymentInstructions?: string
  bankDetails?: Record<string, string>[]
  shopPath: string
}>()

const detailLabel = (key: string) => key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
</script>

<template>
  <div class="received">
    <div class="thanks">
      <span class="mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
      </span>
      <p class="eyebrow">Order received</p>
      <h1>Thank you, {{ order.customer }}.</h1>
      <p class="lede">Your order is on its way to being packed. A confirmation went to {{ order.email }}.</p>
    </div>

    <OrderFacts :order="order" />

    <div v-if="paymentInstructions || bankDetails?.length" class="card instructions">
      <h2>How to pay</h2>
      <p v-if="paymentInstructions">{{ paymentInstructions }}</p>
      <dl v-for="(account, index) in bankDetails" :key="index" class="bank">
        <template v-for="(value, key) in account" :key="key">
          <template v-if="value">
            <dt>{{ detailLabel(String(key)) }}</dt>
            <dd>{{ value }}</dd>
          </template>
        </template>
      </dl>
    </div>

    <OrderDetails :order="order" />

    <p class="back"><NuxtLink :to="shopPath" class="button ghost">← Back to the shop</NuxtLink></p>
  </div>
</template>

<style scoped>
.thanks { text-align: center; max-width: 640px; margin: 0 auto 2.5rem; }
.thanks .lede { margin-inline: auto; }
.mark { display: inline-grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: var(--moss); color: #fff8ee; margin-bottom: 1rem; }
.card { padding: 1.5rem; }
.card h2 { font-size: 1.25rem; }
.instructions { margin-bottom: 2rem; border-left: 4px solid var(--mustard); }
.bank { display: grid; grid-template-columns: auto 1fr; gap: 0.3rem 1.25rem; margin: 0.75rem 0 0; }
.bank dt { color: var(--muted); }
.bank dd { margin: 0; font-weight: 600; }
.back { text-align: center; margin-top: 2.5rem; }
</style>
