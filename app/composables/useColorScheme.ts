/**
 * Light or dark by choice, kept in the browser; without a choice the system decides.
 * The server knows neither, so the first render is the same on both sides and the
 * browser's answer arrives after mount.
 */
export function useColorScheme() {
  const theme = useState<'light' | 'dark' | null>('kitloom:theme', () => null)
  const systemDark = useState<boolean>('kitloom:system-dark', () => false)

  const apply = (value: 'light' | 'dark' | null) => {
    theme.value = value
    if (!import.meta.client) return
    const root = document.documentElement
    if (value) root.dataset.theme = value
    else delete root.dataset.theme
    try {
      if (value) localStorage.setItem('theme', value)
      else localStorage.removeItem('theme')
    } catch {}
  }

  onMounted(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    systemDark.value = media.matches
    media.addEventListener('change', event => { systemDark.value = event.matches })
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'light' || saved === 'dark') apply(saved)
    } catch {}
  })

  const isDark = computed(() => theme.value ? theme.value === 'dark' : systemDark.value)

  const toggle = () => apply(isDark.value ? 'light' : 'dark')

  return { theme, isDark, toggle }
}
