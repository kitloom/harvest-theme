<script setup lang="ts">
import type { Product } from '#shared/types/kitloom'

defineProps<{ product: Product }>()
const { toPath } = useLinks()
</script>

<template>
  <article class="card product">
    <NuxtLink :to="toPath(product.link)" class="picture" :aria-label="product.title">
      <img v-if="product.image" :src="product.image" :alt="product.title" width="600" height="600" loading="lazy">
      <span v-if="product.onSale" class="badge sale">−{{ product.discount }}%</span>
      <span v-else-if="product.featured" class="badge">Favourite</span>
    </NuxtLink>
    <div class="body">
      <NuxtLink v-if="product.category" :to="toPath(product.category.link)" class="category">{{ product.category.name }}</NuxtLink>
      <h3><NuxtLink :to="toPath(product.link)">{{ product.title }}</NuxtLink></h3>
      <Stars v-if="product.reviewCount" :rating="product.rating" :count="product.reviewCount" />
      <div class="price-row">
        <span class="price">
          <s v-if="product.onSale">{{ product.regularPriceFormatted }}</s>
          <strong>{{ product.priceFormatted }}</strong>
        </span>
        <span v-if="!product.inStock" class="badge moss">Sold out</span>
        <AddToCart v-else :product="product" compact />
      </div>
    </div>
  </article>
</template>

<style scoped>
.product { display: flex; flex-direction: column; overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.product:hover { transform: translateY(-3px); box-shadow: 0 18px 40px -20px rgba(46, 31, 20, 0.5); }
.picture { position: relative; display: block; aspect-ratio: 1; background: var(--bg-deep); }
.picture img { width: 100%; height: 100%; object-fit: cover; }
.picture .badge { position: absolute; top: 0.75rem; left: 0.75rem; }
.body { padding: 1rem 1.2rem 1.2rem; display: flex; flex-direction: column; gap: 0.35rem; }
.category { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--pumpkin); text-decoration: none; font-weight: 600; }
h3 { font-size: 1.1rem; margin: 0; }
h3 a { color: var(--ink); text-decoration: none; }
h3 a:hover { color: var(--rust); }
.price-row { display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; }
.price { display: flex; gap: 0.5rem; align-items: baseline; }
.price s { color: var(--muted); font-size: 0.9rem; }
.price strong { font-size: 1.15rem; color: var(--rust); }
</style>
