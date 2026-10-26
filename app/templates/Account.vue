<script setup lang="ts">
import type { AccountData, Page } from '#shared/types/kitloom'
import { shortcode } from '~/utils/templates'

/**
 * The customer's account, from the `[woocommerce_my_account]` part of the site's account page:
 * the sign-in and sign-up forms for a visitor; for a customer the dashboard, the orders, one
 * order, the addresses and the details — each view as the site drew it for them.
 */
const props = defineProps<{ page: Page }>()
const { toPath } = useLinks()
const route = useRoute()
const { busy, signIn, signOut, register, lostPassword, saveDetails, saveAddress } = useAccount()
const { cart } = useCart()
const { notify } = useNotice()
const reload = useReloadPage()

const data = computed<AccountData | null>(() => shortcode(props.page, 'woocommerce_my_account') as AccountData | null)
const urls = computed(() => data.value?.urls ?? {})
const view = computed(() => data.value?.view ?? 'login')
const name = computed(() => data.value?.customer?.name ?? '')

const accountPath = computed(() => toPath(urls.value.dashboard ?? urls.value.account ?? props.page.content?.link ?? '/my-account/'))

const failure = ref<string | null>(null)
const errors = ref<Record<string, string>>(
  Object.fromEntries(Object.entries(data.value?.errors ?? {}).map(([field, messages]) => [field, messages[0] ?? ''])),
)

// Sign in
const login = reactive({ email: '', password: '', remember: true })
const forgot = ref(false)

const doSignIn = async () => {
  const result = await signIn(login.email, login.password, login.remember)
  errors.value = result.errors
  failure.value = result.ok ? null : result.message ?? null
  if (!result.ok) return
  cart.value = null
  await reload()
  if (import.meta.client) window.scrollTo({ top: 0 })
  notify(`Welcome back${name.value ? ', ' + name.value : ''}.`)
}

const doForgot = async () => {
  const result = await lostPassword(login.email, accountPath.value)
  errors.value = result.errors
  failure.value = result.ok ? null : result.message ?? null
  if (result.ok) {
    forgot.value = false
    notify(result.message ?? 'If that address has an account, a link to choose a new password is on its way.')
  }
}

// Sign up
const signup = reactive({ name: '', email: '', password: '', password_confirmation: '' })

const doRegister = async () => {
  const result = await register({ ...signup })
  errors.value = result.errors
  failure.value = result.ok ? null : result.message ?? null
  if (!result.ok) return
  cart.value = null
  await reload()
  notify(result.message ?? 'Your account has been created.')
}

const doSignOut = async () => {
  const result = await signOut()
  if (!result.ok) return notify(result.message)
  cart.value = null
  await navigateTo('/')
  notify('You are signed out.')
}

// Addresses and details
const form = reactive<Record<string, string>>({ ...(data.value?.values ?? {}) })

const doSaveAddress = async () => {
  const result = await saveAddress({ ...form, type: data.value?.type ?? 'billing' })
  errors.value = result.errors
  failure.value = result.ok ? null : result.message ?? null
  if (!result.ok) return
  notify(result.message ?? 'Address changed successfully.')
  await navigateTo(toPath(urls.value.address ?? accountPath.value))
}

const details = reactive({
  first_name: data.value?.values?.first_name ?? '',
  last_name: data.value?.values?.last_name ?? '',
  display_name: data.value?.values?.display_name ?? '',
  email: data.value?.values?.email ?? '',
  password_current: '',
  password: '',
  password_confirmation: '',
})

const doSaveDetails = async () => {
  const result = await saveDetails({ ...details })
  errors.value = result.errors
  failure.value = result.ok ? null : result.message ?? null
  if (!result.ok) return
  details.password_current = details.password = details.password_confirmation = ''
  await reload()
  notify(result.message ?? 'Account details changed successfully.')
}

const navItems = computed(() => [
  { key: 'dashboard', label: 'Dashboard', to: urls.value.dashboard, active: view.value === 'dashboard' },
  { key: 'orders', label: 'Orders', to: urls.value.orders, active: ['orders', 'order'].includes(view.value) },
  { key: 'address', label: 'Addresses', to: urls.value.address, active: ['addresses', 'address'].includes(view.value) },
  { key: 'details', label: 'Account details', to: urls.value.details, active: view.value === 'details' },
].filter(item => item.to))

