import type { Page } from '#shared/types/kitloom'

/** The page at the current address, read by the `page` middleware and shared with the layout. */
export function useSharedPage() {
  return useState<Page | null>('kitloom:page', () => null)
}

export function usePage(): { page: Ref<Page> } {
  const page = useSharedPage()

  if (!page.value) {
    throw createError({ statusCode: 502, statusMessage: 'The site could not be read.', fatal: true })
  }

  return { page: page as Ref<Page> }
}

/**
 * Reads the current address again — after a sign-in, a sign-out or a saved form the same page
 * is another page — and hands the layout and the template the new one.
 */
export function useReloadPage() {
  const route = useRoute()
  const request = useRequestFetch()
  const shared = useSharedPage()

  return async () => {
    shared.value = await request<Page>('/api/page', { query: { path: route.fullPath }, ignoreResponseError: true })
  }
}
