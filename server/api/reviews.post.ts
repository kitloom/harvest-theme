/** A review of a product — the shop's `products/{id}/reviews`, as the visitor. */
export default defineEventHandler(async (event) => {
  const { product, ...form } = (await readBody<Record<string, unknown>>(event)) ?? {}
  const id = Number(product)

  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'A product is expected.' })
  }

  return passThrough(event, await siteFetch<unknown>(event, `/wp-json/wc/store/v1/products/${id}/reviews`, {
    method: 'POST',
    body: formFields(form),
  }))
})
