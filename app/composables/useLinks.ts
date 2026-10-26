/**
 * Every link the site sends is absolute — to the site. The theme serves the same paths,
 * so an address of the site becomes a path of the theme, and the rest stays as it is.
 */
export function useLinks() {
  const site = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')

  const isInternal = (url: string | null | undefined): boolean =>
    !!url && (url.startsWith(site) || (url.startsWith('/') && !url.startsWith('//')))

  const toPath = (url: string | null | undefined): string => {
    if (!url) return '/'
    if (url.startsWith(site)) return url.slice(site.length) || '/'
    return url
  }

  // Words from the admin carry the site's addresses in their hrefs; the theme's are shorter.
  const rewrite = (html: string | null | undefined): string =>
    (html ?? '').split(`href="${site}`).join('href="')

  return { site, isInternal, toPath, rewrite }
}
