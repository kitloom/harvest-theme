import type { Page } from '#shared/types/kitloom'

/**
 * Reads one page of the kitloom site as JSON and hands it to the theme.
 *
 * The site answers every address it serves — a post, an archive, the shop, a product, a search —
 * with the same parts it gives its own templates when asked with `Accept: application/json`.
 * Going through the server keeps the browser on one origin and hides the site behind the theme;
 * the visitor's session on the site (their cart) travels with the request.
 */
export default defineEventHandler(async (event) => {
  const path = String(getQuery(event).path ?? '/')

  if (!path.startsWith('/') || path.startsWith('//')) {
    throw createError({ statusCode: 400, statusMessage: 'A path of the site is expected.' })
  }

  const response = await siteFetch<Page>(event, path)
  const page = response._data

  if (!page || typeof page !== 'object') {
    throw createError({ statusCode: 502, statusMessage: 'The site did not answer with a page.' })
  }

  // A 404 of the site is a 404 of the theme too.
  setResponseStatus(event, response.status)

  return page
})
