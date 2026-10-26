import type { CartResponse } from '#shared/types/kitloom'

/** The shipping rate the visitor picked. */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ shipping_method: string }>(event)

  return passThrough(event, await siteFetch<CartResponse>(event, '/wp-json/wc/store/v1/cart/select-shipping-rate', {
    method: 'POST',
    body: { shipping_method: String(body?.shipping_method ?? '') },
  }))
})
