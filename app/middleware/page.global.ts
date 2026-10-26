import type { Page } from '#shared/types/kitloom'

/**
 * Reads the page of every address before anything is drawn, so the header and the footer
 * have the menus and widgets it came with on the server as on the client.
 *
 * Every navigation reads the site again. A page is the visitor's — their cart in the header,
 * their account, signed in or not — and changes with what they do, so a page kept from an
 * earlier visit would show a cart already ordered or a sign-in form to someone signed in.
 * (`useAsyncData` called outside a component keeps its first answer for good: a key that
 * succeeded once is never fetched again.) The one page not read twice is the first on the
 * client: the server drew it, and its state came along in the payload.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const nuxtApp = useNuxtApp()
  const page = useSharedPage()
  const drawnFor = useState<string | null>('kitloom:page-path', () => null)

  if (import.meta.client && nuxtApp.isHydrating && drawnFor.value === to.fullPath && page.value) {
    return
  }

  let answer: Page

  try {
    // On the server the visitor's cookies go along, so the page knows their cart and account.
    answer = await useRequestFetch()<Page>('/api/page', { query: { path: to.fullPath }, ignoreResponseError: true })
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'The site could not be read.', fatal: true })
  }

  if (!answer || typeof answer !== 'object' || !('kind' in answer)) {
    throw createError({ statusCode: 502, statusMessage: 'The site could not be read.', fatal: true })
  }

  page.value = answer
  drawnFor.value = to.fullPath

  // The cart a template read before is the last page's; this page's count is the site's now.
  // The cart and checkout templates put the full cart back from the page they came with.
  useState('kitloom:cart').value = null

  if (import.meta.server && answer.kind === 'not-found') {
    setResponseStatus(useRequestEvent()!, 404)
  }
})
