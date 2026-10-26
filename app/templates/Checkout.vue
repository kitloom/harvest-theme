<script setup lang="ts">
import type { CheckoutData, Page } from '#shared/types/kitloom'
import { shortcode } from '~/utils/templates'

/**
 * The checkout, drawn by the theme from the form the shop configured (its fields, countries,
 * states, gateways) and placed through the site's Store API. One page, two views: the form,
 * and the order received.
 */
const props = defineProps<{ page: Page }>()
const { toPath, isInternal } = useLinks()
const { cart, busy, setCustomer, chooseShipping, placeOrder } = useCart()

const data = computed<CheckoutData | null>(() => shortcode(props.page, 'woocommerce_checkout') as CheckoutData | null)
const shopPath = computed(() => toPath(props.page.store?.shop ?? data.value?.urls?.shop ?? '/shop/'))
const cartPath = computed(() => toPath(props.page.cart?.url ?? '/cart/'))

if (data.value?.cart) cart.value = data.value.cart
if (data.value?.view === 'received') cart.value = null

// The form, started from what the shop remembers (the country it sells from, a returning customer's details).
const fields = computed(() => data.value?.fields ?? {})
const shippingFields = computed(() => data.value?.shippingFields ?? {})
const old = data.value?.old ?? {}

const form = reactive<Record<string, string>>({
  ...Object.fromEntries(Object.keys(fields.value).map(name => [name, old[name] ?? ''])),
  ...Object.fromEntries(Object.keys(shippingFields.value).map(name => [name, old[name] ?? ''])),
  ship_to_different_address: old.ship_to_different_address ? '1' : '',
  shipping_method: cart.value?.shippingRates.find(rate => rate.chosen)?.id ?? '',
  payment_method: old.payment_method ?? data.value?.gateways?.[0]?.id ?? '',
  order_comments: old.order_comments ?? '',
  terms: '',
  createaccount: '',
  account_password: '',
})

const errors = ref<Record<string, string>>(
  Object.fromEntries(Object.entries(data.value?.errors ?? {}).map(([name, messages]) => [name, messages[0] ?? ''])),
)
const failure = ref<string | null>(data.value?.message ?? null)

const shipsElsewhere = computed(() => !!data.value?.shipToDifferentAddress && form.ship_to_different_address === '1')

const addressOf = (prefix: string) => ({
  country: form[`${prefix}_country`] ?? '',
  state: form[`${prefix}_state`] ?? '',
  postcode: form[`${prefix}_postcode`] ?? '',
  city: form[`${prefix}_city`] ?? '',
})

// A changed address re-prices the cart: the shop answers with the rates of that address.
let timer: ReturnType<typeof setTimeout> | undefined
watch(
  () => [addressOf('billing'), shipsElsewhere.value ? addressOf('shipping') : null],
  ([billing, shipping]) => {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      const message = await setCustomer(billing!, shipping ?? undefined)
      failure.value = message
      const rates = cart.value?.shippingRates ?? []
      if (!rates.some(rate => rate.id === form.shipping_method)) {
        form.shipping_method = rates.find(rate => rate.chosen)?.id ?? rates[0]?.id ?? ''
      }
    }, 500)
  },
  { deep: true },
)

const pickRate = async (id: string) => {
  form.shipping_method = id
  await chooseShipping(id)
}

const gateways = computed(() => data.value?.gateways ?? [])
const needsPayment = computed(() => gateways.value.length > 0)