const addressCountries = computed(() => data.value?.countries ?? {})
const addressCountry = computed(() => form[`${data.value?.type ?? 'billing'}_country`] ?? '')
</script>

<template>
  <div class="container section">
    <Breadcrumbs :items="page.breadcrumbs" />

    <template v-if="!data">
      <h1>{{ page.content?.title ?? 'My account' }}</h1>
      <HtmlContent :html="page.content?.content" class="prose" />
    </template>

    <!-- A visitor: sign in, or sign up. -->
    <div v-else-if="view === 'login'" class="gate">
      <div class="gate-words">
        <p class="eyebrow">My account</p>
        <h1>Good to see you.</h1>
        <p class="lede">Sign in to follow your orders and keep your addresses for next time.</p>
      </div>

      <p v-if="failure" class="failure" role="alert">{{ failure }}</p>

      <div class="gate-forms">
        <form class="card form" novalidate @submit.prevent="forgot ? doForgot() : doSignIn()">
          <h2>{{ forgot ? 'Lost your password?' : 'Sign in' }}</h2>
          <label class="field" :class="{ invalid: errors.email || errors.login }">
            <span class="label">Email address</span>
            <input v-model="login.email" type="email" autocomplete="username" required>
            <small v-if="errors.email || errors.login" class="error">{{ errors.email || errors.login }}</small>
          </label>
          <label v-if="!forgot" class="field" :class="{ invalid: errors.password }">
            <span class="label">Password</span>
            <input v-model="login.password" type="password" autocomplete="current-password" required>
            <small v-if="errors.password" class="error">{{ errors.password }}</small>
          </label>
          <label v-if="!forgot" class="check">
            <input v-model="login.remember" type="checkbox">
            <span>Remember me</span>
          </label>
          <p v-else class="muted">We will send a link to choose a new one.</p>
          <div class="actions">
            <button type="submit" class="button" :disabled="busy">{{ forgot ? 'Send the link' : 'Sign in' }}</button>
            <button type="button" class="link" @click="forgot = !forgot; errors = {}; failure = null">
              {{ forgot ? '← Back to sign in' : 'Lost your password?' }}
            </button>
          </div>
        </form>

        <form v-if="urls.register" class="card form" novalidate @submit.prevent="doRegister">
          <h2>New here?</h2>
          <label class="field" :class="{ invalid: errors.name }">
            <span class="label">Your name</span>
            <input v-model="signup.name" type="text" autocomplete="name" required>
            <small v-if="errors.name" class="error">{{ errors.name }}</small>
          </label>
          <label class="field" :class="{ invalid: errors.email && !login.email }">
            <span class="label">Email address</span>
            <input v-model="signup.email" type="email" autocomplete="email" required>
          </label>
          <label class="field" :class="{ invalid: errors.password }">
            <span class="label">Password</span>
            <input v-model="signup.password" type="password" autocomplete="new-password" required>
            <small v-if="errors.password" class="error">{{ errors.password }}</small>
          </label>
          <label class="field">
            <span class="label">Repeat the password</span>
            <input v-model="signup.password_confirmation" type="password" autocomplete="new-password" required>
          </label>
          <div class="actions">
            <button type="submit" class="button ghost" :disabled="busy">Create an account</button>
          </div>
        </form>
      </div>
    </div>

    <!-- A customer. -->
    <div v-else class="account">
      <aside class="side">
        <p class="eyebrow">My account</p>
        <h1 class="who">{{ name }}</h1>
        <nav aria-label="Account">
          <NuxtLink v-for="item in navItems" :key="item.key" :to="toPath(item.to!)" class="nav-item" :class="{ active: item.active }">{{ item.label }}</NuxtLink>
          <button type="button" class="nav-item out" :disabled="busy" @click="doSignOut">Sign out</button>
        </nav>
      </aside>

      <section class="content">
        <p v-if="failure" class="failure" role="alert">{{ failure }}</p>

        <template v-if="view === 'dashboard'">
          <h2>Hello, {{ name }}.</h2>
          <p class="lede">From here you can see your recent orders, change your addresses and your details.</p>
          <template v-if="data.recent?.length">
            <h3>Recent orders</h3>
            <OrdersTable :orders="data.recent" />
          </template>
          <p v-else class="muted">No orders yet. <NuxtLink :to="toPath(urls.shop ?? '/shop/')">Have a look at the shop →</NuxtLink></p>
        </template>

        <template v-else-if="view === 'orders'">
          <h2>Orders</h2>
          <OrdersTable v-if="data.orders?.length" :orders="data.orders" />
          <p v-else class="muted">No orders yet. <NuxtLink :to="toPath(urls.shop ?? '/shop/')">Have a look at the shop →</NuxtLink></p>
          <nav v-if="data.pagination && data.pagination.pages > 1" class="pager">
            <NuxtLink v-if="data.pagination.previous" :to="toPath(data.pagination.previous)" class="button ghost small">← Newer</NuxtLink>
            <span v-else />
            <span class="muted">Page {{ data.pagination.page }} of {{ data.pagination.pages }}</span>
            <NuxtLink v-if="data.pagination.next" :to="toPath(data.pagination.next)" class="button ghost small">Older →</NuxtLink>
            <span v-else />
          </nav>
        </template>

        <template v-else-if="view === 'order' && data.order">
          <NuxtLink :to="toPath(urls.orders ?? accountPath)" class="back">← All orders</NuxtLink>
          <h2>Order #{{ data.order.number }}</h2>
          <OrderFacts :order="data.order" />
          <p v-if="data.order.urls.pay || data.order.urls.cancel" class="order-actions">
            <a v-if="data.order.urls.pay" :href="data.order.urls.pay" class="button">Pay for this order</a>
            <a v-if="data.order.urls.cancel" :href="data.order.urls.cancel" class="button ghost">Cancel</a>
          </p>
          <OrderDetails :order="data.order" />
        </template>

        <template v-else-if="view === 'addresses' && data.addresses">
          <h2>Addresses</h2>
          <p class="lede">The addresses used by default on the checkout page.</p>
          <div class="address-cards">
            <div v-for="(address, type) in data.addresses" :key="type" class="card address">
              <h3>{{ address.title }}</h3>
              <template v-if="address.lines.length"><p v-for="line in address.lines" :key="line">{{ line }}</p></template>
              <p v-else class="muted">You have not set up this type of address yet.</p>
              <NuxtLink :to="toPath(address.edit)" class="edit">{{ address.lines.length ? 'Edit' : 'Add' }} →</NuxtLink>
            </div>
          </div>
        </template>

        <form v-else-if="view === 'address' && data.fields" class="form" novalidate @submit.prevent="doSaveAddress">
          <NuxtLink :to="toPath(urls.address ?? accountPath)" class="back">← Addresses</NuxtLink>
          <h2>{{ data.title }}</h2>
          <div class="fields">
            <CheckoutField
              v-for="(field, fieldName) in data.fields"
              :key="fieldName"
              v-model="form[fieldName]"
              :name="fieldName"
              :field="field"
              :country="addressCountry"
              :countries="addressCountries"
              :states="data.states"
              :states-optional="data.statesOptional"
              :labels="data.addressLabels"
              :error="errors[fieldName]"
              @update:model-value="delete errors[fieldName]"
            />
          </div>
          <div class="actions">
            <button type="submit" class="button" :disabled="busy">Save address</button>
          </div>
        </form>

        <form v-else-if="view === 'details'" class="form" novalidate @submit.prevent="doSaveDetails">
          <h2>Account details</h2>
          <div class="fields">
            <label class="field" :class="{ invalid: errors.first_name }"><span class="label">First name</span><input v-model="details.first_name" type="text" autocomplete="given-name"><small v-if="errors.first_name" class="error">{{ errors.first_name }}</small></label>
            <label class="field" :class="{ invalid: errors.last_name }"><span class="label">Last name</span><input v-model="details.last_name" type="text" autocomplete="family-name"><small v-if="errors.last_name" class="error">{{ errors.last_name }}</small></label>
            <label class="field wide" :class="{ invalid: errors.display_name }"><span class="label">Display name</span><input v-model="details.display_name" type="text" autocomplete="nickname"><small class="muted">This is how your name appears in reviews.</small><small v-if="errors.display_name" class="error">{{ errors.display_name }}</small></label>
            <label class="field wide" :class="{ invalid: errors.email }"><span class="label">Email address</span><input v-model="details.email" type="email" autocomplete="email"><small v-if="errors.email" class="error">{{ errors.email }}</small></label>
          </div>
          <h3>Change the password</h3>
          <div class="fields">
            <label class="field wide" :class="{ invalid: errors.password_current }"><span class="label">Current password <small>(leave blank to keep it)</small></span><input v-model="details.password_current" type="password" autocomplete="current-password"><small v-if="errors.password_current" class="error">{{ errors.password_current }}</small></label>
            <label class="field" :class="{ invalid: errors.password }"><span class="label">New password</span><input v-model="details.password" type="password" autocomplete="new-password"><small v-if="errors.password" class="error">{{ errors.password }}</small></label>
            <label class="field"><span class="label">Repeat the new password</span><input v-model="details.password_confirmation" type="password" autocomplete="new-password"></label>
          </div>
          <div class="actions">
            <button type="submit" class="button" :disabled="busy">Save changes</button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.gate-words { max-width: 640px; margin-bottom: 2rem; }
