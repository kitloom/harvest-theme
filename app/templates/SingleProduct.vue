<script setup lang="ts">
import type { Page } from '#shared/types/kitloom'

const props = defineProps<{ page: Page }>()
const { toPath } = useLinks()

const product = computed(() => props.page.product!)
const content = computed(() => props.page.content!)
const picture = ref(0)
const quantity = ref(1)
const reload = useReloadPage()
const { notify } = useNotice()

// A review held for moderation is not on the page the site draws; its author sees it here.
const pending = ref<{ rating: number; review: string; author: string }[]>([])

const reviewed = async (status: 'approved' | 'hold', message: string, values: { rating: number; review: string; author: string }) => {
  notify(message)
  if (status === 'hold') pending.value.push(values)
  else await reload()
}

const ratingRows = computed(() =>
  ['5', '4', '3', '2', '1'].map(stars => ({
    stars,
    count: product.value.ratingCounts[stars] ?? 0,
    share: product.value.reviews.total ? ((product.value.ratingCounts[stars] ?? 0) / product.value.reviews.total) * 100 : 0,
  })),
)
</script>

<template>
  <article class="container section">
    <Breadcrumbs :items="page.breadcrumbs" />

    <div class="top">
      <div class="gallery">
        <div class="main card">
          <img v-if="product.gallery[picture]" :src="product.gallery[picture].full" :alt="product.gallery[picture].alt" width="600" height="600">
          <span v-if="product.onSale" class="badge sale">−{{ product.discount }}%</span>
        </div>
        <div v-if="product.gallery.length > 1" class="thumbs">
          <button v-for="(image, index) in product.gallery" :key="image.full" :class="{ active: index === picture }" @click="picture = index">
            <img :src="image.thumb" :alt="image.alt" width="120" height="120">
          </button>
        </div>
      </div>

      <div class="summary">
        <p v-if="product.categories.length" class="eyebrow">
          <NuxtLink v-for="category in product.categories" :key="category.id" :to="toPath(category.link)">{{ category.name }}</NuxtLink>
        </p>
        <h1>{{ product.title }}</h1>
        <Stars v-if="product.reviewCount" :rating="product.rating" :count="product.reviewCount" class="rating" />

        <p class="price">
          <s v-if="product.onSale">{{ product.regularPriceFormatted }}</s>
          <strong>{{ product.priceFormatted }}</strong>
          <span v-if="product.inStock" class="badge moss">In stock</span>
          <span v-else class="badge">Sold out</span>
        </p>

        <HtmlContent :html="product.shortDescription" class="short" />

        <dl v-if="product.attributes.length" class="attributes">
          <template v-for="attribute in product.attributes" :key="attribute.name">
            <dt>{{ attribute.label }}</dt>
            <dd>{{ attribute.values.join(', ') }}</dd>
          </template>
          <dt>SKU</dt>
          <dd>{{ product.sku }}</dd>
        </dl>

        <!-- The cart is the site's, kept by the theme's server; the order is finished on the site. -->
        <div class="buy">
          <label v-if="product.type !== 'variable' && product.inStock" class="quantity">
            <span class="visually-hidden">Quantity</span>
            <button type="button" aria-label="Less" @click="quantity = Math.max(1, quantity - 1)">−</button>
            <input v-model.number="quantity" type="number" min="1" :max="product.maxQuantity || 999">
            <button type="button" aria-label="More" @click="quantity = Math.min(product.maxQuantity || 999, quantity + 1)">+</button>
          </label>
          <AddToCart :product="product" :quantity="quantity" />
        </div>

        <ul v-if="product.tags.length" class="pill-list">
          <li v-for="tag in product.tags" :key="tag.id"><NuxtLink :to="toPath(tag.link)" class="pill">{{ tag.name }}</NuxtLink></li>
        </ul>
      </div>
    </div>

    <HtmlContent v-if="content.content" :html="content.content" class="prose description" />

    <section v-if="product.reviews.total || product.reviewsAllowed" id="reviews" class="reviews">
      <div class="section-head">
        <h2>{{ product.reviews.total ? `${product.reviews.total} ${product.reviews.total === 1 ? 'review' : 'reviews'}` : 'Reviews' }}</h2>
        <Stars v-if="product.reviews.total" :rating="product.rating" />
      </div>
      <div class="reviews-grid">
        <div class="side">
          <ul v-if="product.reviews.total" class="bars">
            <li v-for="row in ratingRows" :key="row.stars">
              <span>{{ row.stars }} ★</span>
              <span class="bar"><span :style="{ width: `${row.share}%` }" /></span>
              <span class="n">{{ row.count }}</span>
            </li>
          </ul>
          <p v-else class="muted">There are no reviews yet.</p>
        </div>
        <div class="list">
          <ul class="review-list">
            <li v-for="(review, index) in pending" :key="`pending-${index}`" class="card review held">
              <div class="who">
                <strong>{{ review.author || 'You' }}</strong>
                <span class="badge">Awaiting approval</span>
                <Stars :rating="review.rating" />
              </div>
              <p>{{ review.review }}</p>
            </li>
            <li v-for="review in product.reviews.items" :key="review.id" class="card review">
              <div class="who">
                <strong>{{ review.author }}</strong>
                <span v-if="review.verified" class="badge moss">Verified</span>
                <Stars :rating="review.rating" />
                <time>{{ review.dateText }}</time>
              </div>
              <p>{{ review.content }}</p>
              <div v-for="reply in review.replies ?? []" :key="reply.id" class="reply">
                <div class="who"><strong>{{ reply.author }}</strong><time>{{ reply.dateText }}</time></div>
                <p>{{ reply.content }}</p>
              </div>
            </li>
          </ul>
          <ReviewForm v-if="product.reviewsAllowed && product.reviewForm" :product="product" @posted="reviewed" />
        </div>
      </div>
    </section>

    <section v-if="product.related.length" class="related">
      <div class="section-head"><h2>Goes well with</h2></div>
      <div class="grid cols-4">
        <ProductCard v-for="item in product.related" :key="item.id" :product="item" />
      </div>
    </section>
  </article>
