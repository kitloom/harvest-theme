// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      // The kitloom site whose pages this theme draws; NUXT_PUBLIC_SITE_URL overrides it.
      siteUrl: 'https://sziejxd3s6.filament.kitloom.dev',
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  fonts: {
    families: [
      { name: 'Fraunces', provider: 'google', weights: [400, 600, 700], styles: ['normal', 'italic'] },
      { name: 'Source Sans 3', provider: 'google', weights: [400, 600] },
    ],
  },
})
