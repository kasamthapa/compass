/* Compass "Field Log" icon set — hand-drawn, thin currentColor strokes with
   exactly one small --brass-filled accent detail per icon. Nav icons accept
   an `active` prop and render a filled/emphasized variant of the same
   glyph (not just a color change) when selected. See DECISIONS.md. */

interface IconProps {
  className?: string
}

interface NavIconProps extends IconProps {
  active?: boolean
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  // Bumped from 1.4 in the 6A-ii optical-balance pass: at true 16-24px
  // render size, 1.4 read slightly thin and made sparser glyphs (Goals'
  // pole, Week's dot row) look lighter than denser ones (Inbox, Journal).
  // Still inside the 1.2-1.6 range from the original brief.
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/* ---------------------------------------------------------------------- */
/* Navigation icons (six exact glyphs, each with an active/filled variant) */
/* ---------------------------------------------------------------------- */

/** Sunrise arc over a horizon line — not a filled sun disc. */
export function IconToday({ className, active }: NavIconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M8 6.5l1-1.4M16 6.5l-1-1.4M12 4v2" />
      <path
        d="M6 16a6 6 0 0 1 12 0"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.16 : 0}
      />
      <path d="M3 16h18" />
      <circle cx="12" cy="10" r="1.15" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

/** A fanned stack of two small note-cards — not a tray/box. */
export function IconInbox({ className, active }: NavIconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="4.5" y="7" width="11" height="14" rx="1.4" transform="rotate(-9 10 14)" />
      <rect
        x="8"
        y="4.5"
        width="11"
        height="14"
        rx="1.4"
        transform="rotate(7 13.5 11.5)"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.14 : 0}
      />
      <circle cx="16.4" cy="7.6" r="1.05" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

/** Seven small dots in a row, echoing the habit week-strip language. */
export function IconWeek({ className, active }: NavIconProps) {
  // Symmetric spread around the box's center (12), evenly stepped —
  // recomputed in the 6A-ii optical-balance pass; the previous positions
  // weren't quite even, and the dots' radius was bumped from 1.3 to 1.4
  // so this sparser glyph reads at a similar visual weight to denser ones.
  const xs = [2.6, 5.73, 8.87, 15.13, 18.27, 21.4]
  return (
    <svg {...base} className={className} aria-hidden="true">
      {xs.map((x) => (
        <circle key={x} cx={x} cy="12" r="1.4" fill={active ? 'currentColor' : 'none'} />
      ))}
      <circle cx="12" cy="12" r="1.6" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

/** A flag on a vertical pole with a triangular brass pennant. */
export function IconGoals({ className, active }: NavIconProps) {
  // Pole recentered from x=6 to x=9 in the 6A-ii optical-balance pass —
  // the original sat with all its mass pinned to the upper-left of the
  // box; this brings the glyph's visual center closer to the box's
  // actual center.
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M9 21V4" />
      <path d="M9 5.2l10 3.4L9 12Z" fill="var(--brass)" stroke="none" />
      {active && <circle cx="9" cy="21" r="1.3" fill="currentColor" stroke="none" />}
    </svg>
  )
}

/** A fountain pen nib with a center slit and a small brass breather hole. */
export function IconJournal({ className, active }: NavIconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path
        d="M12 3.2c3 0 5 2.6 5 6 0 5-3 9-5 11.8-2-2.8-5-6.8-5-11.8 0-3.4 2-6 5-6Z"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.14 : 0}
      />
      <path d="M12 8.6v9.4" />
      <circle cx="12" cy="9" r="1.05" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

/** A small constellation: 4 dots connected by thin lines, final dot brass. */
export function IconInsights({ className, active }: NavIconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M5 17.5L9.5 10L15 13L19 5" strokeWidth={active ? 1.7 : 1.4} />
      <circle cx="5" cy="17.5" r="1.25" fill={active ? 'currentColor' : 'none'} />
      <circle cx="9.5" cy="10" r="1.25" fill={active ? 'currentColor' : 'none'} />
      <circle cx="15" cy="13" r="1.25" fill={active ? 'currentColor' : 'none'} />
      <circle cx="19" cy="5" r="1.5" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

/* ---------------------------------------------------------------------- */
/* Theme toggle icons                                                      */
/* ---------------------------------------------------------------------- */

/** A small instrument dial with a brass pivot — for "follow system". */
export function IconSystem({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="13" r="7" />
      <path d="M12 13V7.5" />
      <circle cx="12" cy="13" r="1.1" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

/** A small sun with radiating ticks — for Light. */
export function IconSun({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3.5v2.3M12 18.2v2.3M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M3.5 12h2.3M18.2 12h2.3M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6" />
      <circle cx="12" cy="12" r="3" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

/** A crescent moon with a tiny star accent — for Dark. */
export function IconMoon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
      <circle cx="17.3" cy="7.2" r="0.9" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

/* ---------------------------------------------------------------------- */
/* Shell / action icons                                                    */
/* ---------------------------------------------------------------------- */

/** A hand-drawn cross with a brass center pivot — for capture/add. */
export function IconPlus({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 5.2v13.6M5.2 12h13.6" />
      <circle cx="12" cy="12" r="1" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4.5 12.7l5 5 10-11" />
      <circle cx="9.4" cy="17.6" r="0.9" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

export function IconChevronRight({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M5 9l7 7 7-7" />
    </svg>
  )
}

export function IconClose({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  )
}

/** A life-ring rendered as a compass bezel — quiet notches, one brass tick. */
export function IconLifebuoy({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M6.3 6.3l3.2 3.2M17.7 6.3l-3.2 3.2M6.3 17.7l3.2-3.2M17.7 17.7l-3.2-3.2" />
      <circle cx="12" cy="3.8" r="0.95" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

export function IconChecklist({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 6.5l1.5 1.5L8 5.5" />
      <path d="M11 6.5h9" />
      <path d="M4 12l1.5 1.5L8 11" />
      <path d="M11 12h9" />
      <path d="M4 17.5l1.5 1.5L8 16.5" />
      <path d="M11 17.5h9" />
      <circle cx="5" cy="7" r="0.85" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

export function IconRepeat({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 7.5a5.5 5.5 0 0 1 9.5-3.8L16 6" />
      <path d="M16 3v3.5h-3.5" />
      <path d="M20 16.5a5.5 5.5 0 0 1-9.5 3.8L8 18" />
      <path d="M8 21v-3.5h3.5" />
      <circle cx="12" cy="12" r="0.95" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

export function IconBookmark({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M6.5 4.5h11a1 1 0 0 1 1 1v14.5l-6.5-4-6.5 4V5.5a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="9" r="0.95" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

export function IconEdit({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 20l4.2-1 10-10a2 2 0 0 0-2.8-2.8l-10 10L4 20Z" />
      <path d="M13 5.5L18.5 11" />
      <circle cx="5.4" cy="18.6" r="0.85" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

export function IconClock({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.5V12l3.2 2" />
      <circle cx="12" cy="12" r="0.9" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

export function IconMore({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="5" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.15" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

export function IconTrash({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4.5 7h15" />
      <path d="M9 7V4.8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V7" />
      <path d="M6.5 7l1 12.2a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
      <path d="M10 11v6M14 11v6" />
      <circle cx="12" cy="9.3" r="0.8" fill="var(--brass)" stroke="none" />
    </svg>
  )
}
