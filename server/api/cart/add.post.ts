import type { CartResponse } from '#shared/types/kitloom'

/** Puts a product into the visitor's cart on the site; the site answers with the cart and a notice. */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ product_id: number; quantity?: number; variation_id?: number }>(event)

  return passThrough(event, await siteFetch<CartResponse>(event, '/wp-json/wc/store/v1/cart/add-item', {
    method: 'POST',
    body: {
      product_id: Number(body?.product_id),
      quantity: Math.max(1, Number(body?.quantity ?? 1)),
      ...(body?.variation_id ? { variation_id: Number(body.variation_id) } : {}),
    },
  }))
})
