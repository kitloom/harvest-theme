<script setup lang="ts">
import type { Page } from '#shared/types/kitloom'

const props = defineProps<{ page: Page }>()
const { toPath } = useLinks()
const route = useRoute()

const catalog = computed(() => props.page.catalog!)
const products = computed(() => catalog.value.products)
const current = computed(() => catalog.value.category)
const content = computed(() => props.page.content)

const sort = (event: Event) => {
  const orderby = (event.target as HTMLSelectElement).value
  navigateTo({ path: route.path.replace(/\/page\/\d+\/$/, '/'), query: orderby === 'menu_order' ? {} : { orderby } })
}

const pages = computed(() => products.value.links.filter(link => link.page !== null))
</script>

<template>
  <div class="container section">
    <Breadcrumbs :items="page.breadcrumbs" />

    <header class="catalog-head">
      <div>
        <p class="eyebrow">{{ current ? 'Category' : 'Shop' }}</p>
        <h1>{{ current?.name ?? content?.title ?? 'Shop' }}</h1>
        <p v-if="current?.description" class="lede">{{ current.description }}</p>
        <HtmlContent v-else-if="content?.content" :html="content.content" class="lede" />
      </div>
      <label class="sort">
        <span>Sort</span>
        <select :value="catalog.orderBy" @change="sort">
          <option v-for="(label, key) in catalog.orders" :key="key" :value="key">{{ label }}</option>
        </select>
      </label>
    </header>

    <ul v-if="catalog.categories.length" class="pill-list categories">
      <li><NuxtLink :to="toPath(catalog.basePath)" class="pill" :class="{ active: !current }">All</NuxtLink></li>
      <li v-for="category in catalog.categories" :key="category.id">
        <NuxtLink :to="toPath(category.link)" class="pill" :class="{ active: current?.id === category.id }">
          {{ category.name }} <small>{{ category.count }}</small>
        </NuxtLink>
      </li>
    </ul>

    <div v-if="products.data.length" class="grid cols-4">
      <ProductCard v-for="product in products.data" :key="product.id" :product="product" />
    </div>
    <p v-else class="empty card">No products match.</p>

    <nav v-if="products.last_page > 1" class="pages" aria-label="Pages">
      <NuxtLink v-if="products.prev_page_url" :to="toPath(products.prev_page_url)" class="pill">←</NuxtLink>
      <NuxtLink v-for="link in pages" :key="link.label" :to="toPath(link.url!)" class="pill" :class="{ active: link.active }">{{ link.page }}</NuxtLink>
      <NuxtLink v-if="products.next_page_url" :to="toPath(products.next_page_url)" class="pill">→</NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
.catalog-head { display: flex; justify-content: space-between; align-items: end; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.sort { display: flex; align-items: center; gap: 0.6rem; color: var(--muted); }
.sort select { font: inherit; color: var(--ink); background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 0.45rem 0.7rem; }
.categories { margin-bottom: 2rem; }
.categories small { color: var(--muted); }
.pages { display: flex; justify-content: center; gap: 0.5rem; margin-top: 2.5rem; }
.empty { padding: 2rem; text-align: center; color: var(--muted); }
</style>
