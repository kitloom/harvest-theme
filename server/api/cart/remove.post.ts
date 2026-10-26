import type { CartResponse } from '#shared/types/kitloom'

/** Takes a line out of the cart by its key. */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ key: string }>(event)
  const key = String(body?.key ?? '')

  if (!/^[\w-]+$/.test(key)) {
    throw createError({ statusCode: 400, statusMessage: 'A line key is expected.' })
  }

  return passThrough(event, await siteFetch<CartResponse>(event, `/wp-json/wc/store/v1/cart/remove-item/${key}`, {
    method: 'POST',
  }))
})
