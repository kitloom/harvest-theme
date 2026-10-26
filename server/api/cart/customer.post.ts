import type { CartResponse } from '#shared/types/kitloom'

/** The addresses the cart is priced for: the shipping rates come back with the cart. */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ shipping_address?: Address; billing_address?: Address }>(event)

  return passThrough(event, await siteFetch<CartResponse>(event, '/wp-json/wc/store/v1/cart/update-customer', {
    method: 'POST',
    body: { shipping_address: address(body?.shipping_address), billing_address: address(body?.billing_address) },
  }))
})

type Address = { country?: string; state?: string; postcode?: string; city?: string }

function address(given: Address | undefined): Address | undefined {
  if (!given) return undefined
  return {
    country: String(given.country ?? '').slice(0, 2),
    state: String(given.state ?? '').slice(0, 100),
    postcode: String(given.postcode ?? '').slice(0, 20),
    city: String(given.city ?? '').slice(0, 100),
  }
}