.gate-forms { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 1.5rem; max-width: 900px; }
.form.card { padding: 1.75rem; }
.form h2 { font-size: 1.5rem; margin-bottom: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 1rem; }
.field.wide { grid-column: 1 / -1; }
.label { font-size: 0.9rem; color: var(--ink-soft); font-weight: 600; }
.label small { color: var(--muted); font-weight: 400; }
.field input { font: inherit; color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 10px; padding: 0.65rem 0.8rem; }
.field input:focus { outline: 2px solid var(--pumpkin); outline-offset: 1px; border-color: transparent; }
.invalid input { border-color: var(--wine); }
.error { color: var(--wine); font-size: 0.85rem; }
.check { display: flex; gap: 0.6rem; align-items: center; margin-bottom: 1rem; }
.check input { width: 18px; height: 18px; accent-color: var(--rust); }
.actions { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; margin-top: 0.5rem; }
.link { background: none; border: 0; color: var(--rust); cursor: pointer; font: inherit; padding: 0; text-decoration: underline; text-underline-offset: 3px; }
.failure { background: rgba(123, 34, 50, 0.1); color: var(--wine); padding: 0.8rem 1rem; border-radius: 10px; border: 1px solid rgba(123, 34, 50, 0.3); max-width: 900px; }
.muted { color: var(--muted); }
.button:disabled { opacity: 0.6; cursor: wait; }

