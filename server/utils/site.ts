import type { H3Event } from 'h3'

/** The theme's cookie that carries the site's own cookies: the visitor's session on the site. */
const JAR = 'kitloom_site'

/** The site's forgery token travels in a cookie of its own; the theme passes by its origin instead. */
const NOT_KEPT = new Set(['XSRF-TOKEN'])

export function siteUrl(event: H3Event): string {
  return useRuntimeConfig(event).public.siteUrl.replace(/\/$/, '')
}

/**
 * A request to the site as the visitor: with the cookies the site gave them before,
 * and with the site named as the origin, so a POST passes its forgery check the way a
 * form on its own pages does. Cookies the site sets come back into the jar.
 */
export async function siteFetch<T>(
  event: H3Event,
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown; headers?: Record<string, string> } = {},
) {
  const site = siteUrl(event)
  const jar = parseJar(getCookie(event, JAR))

  const response = await $fetch.raw<T>(site + path, {
    method: options.method ?? 'GET',
    body: options.body as Record<string, unknown> | undefined,
    headers: {
      Accept: 'application/json',
      Origin: site,
      ...(jar.size ? { Cookie: [...jar].map(([name, value]) => `${name}=${value}`).join('; ') } : {}),
      ...options.headers,
    },
    ignoreResponseError: true,
  })

  const given = response.headers.getSetCookie?.() ?? []

  if (given.length) {
    for (const line of given) {
      const pair = line.split(';', 1)[0] ?? ''
      const at = pair.indexOf('=')
      if (at > 0) {
        const name = pair.slice(0, at).trim()
        if (!NOT_KEPT.has(name)) jar.set(name, pair.slice(at + 1).trim())
      }
    }

    setCookie(event, JAR, [...jar].map(([name, value]) => `${name}=${value}`).join('; '), {
      httpOnly: true,
      sameSite: 'lax',
      secure: getRequestProtocol(event) === 'https',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  return response
}

function parseJar(value: string | undefined): Map<string, string> {
  const jar = new Map<string, string>()
  for (const pair of (value ?? '').split('; ')) {
    const at = pair.indexOf('=')
    if (at > 0) jar.set(pair.slice(0, at), pair.slice(at + 1))
  }
  return jar
}

/** The site's answer handed on as it is: its body and its status, a 4xx included. */
export function passThrough<T>(event: H3Event, response: { status: number; _data?: T }): T {
  setResponseStatus(event, response.status)
  return response._data as T
}
