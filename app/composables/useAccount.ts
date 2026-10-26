/**
 * The visitor's account on the site: signing in and out, signing up, their details and
 * addresses — the site's own forms, posted through the theme's server with the visitor's session.
 */
export function useAccount() {
  const request = useRequestFetch()
  const page = useSharedPage()
  const busy = useState<boolean>('kitloom:account-busy', () => false)

  const signedIn = computed(() => page.value?.store?.signedIn ?? false)

  type Outcome = { ok: boolean; message?: string; errors: Record<string, string>; redirect?: string }

  /** Posts one of the site's forms; a refusal comes back as a message per field. */
  const post = async (path: string, body: Record<string, unknown>): Promise<Outcome> => {
    busy.value = true
    try {
      const answer = await request<{ message?: string; redirect?: string }>(path, { method: 'POST', body })
      return { ok: true, message: answer?.message, redirect: answer?.redirect, errors: {} }
    } catch (error) {
      const data = (error as { data?: { message?: string; errors?: Record<string, string[]>; data?: { params?: Record<string, string> } } }).data
      const errors: Record<string, string> = { ...(data?.data?.params ?? {}) }
      for (const [field, messages] of Object.entries(data?.errors ?? {})) errors[field] = messages[0] ?? ''
      return { ok: false, message: data?.message ?? 'Something went wrong.', errors }
    } finally {
      busy.value = false
    }
  }

  return {
    busy,
    signedIn,
    signIn: (email: string, password: string, remember: boolean) => post('/api/account/login', { email, password, remember }),
    signOut: () => post('/api/account/logout', {}),
    register: (form: Record<string, string>) => post('/api/account/register', form),
    lostPassword: (email: string, pagePath: string) => post('/api/account/lost-password', { email, page: pagePath }),
    saveDetails: (form: Record<string, string>) => post('/api/account/details', form),
    saveAddress: (form: Record<string, string>) => post('/api/account/address', form),
  }
}
