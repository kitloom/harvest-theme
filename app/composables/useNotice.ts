/** A line at the foot of the page for a few seconds: what just happened, and where to go on. */
export interface Notice { id: number; text: string; link?: { label: string; to: string } }

let shown = 0

export function useNotice() {
  const notice = useState<Notice | null>('kitloom:notice', () => null)

  // Compared by id: the state hands back a reactive copy, never the object that was put in.
  const notify = (text: string | null | undefined, link?: Notice['link']) => {
    if (!text) return
    const id = ++shown
    notice.value = { id, text, link }
    if (import.meta.client) {
      setTimeout(() => { if (notice.value?.id === id) notice.value = null }, 4500)
    }
  }

  return { notice, notify }
}
