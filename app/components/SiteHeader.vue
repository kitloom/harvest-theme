<script setup lang="ts">
const page = useSharedPage()
const { toPath } = useLinks()
const { isDark, toggle } = useColorScheme()
const route = useRoute()

const site = computed(() => page.value?.site)

// The theme's primary location, else the first menu the site sent.
const menu = computed(() => {
  const menus = page.value?.menus ?? {}
  const location = page.value?.menuLocations?.['pantry-primary']
  return (location && menus[location]) || Object.values(menus)[0] || null
})

const cart = computed(() => page.value?.cart)
const { count } = useCart()
const store = computed(() => page.value?.store)
const languages = computed(() => page.value?.languages?.languages.filter(l => l.translated) ?? [])

const open = ref(false)
const search = ref(String(route.query.s ?? ''))

watch(() => route.fullPath, () => {
  open.value = false
  search.value = String(route.query.s ?? '')
})

const submitSearch = () => {
  if (search.value.trim()) navigateTo({ path: '/', query: { s: search.value.trim() } })
}
</script>

<template>
  <header class="header">
    <div class="container bar">
      <NuxtLink to="/" class="brand">
        <span class="leaf" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="30" height="30"><path d="M16 4c7 3 10 10 7 18-6-1-11-6-11-13 0-1.7.4-3.4 1.2-5z" fill="currentColor"/><path d="M14.5 7C11 13 11 19 16 25" stroke="var(--bg)" stroke-width="1.6" fill="none"/></svg>
        </span>
        <span class="brand-words">
          <strong>{{ site?.name ?? 'Harvest' }}</strong>
          <small v-if="site?.description">{{ site.description }}</small>
        </span>
      </NuxtLink>

      <button class="burger" :aria-expanded="open" aria-controls="site-nav" @click="open = !open">
        <span class="visually-hidden">Menu</span>
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2"><path v-if="!open" d="M3 6h18M3 12h18M3 18h18"/><path v-else d="M5 5l14 14M19 5L5 19"/></svg>
      </button>

      <nav id="site-nav" class="nav" :class="{ open }" aria-label="Main">
        <SiteMenu v-if="menu" :items="menu.items" />

        <form class="search" role="search" @submit.prevent="submitSearch">
          <input v-model="search" type="search" name="s" placeholder="Search…" aria-label="Search the site">
          <button type="submit" aria-label="Search">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </button>
        </form>

        <div class="tools">
          <template v-if="languages.length > 1">
            <NuxtLink
              v-for="language in languages"
              :key="language.slug"
              :to="toPath(language.url)"
              class="lang"
              :class="{ current: language.current }"
              :aria-current="language.current ? 'true' : undefined"
            >{{ language.slug.toUpperCase() }}</NuxtLink>
          </template>

          <NuxtLink v-if="store" :to="toPath(store.account)" class="icon-link" :class="{ signed: store.signedIn }" title="My account">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
          </NuxtLink>

          <NuxtLink v-if="cart" :to="toPath(cart.url)" class="icon-link cart" title="Cart">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 7h15l-1.5 8H7.5z"/><path d="M6 7 5 3H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
            <span v-if="count" class="count">{{ count }}</span>
          </NuxtLink>

          <button class="icon-link" :title="isDark ? 'Light' : 'Dark'" @click="toggle">
            <svg v-if="isDark" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4M17.6 17.6 19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></svg>
            <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 14.5A8 8 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky; top: 0; z-index: 20;
  background: color-mix(in srgb, var(--bg) 86%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.bar { display: flex; align-items: center; gap: 1.5rem; min-height: 72px; flex-wrap: wrap; }
.brand { display: flex; align-items: center; gap: 0.7rem; text-decoration: none; color: var(--ink); margin-right: auto; }
.leaf { color: var(--rust); display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: rgba(217, 166, 43, 0.22); }
.brand-words { display: flex; flex-direction: column; line-height: 1.15; }
.brand-words strong { font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; }
.brand-words small { color: var(--muted); font-size: 0.8rem; }
.burger { display: none; background: none; border: 0; color: var(--ink); padding: 0.4rem; cursor: pointer; }
.nav { display: flex; align-items: center; gap: 1.25rem; }
.search { display: flex; align-items: center; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); padding: 0.15rem 0.3rem 0.15rem 0.9rem; }
.search input { border: 0; background: none; color: var(--ink); font: inherit; width: 9rem; outline: none; }
.search button { border: 0; background: var(--mustard); color: #2e1f14; border-radius: 999px; width: 30px; height: 30px; display: grid; place-items: center; cursor: pointer; }
.tools { display: flex; align-items: center; gap: 0.35rem; }
.icon-link { position: relative; display: grid; place-items: center; width: 38px; height: 38px; border-radius: 10px; color: var(--ink-soft); background: none; border: 0; cursor: pointer; text-decoration: none; }
.icon-link:hover { background: var(--bg-deep); color: var(--rust); }
.icon-link.signed { color: var(--moss); }
.count { position: absolute; top: 2px; right: 2px; background: var(--rust); color: #fff8ee; font-size: 0.65rem; font-weight: 700; min-width: 17px; height: 17px; border-radius: 999px; display: grid; place-items: center; padding: 0 4px; }
.lang { font-size: 0.8rem; font-weight: 600; color: var(--muted); text-decoration: none; padding: 0.3rem 0.45rem; border-radius: 8px; }
.lang.current { color: var(--rust); background: rgba(178, 67, 31, 0.1); }

@media (max-width: 900px) {
  .burger { display: block; }
  .nav { display: none; width: 100%; flex-direction: column; align-items: stretch; padding-bottom: 1rem; }
  .nav.open { display: flex; }
  .search input { width: 100%; }
  .search { flex: 1; }
  .tools { justify-content: flex-end; }
}
</style>
