<script setup lang="ts">
import type { Page, Product, ProductCategory, Shortcode } from '#shared/types/kitloom'

const props = defineProps<{ page: Page }>()
const { toPath } = useLinks()

const content = computed(() => props.page.content)
const storefront = computed(() => props.page.storefront)

// The shortcodes of the front page, in the order the owner put them in the content.
const blocks = computed<Shortcode[]>(() => {
  const shortcodes = props.page.shortcodes
  return Array.isArray(shortcodes) ? [] : Object.values(shortcodes ?? {})
})
</script>

<template>
  <div>
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-words">
          <p class="eyebrow">{{ page.site?.description }}</p>
          <h1>{{ content?.title }}</h1>
          <p class="lede">{{ content?.excerpt }}</p>
          <div class="hero-actions">
            <NuxtLink v-if="storefront?.button" :to="toPath(storefront.button.url)" class="button">{{ storefront.button.label }}</NuxtLink>
            <NuxtLink to="/journal/" class="button ghost">Read the journal</NuxtLink>
          </div>
        </div>
        <div v-if="content?.thumbnail" class="hero-picture">
          <img :src="content.thumbnail.url" :alt="content.thumbnail.alt" :width="content.thumbnail.width" :height="content.thumbnail.height">
        </div>
      </div>
    </section>

    <section v-for="(block, index) in blocks" :key="index" class="section container">
      <div class="section-head">
        <h2>{{ block.arguments.title }}</h2>
        <NuxtLink v-if="block.arguments.link" :to="toPath(block.arguments.link)" class="more">See all →</NuxtLink>
      </div>

      <div v-if="block.shortcode === 'products'" class="grid cols-4">
        <ProductCard v-for="product in (block.items as Product[])" :key="product.id" :product="product" />
      </div>

      <div v-else-if="block.shortcode === 'product_categories'" class="grid cols-3">
        <CategoryCard v-for="category in (block.items as ProductCategory[])" :key="category.id" :category="category" />
      </div>
    </section>

    <section v-if="storefront?.benefits" class="benefits">
      <div class="container">
        <h2>{{ storefront.benefits.heading }}</h2>
        <div class="grid cols-3">
          <div v-for="item in storefront.benefits.items" :key="item.title" class="benefit">
            <span class="benefit-icon"><BenefitIcon :name="item.icon" /></span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero { padding: clamp(2.5rem, 7vw, 5.5rem) 0 clamp(1.5rem, 4vw, 3rem); }
.hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 3rem; align-items: center; }
.hero-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.5rem; }
.hero-picture img { border-radius: 28px; box-shadow: var(--shadow); background: var(--surface); }
.more { font-weight: 600; text-decoration: none; }
.benefits { background: var(--bg-deep); padding: clamp(2.5rem, 6vw, 4.5rem) 0; margin-top: 2rem; border-top: 1px solid var(--line); }
.benefits h2 { text-align: center; margin-bottom: 2rem; }
.benefit { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 1.5rem; }
.benefit h3 { font-size: 1.15rem; margin: 0.9rem 0 0.4rem; }
.benefit p { margin: 0; color: var(--ink-soft); }
.benefit-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 14px; background: rgba(221, 122, 44, 0.15); color: var(--rust); }
@media (max-width: 800px) { .hero-grid { grid-template-columns: 1fr; } .hero-picture { order: -1; } }
</style>
