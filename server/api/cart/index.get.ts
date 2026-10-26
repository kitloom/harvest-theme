import type { CartResponse } from '#shared/types/kitloom'

/** The visitor's cart on the site. */
export default defineEventHandler(async (event) =>
  passThrough(event, await siteFetch<CartResponse>(event, '/wp-json/wc/store/v1/cart')),
)
