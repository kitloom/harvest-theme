/** A line at the foot of the page for a few seconds: what just happened, and where to go on. */
export interface Notice { text: string; link?: { label: string; to: string } }

export function useNotice() {
  const notice = useState<Notice | null>('kitloom:notice', () => null)

  const notify = (text: string | null | undefined, link?: Notice['link']) => {
    if (!text) return
    const shown: Notice = { text, link }
    notice.value = shown
    if (import.meta.client) {
      setTimeout(() => { if (notice.value === shown) notice.value = null }, 4500)
    }
  }

  return { notice, notify }
}
