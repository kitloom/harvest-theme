import type { Page } from '#shared/types/kitloom'

/**
 * Reads the page of every address before anything is drawn, so the header and the footer
 * have the menus and widgets it came with on the server as on the client.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // On the server the visitor's cookies go along, so the page knows their cart.
  const request = useRequestFetch()

  const { data, error } = await useAsyncData<Page>(
    `page:${to.fullPath}`,
    // A 404 is a page too: the site's not-found template, drawn with the site's status.
    () => request<Page>('/api/page', { query: { path: to.fullPath }, ignoreResponseError: true }),
  )

  if (error.value || !data.value) {
    throw createError({ statusCode: 502, statusMessage: 'The site could not be read.', fatal: true })
  }

  useSharedPage().value = data.value

  if (import.meta.server && data.value.kind === 'not-found') {
    setResponseStatus(useRequestEvent()!, 404)
  }
})
