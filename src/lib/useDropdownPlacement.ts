import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Decides whether a small absolutely-positioned dropdown anchored below its
 * trigger button (the "⋯" overflow menus on goal/priority/milestone rows)
 * has room to actually open downward, or should flip upward instead.
 *
 * A fixed `top-full` placement looks fine near the top of a page, but a
 * trigger sitting anywhere in the lower portion of a scrollable page can
 * push the menu partially or entirely below the viewport — confirmed while
 * testing on mobile: opening the menu on a card near the bottom of Goals
 * rendered "Mark dropped" off-screen, unreachable without scrolling first.
 * See DECISIONS.md.
 */
export function useDropdownPlacement(isOpen: boolean, estimatedHeightPx = 150) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [openUpward, setOpenUpward] = useState(false)

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    setOpenUpward(spaceBelow < estimatedHeightPx)
  }, [isOpen, estimatedHeightPx])

  return { triggerRef, openUpward }
}
