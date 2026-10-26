# Harvest — a Nuxt theme for a kitloom site

A headless frontend in autumn colours. It draws any [kitloom](https://kitloom.dev) site — a
Laravel CMS on a WordPress database — without touching the site: every address is read as JSON
and drawn by Nuxt.

```bash
cp .env.example .env     # the site to draw; the default is a public demo
npm install
npm run dev              # http://localhost:3000
```

Node 22 or 24. `npm run build` + `node .output/server/index.mjs` for production.

## Connect your own site

The theme draws any kitloom site. The address in `.env.example` is a public sandbox that lives
three days; [filament.kitloom.dev/pantry](https://filament.kitloom.dev/pantry) makes you a fresh
one with the same store and its admin. To point the theme at yours:

1. **The address.** Put the site's address in `.env`:

   ```
   NUXT_PUBLIC_SITE_URL=https://shop.example.com
   ```

   The theme's server reads the site from there — the browser never talks to the site — so a
   site on a private address (`http://shop.test`, a staging host behind a VPN) works as long as
   the machine running Nuxt can reach it. Nothing is needed on the site for the pages: every
   kitloom site answers `Accept: application/json` with the page as data, and the REST root
   `/wp-json/` is on by default (`kitloom-site.rest`).

2. **The shop.** The cart, the checkout and the account need kitloom/shop installed with its
   Store API routes on (`kitloom-shop.routes.register`, the default) and its pages set: Shop,
   Cart, Checkout and My account under the shop's settings. `kitloom:install` with the demo sets
   them; a site that came from WooCommerce has them already. Without the shop the theme still
   draws the posts, pages, archives and search; the catalog, cart and account templates simply
   never come up.

3. **Who may order.** In the admin, the shop's settings → Accounts:
   - *Allow customers to place orders without an account* — for the checkout as a guest;
   - *Allow customers to create an account during checkout* — the "Create an account" box on
     the checkout;
   - *Allow customers to create an account on the "My account" page* — the sign-up form next
     to the sign-in.

   These are WooCommerce's own options (`woocommerce_enable_guest_checkout`,
   `woocommerce_enable_signup_and_login_from_checkout`,
   `woocommerce_enable_myaccount_registration`): a site that came from WooCommerce keeps what it
   had.

4. **How to pay and how to ship.** At least one payment method on (Direct bank transfer or
   Cash on delivery are enough for a demo) and a shipping zone with a rate for the countries you
   sell to; otherwise the checkout has nothing to offer. A gateway that takes the payment on its
   own page sends the shopper there and back to the site's "order received" address, which the
   theme draws.

Nothing else: no CORS, no API keys, no public AI agents address. The theme's server names the
site as the `Origin` of every POST, so the site's forms pass its forgery check as on its own
pages; a module that signs users in another way (two-factor, social sign-in) still takes its step
on the site.

## How it works

A kitloom site answers every URL it serves with JSON when asked with `Accept: application/json`:
the record, the posts of an archive, the catalog of a shop page, the product, the comments —
and with them everything the site's own templates get: the menus, the widgets, the breadcrumbs,
the `<head>` the SEO module computed, the JSON-LD, the languages of the page.

```
GET https://<site>/product/walnut-halves-250-g/
Accept: application/json

{ "kind": "single", "template": "single-product", "content": {…}, "product": {…},
  "menus": {…}, "widgets": {…}, "head": {…}, "schema": {…}, "languages": {…} }
```

So the theme has one route and no API client:

| Piece | File | What it does |
| --- | --- | --- |
| Proxy | `server/api/page.get.ts` | Reads `<site><path>` as JSON, keeps its status (a 404 stays a 404) |
| Middleware | `app/middleware/page.global.ts` | Reads the page of every address once (`useAsyncData`), shares it with the layout |
| Route | `app/pages/[...slug].vue` | Every address; picks a template from what the site said |
| Hierarchy | `app/utils/templates.ts` | `front-page`, `single`, `archive`, `search`, `404`… → a component |
| Templates | `app/templates/*.vue` | Front page, archive, post/page, catalog, product, not found |
| Links | `app/composables/useLinks.ts` | The site's absolute links become the theme's paths; HTML from the admin too |
| Head | `app/composables/usePageHead.ts` | `useSeoMeta` from the site's head, canonical on the theme's origin, JSON-LD |

The header and footer draw the menus by *location* (`menuLocations`) and every widget zone the
page carries, so a different kitloom site with other menus and widgets works as it is. Light and
dark follow the system, with a switch kept in the browser.

## The cart

The cart is the site's own, through its Store API (`/wp-json/wc/store/v1/cart/*`), and the
theme's server keeps the visitor's session on the site: `server/utils/site.ts` sends every
request with the cookies the site gave that visitor (kept in one `httpOnly` cookie of the
theme) and with the site as `Origin`, so a POST passes the site's forgery check as a form on its
own pages would. `useCart()` is one state for the header's count, the buttons and the cart page;
the cart page starts from the cart the site drew into the page (`[woocommerce_cart]`).

| Route | Site |
| --- | --- |
| `POST /api/cart/add` | `cart/add-item` |
| `POST /api/cart/update` | `cart/update-items` |
| `POST /api/cart/remove` | `cart/remove-item/{key}` |
| `GET /api/cart` | `cart` |
| `POST /api/cart/checkout` | the signed cart link, see below |

**Checkout in the theme.** `/checkout/` is drawn from the `[woocommerce_checkout]` part of the
site's own checkout page: the fields the shop configured (labels, which are required, their
`autocomplete`), the countries it sells and ships to, the states of each, the words a country uses
for state and postcode, the payment gateways with their descriptions, the terms to accept, whether a
guest may order. A changed address re-prices the cart through `cart/update-customer` (the rates
come back with it), a picked rate goes through `cart/select-shipping-rate`, and "Place order" posts
the form to `checkout`: the site validates it against its own rules and answers 201 with where to
go next, or 400 with a message per field, which the form shows. "Order received" is the same page
of the site with `?order-received=<id>&key=…`, drawn by the theme from its `order` part. A gateway
that takes the payment on its own page gets the visitor from the site's answer.

**The account in the theme.** `/my-account/` is the `[woocommerce_my_account]` part of the
site's account page, one view at a time as the site draws it for the visitor: the sign-in and
sign-up forms for a guest; for a customer the dashboard with recent orders, the orders with their
pages, one order, the two addresses and their forms (the same fields and countries as the
checkout), the account details with a password change. Sign-in is the site's `POST /login`, sign-out
its `POST /logout`, the rest the Store API's `account/*` routes — all through `server/api/account/*`
with the visitor's session, so after signing in every page the theme reads is the customer's
(`store.signedIn`, their cart, their addresses on the checkout). Password reset links and
two-factor steps still open on the site.

Comment and review forms and contact forms stay on the site.

## Palette

Cream paper `#faf3e6`, bark `#2e1f14`, rust `#b2431f`, pumpkin `#dd7a2c`, mustard `#d9a62b`,
moss `#5f6e2f`, wine `#7b2232` — CSS variables in `app/assets/css/main.css`, redefined for dark.
Type: Fraunces for headings, Source Sans 3 for text, through `@nuxt/fonts`.

License: MIT. kitloom itself is a paid product; see [kitloom.dev](https://kitloom.dev).
