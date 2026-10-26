<script setup lang="ts">
const page = useSharedPage()
const { toPath, isInternal } = useLinks()

const site = computed(() => page.value?.site)

const zones = computed(() =>
  Object.entries(page.value?.widgets ?? {}).filter(([, widgets]) => widgets.length),
)

const menuAt = (location: string) => {
  const name = page.value?.menuLocations?.[location]
  return name ? page.value?.menus?.[name] ?? null : null
}

const links = computed(() => menuAt('pantry-footer'))
const social = computed(() => menuAt('pantry-social'))
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="columns">
        <div class="about">
          <strong class="name">{{ site?.name }}</strong>
          <p v-if="site?.description" class="tagline">{{ site.description }}</p>
          <ul v-if="social" class="social">
            <li v-for="item in social.items" :key="item.id">
              <a :href="item.url" rel="noopener">{{ item.title }}</a>
            </li>
          </ul>
        </div>

        <template v-for="[zone, widgets] in zones" :key="zone">
          <div v-for="widget in widgets" :key="widget.id" class="widget">
            <h3 v-if="widget.title">{{ widget.title }}</h3>
            <HtmlContent :html="widget.content" class="widget-body" />
          </div>
        </template>
      </div>

      <div class="bottom">
        <ul v-if="links" class="links">
          <li v-for="item in links.items" :key="item.id">
            <NuxtLink v-if="isInternal(item.url)" :to="toPath(item.url)">{{ item.title }}</NuxtLink>
            <a v-else :href="item.url">{{ item.title }}</a>
          </li>
        </ul>
        <p class="colophon">
          © {{ year }} {{ site?.name }} · Content from <a href="https://kitloom.dev" rel="noopener">kitloom</a>, drawn by <a href="https://nuxt.com" rel="noopener">Nuxt</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer { margin-top: 4rem; background: var(--bg-deep); border-top: 1px solid var(--line); padding: 3rem 0 2rem; color: var(--ink-soft); }
.columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2rem; }
.name { font-family: var(--font-display); font-size: 1.5rem; color: var(--ink); }
.tagline { color: var(--muted); }
.widget h3 { font-size: 1rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--pumpkin); font-family: var(--font-body); }
.widget-body :deep(ul) { list-style: none; padding: 0; margin: 0; }
.widget-body :deep(li) { padding: 0.25rem 0; }
.widget-body :deep(a) { color: var(--ink-soft); text-decoration: none; }
.widget-body :deep(a:hover) { color: var(--rust); }
.social { list-style: none; padding: 0; margin: 1rem 0 0; display: flex; gap: 1rem; }
.social a { font-weight: 600; text-decoration: none; }
.bottom { margin-top: 2.5rem; padding-top: 1.25rem; border-top: 1px solid var(--line); display: flex; flex-wrap: wrap; gap: 1rem 2rem; justify-content: space-between; align-items: center; }
.links { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.25rem 1.25rem; }
.links a { color: var(--ink-soft); text-decoration: none; font-size: 0.95rem; }
.links a:hover { color: var(--rust); }
.colophon { margin: 0; font-size: 0.9rem; color: var(--muted); }
</style>
