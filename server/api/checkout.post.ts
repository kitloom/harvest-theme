/**
 * "Place order": the checkout form goes to the site as it is — the site validates it against
 * its own fields and rules and answers 201 with the order and where to go next, or 400 with a
 * message per field (`data.params`). Both reach the form unchanged.
 */
export default defineEventHandler(async (event) => {
  const form = await readBody<Record<string, unknown>>(event)

  const allowed = Object.fromEntries(
    Object.entries(form ?? {}).filter(([key, value]) => /^[a-z_0-9]+$/.test(key) && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')),
  )

  return passThrough(event, await siteFetch<unknown>(event, '/wp-json/wc/store/v1/checkout', {
    method: 'POST',
    body: allowed,
  }))
})
