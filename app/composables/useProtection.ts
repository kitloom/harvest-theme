/**
 * The spam protection a site's form came with (kitloom/forms' honeypot and Turnstile, through
 * the site's FormProtection): the hidden fields to send along, and the Turnstile token once the
 * widget gave one. Without a protection module the page sends none and nothing is asked.
 */
import type { Protection } from '#shared/types/kitloom'

export function useProtection(protection: () => Protection | null | undefined) {
  const token = ref('')

  const fields = () => {
    const given = protection() ?? {}
    return {
      ...(given.honeypot ? { [given.honeypot.nameFieldName]: '', [given.honeypot.validFromFieldName]: given.honeypot.encryptedValidFrom } : {}),
      ...(given.turnstile ? { 'cf-turnstile-response': token.value } : {}),
    }
  }

  // A Turnstile token is good for one submission.
  const ready = computed(() => !protection()?.turnstile || token.value !== '')

  return { token, fields, ready }
}
