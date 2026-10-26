<script setup lang="ts">
import type { ProductDetail } from '#shared/types/kitloom'

/**
 * "Add a review" under a product, as the shop would draw it: the stars and the words, name and
 * email for a guest when the shop asks for them, its spam protection. The shop decides whether
 * this visitor may review (a verified owner only, an account needed) and says why if not.
 */
const props = defineProps<{ product: ProductDetail }>()
const emit = defineEmits<{ posted: [status: 'approved' | 'hold', message: string, values: { rating: number; review: string; author: string }] }>()

const page = useSharedPage()
const { toPath } = useLinks()
const request = useRequestFetch()

const form = computed(() => props.product.reviewForm!)
const signedIn = computed(() => page.value?.store?.signedIn ?? false)
const accountPath = computed(() => toPath(page.value?.store?.account ?? '/my-account/'))
const asksNameEmail = computed(() => !signedIn.value && form.value.requireNameEmail)

const values = reactive({ rating: 0, hover: 0, review: '', author: '', email: '' })
const { token, fields: protection, ready } = useProtection(() => form.value.protection)
const turnstile = ref<{ reset: () => void } | null>(null)

const busy = ref(false)
const errors = ref<Record<string, string>>({})
const failure = ref<string | null>(null)

const submit = async () => {
  busy.value = true
  errors.value = {}
  failure.value = null
  try {
    const answer = await request<{ message: string; review: { status: 'approved' | 'hold' } }>('/api/reviews', {
      method: 'POST',
      body: {
        product: props.product.id,
        rating: values.rating,
        review: values.review,
        ...(asksNameEmail.value ? { author: values.author, email: values.email } : {}),
        ...protection(),
      },
    })
    emit('posted', answer.review.status, answer.message, { rating: values.rating, review: values.review, author: values.author })
    values.rating = 0
    values.review = ''
  } catch (error) {
    const data = (error as { data?: { message?: string; data?: { params?: Record<string, string> } } }).data
    errors.value = data?.data?.params ?? {}
    failure.value = Object.keys(errors.value).length ? null : data?.message ?? 'The review could not be sent.'
  } finally {
    busy.value = false
    turnstile.value?.reset()
  }
}
</script>

<template>
  <div class="review-form card">
    <h3>Add a review</h3>

    <p v-if="form.mustLogIn && !signedIn" class="muted">
      Please <NuxtLink :to="accountPath">sign in</NuxtLink> to leave a review.
    </p>

    <form v-else novalidate @submit.prevent="submit">
      <p v-if="form.verifiedOnly" class="muted">Only customers who bought this product may leave a review.</p>
      <p v-if="failure" class="failure" role="alert">{{ failure }}</p>

      <fieldset class="stars" :class="{ invalid: errors.rating }" @mouseleave="values.hover = 0">
        <legend class="label">Your rating<sup>*</sup></legend>
        <label v-for="n in 5" :key="n" :class="{ on: n <= (values.hover || values.rating) }" @mouseenter="values.hover = n">
          <input v-model="values.rating" type="radio" name="rating" :value="n" class="visually-hidden">
          <span aria-hidden="true">★</span>
          <span class="visually-hidden">{{ n }} of 5</span>
        </label>
        <small v-if="errors.rating" class="error">{{ errors.rating }}</small>
      </fieldset>

      <label class="field" :class="{ invalid: errors.review }">
        <span class="label">Your review<sup>*</sup></span>
        <textarea v-model="values.review" rows="4" required />
        <small v-if="errors.review" class="error">{{ errors.review }}</small>
      </label>

      <div v-if="asksNameEmail" class="fields">
        <label class="field" :class="{ invalid: errors.author }">
          <span class="label">Name<sup>*</sup></span>
          <input v-model="values.author" type="text" autocomplete="name">
          <small v-if="errors.author" class="error">{{ errors.author }}</small>
        </label>
        <label class="field" :class="{ invalid: errors.email }">
          <span class="label">Email<sup>*</sup></span>
          <input v-model="values.email" type="email" autocomplete="email">
          <small v-if="errors.email" class="error">{{ errors.email }}</small>
        </label>
      </div>

      <TurnstileWidget v-if="form.protection.turnstile" ref="turnstile" v-model="token" :site-key="form.protection.turnstile.siteKey" />

      <button type="submit" class="button" :disabled="busy || !ready || !values.rating || !values.review.trim()">{{ busy ? 'Sending…' : 'Submit review' }}</button>
    </form>
  </div>
</template>

<style scoped>
.review-form { padding: 1.5rem; }
.review-form h3 { font-size: 1.2rem; }
.stars { border: 0; padding: 0; margin: 0 0 1rem; display: flex; align-items: center; gap: 0.15rem; flex-wrap: wrap; }
.stars legend { margin-bottom: 0.3rem; width: 100%; }
.stars label { position: relative; cursor: pointer; font-size: 1.8rem; line-height: 1; color: var(--line); transition: color 0.1s ease; }
.stars label.on { color: var(--mustard); }
.stars label:focus-within { outline: 2px solid var(--pumpkin); border-radius: 4px; }
.fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 1rem; }
.label { font-size: 0.9rem; color: var(--ink-soft); font-weight: 600; }
sup { color: var(--rust); margin-left: 2px; }
input, textarea { font: inherit; color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 10px; padding: 0.65rem 0.8rem; width: 100%; }
input:focus, textarea:focus { outline: 2px solid var(--pumpkin); outline-offset: 1px; border-color: transparent; }
.invalid input, .invalid textarea { border-color: var(--wine); }
.error { color: var(--wine); font-size: 0.85rem; width: 100%; }
.muted { color: var(--muted); }
.failure { background: rgba(123, 34, 50, 0.1); color: var(--wine); padding: 0.7rem 1rem; border-radius: 10px; }
.button:disabled { opacity: 0.55; cursor: not-allowed; }
@media (max-width: 560px) { .fields { grid-template-columns: 1fr; } }
</style>
