import type { RouterConfig } from '@nuxt/schema'

/**
 * Every address is the same route with another path or query — a sorted catalog, the next
 * page of orders, the receipt after the checkout — so a navigation starts at the top, as a
 * new page would; back and forward return where the visitor was.
 */
export default <RouterConfig>{
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 80 }
    return { top: 0 }
  },
}