.account { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 3rem; align-items: start; }
.side { position: sticky; top: 90px; }
.who { font-size: 1.6rem; margin-bottom: 1.25rem; }
.side nav { display: flex; flex-direction: column; gap: 0.25rem; }
.nav-item { display: block; padding: 0.6rem 0.9rem; border-radius: 10px; color: var(--ink); text-decoration: none; font-weight: 600; background: none; border: 0; text-align: left; font: inherit; cursor: pointer; }
.nav-item:hover { background: var(--bg-deep); color: var(--rust); }
.nav-item.active { background: rgba(221, 122, 44, 0.14); color: var(--rust); }
.nav-item.out { color: var(--muted); margin-top: 0.75rem; }
.content h2 { font-size: 1.75rem; }
.content h3 { margin-top: 1.5rem; }
.fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; max-width: 760px; }
.fields .field { margin-bottom: 0; }
.back { display: inline-block; margin-bottom: 0.75rem; text-decoration: none; }
.pager { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; }
.order-actions { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
.address-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 1.5rem; }
.address { padding: 1.5rem; }
.address h3 { margin: 0 0 0.75rem; font-size: 1.15rem; }
.address p { margin: 0; }
.edit { display: inline-block; margin-top: 0.75rem; font-weight: 600; text-decoration: none; }
@media (max-width: 860px) { .account { grid-template-columns: minmax(0, 1fr); } .side { position: static; } .side nav { flex-direction: row; flex-wrap: wrap; } .nav-item.out { margin-top: 0; } }
@media (max-width: 560px) { .fields { grid-template-columns: 1fr; } }
</style>
