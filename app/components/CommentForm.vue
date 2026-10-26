<script setup lang="ts">
import type { Comment, CommentFormData } from '#shared/types/kitloom'

/**
 * "Leave a reply", as the site would draw it for this visitor: name and email for a guest when
 * the site asks for them, the line "Logged in as …" for a customer, the cookies consent, and the
 * spam protection the page came with. The site decides the rest and answers with the comment.
 */
const props = defineProps<{ form: CommentFormData; parent?: Comment | null }>()
const emit = defineEmits<{ posted: [comment: Comment, message: string | null]; cancel: [] }>()

const { toPath } = useLinks()
const page = useSharedPage()
const { signOut } = useAccount()
const reload = useReloadPage()
const { notify } = useNotice()
const request = useRequestFetch()

const values = reactive({
  author_name: props.form.author.name,
  author_email: props.form.author.email,
  author_url: props.form.author.url,
  content: '',
  consent: !!props.form.author.email,
})

const { token, fields: protection, ready } = useProtection(() => props.form.protection)
const turnstile = ref<{ reset: () => void } | null>(null)

const busy = ref(false)
const errors = ref<Record<string, string>>({})
const failure = ref<string | null>(null)

const accountPath = computed(() => toPath(page.value?.store?.account ?? '/my-account/'))
const asGuest = computed(() => !props.form.loggedInAs)

const submit = async () => {
  busy.value = true
  errors.value = {}
  failure.value = null
  try {
    const answer = await request<{ message: string | null; status: string; comment: Comment }>('/api/comments', {
      method: 'POST',
      body: {
        post: props.form.postId,
        parent: props.parent?.id ?? 0,
        content: values.content,
        ...(asGuest.value ? { author_name: values.author_name, author_email: values.author_email, author_url: values.author_url } : {}),
        ...(asGuest.value && props.form.cookiesOptIn && values.consent ? { 'wp-comment-cookies-consent': 'yes' } : {}),
        ...protection(),
      },
    })
    values.content = ''
    emit('posted', { ...answer.comment, children: answer.comment.children ?? [] }, answer.message)
  } catch (error) {
    const data = (error as { data?: { message?: string; data?: { params?: Record<string, string> } } }).data
    errors.value = data?.data?.params ?? {}
    failure.value = Object.keys(errors.value).length ? null : data?.message ?? 'The comment could not be sent.'
  } finally {
    busy.value = false
    turnstile.value?.reset()
  }
}

const doSignOut = async () => {
  await signOut()
  await reload()
  notify('You are signed out.')
}
</script>

<template>
  <div class="comment-form card" :class="{ reply: parent }">
    <h3>{{ parent ? `Reply to ${parent.author.name}` : 'Leave a comment' }}</h3>

    <p v-if="form.mustLogIn" class="muted">
      You must be <NuxtLink :to="accountPath">signed in</NuxtLink> to post a comment.
    </p>

    <form v-else novalidate @submit.prevent="submit">
      <p v-if="form.loggedInAs" class="muted">
        Signed in as <NuxtLink :to="accountPath">{{ form.loggedInAs.name }}</NuxtLink>.
        <button type="button" class="link" @click="doSignOut">Sign out?</button>
      </p>
      <p v-else-if="form.requireNameEmail" class="muted">Your email address will not be published. Name and email are required.</p>

      <p v-if="failure" class="failure" role="alert">{{ failure }}</p>

      <label class="field wide" :class="{ invalid: errors.content }">
        <span class="label">Comment</span>
        <textarea v-model="values.content" rows="5" :maxlength="form.maxLengths?.content" required />
        <small v-if="errors.content" class="error">{{ errors.content }}</small>
      </label>

      <div v-if="asGuest" class="fields">
        <label class="field" :class="{ invalid: errors.author_name }">
          <span class="label">Name<sup v-if="form.requireNameEmail">*</sup></span>
          <input v-model="values.author_name" type="text" autocomplete="name" :maxlength="form.maxLengths?.author_name">
          <small v-if="errors.author_name" class="error">{{ errors.author_name }}</small>
        </label>
        <label class="field" :class="{ invalid: errors.author_email }">
          <span class="label">Email<sup v-if="form.requireNameEmail">*</sup></span>
          <input v-model="values.author_email" type="email" autocomplete="email" :maxlength="form.maxLengths?.author_email">
          <small v-if="errors.author_email" class="error">{{ errors.author_email }}</small>
        </label>
        <label class="field wide" :class="{ invalid: errors.author_url }">
          <span class="label">Website</span>
          <input v-model="values.author_url" type="url" autocomplete="url" :maxlength="form.maxLengths?.author_url">
          <small v-if="errors.author_url" class="error">{{ errors.author_url }}</small>
        </label>
        <label v-if="form.cookiesOptIn" class="check wide">
          <input v-model="values.consent" type="checkbox">
          <span>Save my name, email and website for the next time I comment.</span>
        </label>
      </div>

      <TurnstileWidget v-if="form.protection.turnstile" ref="turnstile" v-model="token" :site-key="form.protection.turnstile.siteKey" />

      <div class="actions">
        <button type="submit" class="button" :disabled="busy || !ready || !values.content.trim()">{{ busy ? 'Sending…' : 'Post comment' }}</button>
        <button v-if="parent" type="button" class="link" @click="emit('cancel')">Cancel reply</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.comment-form { padding: 1.5rem; margin-top: 1.5rem; }
.comment-form.reply { margin-top: 1rem; box-shadow: none; }
.comment-form h3 { font-size: 1.2rem; }
.fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 1rem; }
.fields .field { margin-bottom: 0; }
.wide { grid-column: 1 / -1; }
.label { font-size: 0.9rem; color: var(--ink-soft); font-weight: 600; }
sup { color: var(--rust); margin-left: 2px; }
input, textarea { font: inherit; color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 10px; padding: 0.65rem 0.8rem; width: 100%; }
input:focus, textarea:focus { outline: 2px solid var(--pumpkin); outline-offset: 1px; border-color: transparent; }
.invalid input, .invalid textarea { border-color: var(--wine); }
.error { color: var(--wine); font-size: 0.85rem; }
.check { display: flex; gap: 0.6rem; align-items: center; color: var(--ink-soft); }
.check input { width: 18px; height: 18px; accent-color: var(--rust); }
.muted { color: var(--muted); }
.failure { background: rgba(123, 34, 50, 0.1); color: var(--wine); padding: 0.7rem 1rem; border-radius: 10px; }
.actions { display: flex; gap: 1rem; align-items: center; margin-top: 0.5rem; }
.link { background: none; border: 0; color: var(--rust); cursor: pointer; font: inherit; padding: 0; text-decoration: underline; text-underline-offset: 3px; }
.button:disabled { opacity: 0.55; cursor: not-allowed; }
@media (max-width: 560px) { .fields { grid-template-columns: 1fr; } }
</style>
