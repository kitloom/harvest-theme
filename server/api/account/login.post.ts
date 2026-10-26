/** The site's `/login` as the visitor: its answer and status come back as they are. */
export default defineEventHandler(async (event) => {
  const form = await readBody<Record<string, unknown>>(event)

  const allowed = Object.fromEntries(
    Object.entries(form ?? {}).filter(([key, value]) => /^[a-z_0-9]+$/.test(key) && ['string', 'number', 'boolean'].includes(typeof value)),
  )

  return passThrough(event, await siteFetch<unknown>(event, '/login', { method: 'POST', body: allowed }))
})