const submit = async () => {
  failure.value = null
  const result = await placeOrder({ ...form })

  if (result.placed) {
    const next = result.placed.redirect
    // "Order received" is a page of the site: the theme draws it. A gateway's page is the gateway's.
    if (isInternal(next)) return navigateTo(toPath(next))
    if (import.meta.client) window.location.assign(next)
    return
  }

  errors.value = result.errors ?? {}
  failure.value = result.message ?? null
  if (import.meta.client) document.querySelector('.invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
  <div class="container section">
    <Breadcrumbs :items="page.breadcrumbs" />

    <template v-if="!data">
      <h1>Checkout</h1>
      <p class="lede">The checkout is not available right now.</p>
    </template>

    <OrderReceived
      v-else-if="data.view === 'received' && data.order"
      :order="data.order"
      :payment-instructions="data.paymentInstructions"
      :bank-details="data.bankDetails"
      :shop-path="shopPath"
    />

    <template v-else-if="data.view !== 'form'">
      <h1>Checkout</h1>
      <p class="lede">{{ data.message ?? 'This step is taken on the site.' }}</p>
      <a :href="page.url" class="button">Continue on {{ page.site?.name }} →</a>
    </template>

    <template v-else-if="!cart || cart.isEmpty">
      <p class="eyebrow">Checkout</p>
      <h1>Nothing to check out yet.</h1>
      <NuxtLink :to="shopPath" class="button">Back to the shop</NuxtLink>
    </template>

    <form v-else class="checkout" novalidate @submit.prevent="submit">
      <div class="details">
        <p class="eyebrow">Checkout</p>
        <h1>Where should it go?</h1>

        <p v-if="failure" class="failure" role="alert">{{ failure }}</p>

        <section class="block">
          <h2>Billing details</h2>
          <div class="fields">
            <CheckoutField
              v-for="(field, name) in fields"
              :key="name"
              v-model="form[name]"
              :name="name"
              :field="field"
              :country="form.billing_country ?? ''"
              :countries="data.countries"
              :states="data.states"
              :states-optional="data.statesOptional"
              :labels="data.addressLabels"
              :error="errors[name]"
              @update:model-value="delete errors[name]"
            />
          </div>
        </section>

        <section v-if="data.shipToDifferentAddress" class="block">
          <label class="check">
            <input v-model="form.ship_to_different_address" type="checkbox" true-value="1" false-value="">
            <span>Ship to a different address</span>
          </label>
          <div v-if="shipsElsewhere" class="fields">
            <CheckoutField
              v-for="(field, name) in shippingFields"
              :key="name"
              v-model="form[name]"
              :name="name"
              :field="field"
              :country="form.shipping_country ?? ''"
              :countries="data.shippingCountries"
              :states="data.states"
              :states-optional="data.statesOptional"
              :labels="data.addressLabels"
              :error="errors[name]"
              @update:model-value="delete errors[name]"
            />
          </div>
        </section>

        <section v-if="data.account" class="block">
          <label v-if="!data.account.required" class="check">
            <input v-model="form.createaccount" type="checkbox" true-value="1" false-value="">
            <span>Create an account for next time</span>
          </label>
          <label v-if="data.account.password && (data.account.required || form.createaccount === '1')" class="field-password">
            <span class="label">Account password</span>
            <input v-model="form.account_password" type="password" autocomplete="new-password">
            <small v-if="errors.account_password" class="error">{{ errors.account_password }}</small>
          </label>
        </section>

        <section class="block">
          <label class="notes">
            <span class="label">Order notes <small>(optional)</small></span>
            <textarea v-model="form.order_comments" rows="3" placeholder="Notes about your order, e.g. special notes for delivery."></textarea>
          </label>
        </section>
      </div>

      <aside class="order card">
        <h2>Your order</h2>
        <ul class="lines">
          <li v-for="line in cart.lines" :key="line.key">
            <span>{{ line.product.title }} <small>× {{ line.quantity }}</small></span>
            <strong>{{ line.totalFormatted }}</strong>
          </li>
        </ul>

        <div v-if="cart.needsShipping" class="choice" :class="{ invalid: errors.shipping_method }">
          <h3>Delivery</h3>
          <label v-for="rate in cart.shippingRates" :key="rate.id" class="radio">
            <input type="radio" name="shipping_method" :value="rate.id" :checked="form.shipping_method === rate.id" @change="pickRate(rate.id)">
            <span>{{ rate.label }}</span>
            <strong>{{ rate.costFormatted }}</strong>
          </label>
          <p v-if="!cart.shippingRates.length" class="muted">No delivery option for this address yet.</p>
          <small v-if="errors.shipping_method" class="error">{{ errors.shipping_method }}</small>
        </div>

        <dl class="totals">
          <dt>Subtotal</dt><dd>{{ cart.subtotalFormatted }}</dd>
          <template v-if="cart.needsShipping"><dt>Delivery</dt><dd>{{ cart.shippingTotalFormatted }}</dd></template>
          <dt class="grand">Total</dt><dd class="grand">{{ cart.totalFormatted }}</dd>
        </dl>

        <div v-if="needsPayment" class="choice" :class="{ invalid: errors.payment_method }">
          <h3>Payment</h3>
          <label v-for="gateway in gateways" :key="gateway.id" class="radio stacked">
            <span class="radio-row">
              <input v-model="form.payment_method" type="radio" name="payment_method" :value="gateway.id">
              <span>{{ gateway.title }}</span>
            </span>
            <small v-if="form.payment_method === gateway.id && gateway.description" class="muted">{{ gateway.description }}</small>
          </label>
          <small v-if="errors.payment_method" class="error">{{ errors.payment_method }}</small>
        </div>

        <label v-if="data.terms" class="check terms" :class="{ invalid: errors.terms }">
          <input v-model="form.terms" type="checkbox" true-value="1" false-value="">
          <span>I have read and agree to the <a :href="data.terms.url" target="_blank" rel="noopener">{{ data.terms.title }}</a></span>
          <small v-if="errors.terms" class="error">{{ errors.terms }}</small>
        </label>

        <button type="submit" class="button wide" :disabled="busy">{{ busy ? 'Placing…' : `Place order · ${cart.totalFormatted}` }}</button>
        <NuxtLink :to="cartPath" class="back">← Back to the cart</NuxtLink>
      </aside>
    </form>
  </div>
</template>

<style scoped>
.checkout { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 2.5rem; align-items: start; }
.block { margin-top: 2rem; }
.block h2 { font-size: 1.35rem; margin-bottom: 1rem; }
.fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.check { display: flex; gap: 0.6rem; align-items: center; font-weight: 600; margin-bottom: 1rem; flex-wrap: wrap; }
.check input { width: 18px; height: 18px; accent-color: var(--rust); }
.label { font-size: 0.9rem; color: var(--ink-soft); font-weight: 600; display: block; margin-bottom: 0.3rem; }
.label small { color: var(--muted); font-weight: 400; }
.notes textarea, .field-password input { width: 100%; font: inherit; color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 10px; padding: 0.65rem 0.8rem; }
.failure { background: rgba(123, 34, 50, 0.1); color: var(--wine); padding: 0.8rem 1rem; border-radius: 10px; border: 1px solid rgba(123, 34, 50, 0.3); }
.error { color: var(--wine); font-size: 0.85rem; display: block; }
.order { padding: 1.5rem; position: sticky; top: 90px; }
.order h2 { font-size: 1.35rem; }
.order h3 { font-size: 1rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--pumpkin); font-family: var(--font-body); margin: 0 0 0.5rem; }
.lines { list-style: none; margin: 0 0 1.25rem; padding: 0; }
.lines li { display: flex; justify-content: space-between; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px solid var(--line); }
.lines small { color: var(--muted); }
.choice { margin: 1.25rem 0; padding: 1rem; border: 1px solid var(--line); border-radius: 12px; background: var(--bg); }
.choice.invalid { border-color: var(--wine); }
.radio { display: flex; align-items: center; gap: 0.6rem; padding: 0.35rem 0; cursor: pointer; }
.radio strong { margin-left: auto; color: var(--rust); }
.radio input { accent-color: var(--rust); width: 18px; height: 18px; }
.radio.stacked { flex-direction: column; align-items: stretch; gap: 0.2rem; }
.radio-row { display: flex; align-items: center; gap: 0.6rem; font-weight: 600; }
.muted { color: var(--muted); margin: 0; }
.totals { display: grid; grid-template-columns: 1fr auto; gap: 0.4rem 1rem; margin: 1rem 0; }
.totals dt { color: var(--ink-soft); }
.totals dd { margin: 0; text-align: right; font-weight: 600; }
.grand { font-size: 1.25rem; color: var(--ink); border-top: 1px solid var(--line); padding-top: 0.6rem; }
dd.grand { color: var(--rust); font-family: var(--font-display); }
.terms { font-weight: 400; }
.wide { width: 100%; justify-content: center; margin-top: 0.5rem; }
.button:disabled { opacity: 0.6; cursor: wait; }
.back { display: inline-block; margin-top: 1rem; text-decoration: none; }
@media (max-width: 900px) { .checkout { grid-template-columns: minmax(0, 1fr); } .order { position: static; } }
@media (max-width: 560px) { .fields { grid-template-columns: 1fr; } }
</style>