</template>

<style scoped>
.top { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 3rem; align-items: start; }
.main { position: relative; overflow: hidden; aspect-ratio: 1; }
.main img { width: 100%; height: 100%; object-fit: cover; }
.main .badge { position: absolute; top: 1rem; left: 1rem; }
.thumbs { display: flex; gap: 0.6rem; margin-top: 0.8rem; }
.thumbs button { border: 2px solid var(--line); border-radius: 10px; padding: 0; width: 72px; height: 72px; overflow: hidden; background: var(--surface); cursor: pointer; }
.thumbs button.active { border-color: var(--pumpkin); }
.thumbs img { width: 100%; height: 100%; object-fit: cover; }
.eyebrow a { color: inherit; text-decoration: none; margin-right: 0.6rem; }
.rating { margin-bottom: 0.75rem; }
.price { display: flex; align-items: center; gap: 0.75rem; font-size: 1.1rem; }
.price s { color: var(--muted); }
.price strong { font-size: 2rem; color: var(--rust); font-family: var(--font-display); }
.short { color: var(--ink-soft); font-size: 1.1rem; }
.attributes { display: grid; grid-template-columns: auto 1fr; gap: 0.3rem 1.25rem; margin: 1.25rem 0; padding: 1rem 1.25rem; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); }
.attributes dt { color: var(--muted); }
.attributes dd { margin: 0; }
.buy { margin: 1.5rem 0; display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
.quantity { position: relative; display: inline-flex; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); overflow: hidden; }
.quantity button { border: 0; background: none; color: var(--ink); width: 40px; height: 44px; font-size: 1.2rem; cursor: pointer; }
.quantity input { width: 3rem; border: 0; background: none; text-align: center; font: inherit; color: var(--ink); -moz-appearance: textfield; }
.quantity input::-webkit-outer-spin-button, .quantity input::-webkit-inner-spin-button { -webkit-appearance: none; }
.description { margin-top: 3rem; }
.reviews { margin-top: 3.5rem; padding-top: 2rem; border-top: 1px solid var(--line); }
.reviews-grid { display: grid; grid-template-columns: 240px 1fr; gap: 2rem; }
.bars { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }
.bars li { display: grid; grid-template-columns: 2.6rem 1fr 1.5rem; align-items: center; gap: 0.6rem; font-size: 0.9rem; color: var(--muted); }
.bar { height: 8px; background: var(--line); border-radius: 999px; overflow: hidden; }
.bar span { display: block; height: 100%; background: var(--mustard); }
.n { text-align: right; }
.review-list { list-style: none; margin: 0 0 1.5rem; padding: 0; display: grid; gap: 1rem; }
.review.held { border-style: dashed; }
.reply { margin: 0.75rem 0 0 1rem; padding-left: 0.9rem; border-left: 3px solid var(--line); }
.reply p { margin: 0.25rem 0 0; }
.muted { color: var(--muted); }
.review { padding: 1rem 1.25rem; }
.review p { margin: 0.5rem 0 0; }
.who { display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap; }
.who time { color: var(--muted); font-size: 0.85rem; margin-left: auto; }
.related { margin-top: 3.5rem; }
@media (max-width: 800px) { .top, .reviews-grid { grid-template-columns: minmax(0, 1fr); } }
</style>
