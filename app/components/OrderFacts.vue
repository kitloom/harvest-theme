<script setup lang="ts">
import type { Order } from '#shared/types/kitloom'

defineProps<{ order: Order }>()
</script>

<template>
  <div class="facts">
    <div><small>Order</small><strong>#{{ order.number }}</strong></div>
    <div><small>Date</small><strong>{{ order.date }}</strong></div>
    <div><small>Status</small><strong>{{ order.statusLabel }}</strong></div>
    <div><small>Payment</small><strong>{{ order.paymentMethodTitle }}</strong></div>
    <div><small>Total</small><strong class="total">{{ order.totalFormatted }}</strong></div>
  </div>
</template>

<style scoped>
.facts { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem 2.5rem; padding: 1.25rem; margin-bottom: 2rem; border-top: 1px dashed var(--line); border-bottom: 1px dashed var(--line); }
.facts div { display: flex; flex-direction: column; }
.facts small { color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; }
.total { color: var(--rust); font-family: var(--font-display); font-size: 1.3rem; }
</style>
