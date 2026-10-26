import type { CartResponse } from '#shared/types/kitloom'

/** New quantities by line key; zero removes the line. */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ quantities: Record<string, number> }>(event)

  return passThrough(event, await siteFetch<CartResponse>(event, '/wp-json/wc/store/v1/cart/update-items', {
    method: 'POST',
    body: { quantities: body?.quantities ?? {} },
  }))
})
