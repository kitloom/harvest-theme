<script setup lang="ts">
import type { OrderRow } from '#shared/types/kitloom'

defineProps<{ orders: OrderRow[] }>()
const { toPath } = useLinks()
</script>

<template>
  <div class="card table-wrap">
    <table class="orders">
      <thead>
        <tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th><th><span class="visually-hidden">Actions</span></th></tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td><NuxtLink :to="toPath(order.link)" class="number">#{{ order.number }}</NuxtLink></td>
          <td>{{ order.date }}</td>
          <td><span class="status" :class="order.status">{{ order.statusLabel }}</span></td>
          <td>{{ order.totalFormatted }} <small>for {{ order.itemCount }} {{ order.itemCount === 1 ? 'item' : 'items' }}</small></td>
          <td class="actions">
            <a v-if="order.urls.pay" :href="order.urls.pay" class="button small">Pay</a>
            <NuxtLink :to="toPath(order.link)" class="button ghost small">View</NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap { position: relative; overflow-x: auto; }
.orders { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 0.9rem 1.1rem; border-bottom: 1px solid var(--line); white-space: nowrap; }
th { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); font-weight: 600; }
tr:last-child td { border-bottom: 0; }
.number { font-weight: 700; text-decoration: none; }
small { color: var(--muted); }
.status { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; background: var(--bg-deep); color: var(--ink-soft); }
.status.processing, .status.completed { background: rgba(95, 110, 47, 0.18); color: var(--moss); }
.status.on-hold, .status.pending { background: rgba(217, 166, 43, 0.25); color: color-mix(in srgb, var(--mustard) 45%, var(--ink)); }
.status.cancelled, .status.failed, .status.refunded { background: rgba(123, 34, 50, 0.12); color: var(--wine); }
.actions { text-align: right; display: flex; gap: 0.5rem; justify-content: flex-end; }
</style>
