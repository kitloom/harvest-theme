import type { Component } from 'vue'
import type { Page, Shortcode } from '#shared/types/kitloom'
import FrontPage from '~/templates/FrontPage.vue'
import Archive from '~/templates/Archive.vue'
import Single from '~/templates/Single.vue'
import Catalog from '~/templates/Catalog.vue'
import SingleProduct from '~/templates/SingleProduct.vue'
import NotFound from '~/templates/NotFound.vue'
import Cart from '~/templates/Cart.vue'
import Checkout from '~/templates/Checkout.vue'
import Account from '~/templates/Account.vue'

/**
 * WordPress's template hierarchy, decided by the site: the page says `front-page`,
 * `single`, `archive`, `search`, `404`… and the theme picks the component for it.
 * A part the page carries (a product, a catalog) wins over the template's name.
 */
export function resolveTemplate(page: Page): Component {
  if (page.kind === 'not-found') return NotFound
  if (page.product) return SingleProduct
  if (shortcode(page, 'woocommerce_cart')) return Cart
  if (shortcode(page, 'woocommerce_checkout')) return Checkout
  if (shortcode(page, 'woocommerce_my_account')) return Account
  if (page.catalog) return Catalog
  if (page.template === 'front-page') return FrontPage
  if (page.posts) return Archive

  return Single
}

/** The shortcode of that name on the page, if the owner put one there. */
export function shortcode(page: Page, name: string): Shortcode | null {
  const shortcodes = page.shortcodes
  if (!shortcodes || Array.isArray(shortcodes)) return null
  return Object.values(shortcodes).find(s => s.shortcode === name) ?? null
}
