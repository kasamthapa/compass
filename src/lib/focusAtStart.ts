import { useEffect, useRef } from 'react'

/**
 * Replaces plain `autoFocus` on any input/textarea whose value may already
 * contain existing text (editing a title, not just starting a blank one).
 * Plain `autoFocus` places the cursor at the END of a pre-filled value and
 * scrolls the field to keep it visible — for text wider than the field,
 * that scrolls the START of the text out of view. It then reads as data
 * loss ("Look into caching..." rendering as "ook into caching...") even
 * though the underlying value is intact.
 *
 * Implemented as an imperative ref + effect, not an `onFocus` handler on
 * `autoFocus` — confirmed while building this that the focus React fires
 * from the `autoFocus` prop doesn't reliably reach a sibling `onFocus`
 * prop's handler in every environment, so this calls `.focus()` itself and
 * fixes the selection/scroll immediately after, with no dependency on a
 * focus event ever being dispatched. See DECISIONS.md.
 *
 * `trigger` matters for forms that hydrate their value asynchronously (a
 * `useEffect` keyed on `isOpen` calling `setTitle(task.title)`, rather than
 * a `useState(initialValue)` that's already correct on first render): pass
 * the SAME key that hydration effect depends on (typically `isOpen`) so
 * this re-focuses/re-resets each time the form opens for a new record, not
 * just on the component's first-ever mount. Left at its default for forms
 * that already have the right value at first render (e.g.
 * `useState(capture.text)`), where a single mount-time reset is enough.
 */
export function useFocusAtStart<T extends HTMLInputElement | HTMLTextAreaElement>(trigger: unknown = true) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    function resetToStart() {
      if (!node) return
      node.focus()
      node.setSelectionRange(0, 0)
      node.scrollLeft = 0
    }
    // Deferred a frame: for async-hydration callers, the sibling effect
    // that sets the real value (e.g. setTitle(task.title)) needs its own
    // render+commit to land first, or we'd reset against the stale (often
    // empty) value that was on screen the instant this form opened. A
    // browser's own default end-of-text selection can also be assigned on
    // a later frame than focus/layout, which this same delay covers.
    const raf = requestAnimationFrame(resetToStart)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  return ref
}
