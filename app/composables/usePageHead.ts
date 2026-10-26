import type { Page } from '#shared/types/kitloom'

/**
 * The title, description, social cards and JSON-LD the site computed for the page,
 * with its canonical address moved to the theme's own origin.
 */
export function usePageHead(page: Ref<Page>) {
  const { toPath } = useLinks()
  const origin = useRequestURL().origin

  const head = computed(() => page.value.head)

  useSeoMeta({
    title: () => head.value?.title ?? page.value.site?.name,
    description: () => head.value?.description,
    robots: () => head.value?.robots,
    ogTitle: () => head.value?.openGraph['og:title'],
    ogDescription: () => head.value?.openGraph['og:description'],
    ogImage: () => head.value?.openGraph['og:image'],
    ogType: () => (head.value?.openGraph['og:type'] as 'website' | 'article' | undefined),
    ogSiteName: () => head.value?.openGraph['og:site_name'],
    twitterCard: () => (head.value?.twitter['twitter:card'] as 'summary_large_image' | undefined),
  })

  useHead({
    htmlAttrs: { lang: () => page.value.site?.language?.slice(0, 2) ?? 'en' },
    link: () => head.value?.canonical ? [{ rel: 'canonical', href: origin + toPath(head.value.canonical) }] : [],
    script: () => page.value.schema
      ? [{ type: 'application/ld+json', innerHTML: JSON.stringify(page.value.schema) }]
      : [],
  })
}
