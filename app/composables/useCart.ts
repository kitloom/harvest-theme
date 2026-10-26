import type { Cart, CartResponse, PlacedOrder } from '#shared/types/kitloom'

/**
 * The visitor's cart: the site's, read and written through the theme's server, which keeps the
 * visitor's session on the site. One state for the header's count, the buttons and the cart page.
 */
export function useCart() {
  const cart = useState<Cart | null>('kitloom:cart', () => null)
  const busy = useState<boolean>('kitloom:cart-busy', () => false)
  const page = useSharedPage()
  const request = useRequestFetch()
  const { notify: say } = useNotice()
  const { toPath } = useLinks()

  // Until the cart is read, the count the page came with.
  const count = computed(() => cart.value?.count ?? page.value?.cart?.count ?? 0)

  // A cart notice shows the way to the cart while there is something in it.
  const notify = (text: string | null | undefined) => {
    const items = cart.value?.count ?? 0
    say(text, items ? { label: `View cart (${items})`, to: toPath(page.value?.cart?.url ?? '/cart/') } : undefined)
  }

  const call = async (path: string, body?: Record<string, unknown>): Promise<boolean> => {
    busy.value = true
    try {
      const response = await request<CartResponse>(path, body ? { method: 'POST', body } : {})
      cart.value = response.cart
      notify(response.message)
      return true
    } catch (error) {
      const data = (error as { data?: { message?: string } }).data
      notify(data?.message ?? 'The cart could not be changed.')
      return false
    } finally {
      busy.value = false
    }
  }

  const load = () => call('/api/cart')
  const add = (productId: number, quantity = 1, variationId?: number) =>
    call('/api/cart/add', { product_id: productId, quantity, ...(variationId ? { variation_id: variationId } : {}) })
  const setQuantity = (key: string, quantity: number) => call('/api/cart/update', { quantities: { [key]: quantity } })
  const remove = (key: string) => call('/api/cart/remove', { key })

  type Address = { country: string; state: string; postcode: string; city: string }

  /** The addresses the cart is priced and shipped to; the rates come back with the cart. */
  const setCustomer = async (billing: Address, shipping?: Address) => {
    busy.value = true
    try {
      const response = await request<CartResponse>('/api/cart/customer', { method: 'POST', body: { billing_address: billing, shipping_address: shipping ?? billing } })
      cart.value = response.cart
      return null
    } catch (error) {
      return (error as { data?: { message?: string } }).data?.message ?? 'The address could not be used.'
    } finally {
      busy.value = false
    }
  }

  const chooseShipping = (rateId: string) => call('/api/cart/shipping', { shipping_method: rateId })

  /**
   * Places the order with the form as the site's checkout page would post it. The site's
   * answer: where to go next, or a message per field.
   */
  const placeOrder = async (form: Record<string, string>): Promise<{ placed?: PlacedOrder; errors?: Record<string, string>; message?: string }> => {
    busy.value = true
    try {
      const placed = await request<PlacedOrder>('/api/checkout', { method: 'POST', body: form })
      cart.value = null
      return { placed }
    } catch (error) {
      const data = (error as { data?: { message?: string; data?: { params?: Record<string, string> } } }).data
      return { errors: data?.data?.params ?? {}, message: data?.message ?? 'The order could not be placed.' }
    } finally {
      busy.value = false
    }
  }

  return { cart, count, busy, load, add, setQuantity, remove, setCustomer, chooseShipping, placeOrder }
}
