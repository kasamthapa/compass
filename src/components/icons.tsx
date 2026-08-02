interface IconProps {
  className?: string
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconInbox({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M3.5 12h4l1.7 3h5.6l1.7-3h4" />
      <path d="M6 5.5h12l2 6.5v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6l2-6.5Z" />
    </svg>
  )
}

export function IconWeek({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
    </svg>
  )
}

export function IconGoals({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" />
    </svg>
  )
}

export function IconJournal({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M6 3.5h9.5A2.5 2.5 0 0 1 18 6v14.5H8A2.5 2.5 0 0 1 5.5 18V6A2.5 2.5 0 0 1 8 3.5Z" />
      <path d="M9 8.5h6M9 12h6M9 15.5h4" />
    </svg>
  )
}

export function IconInsights({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M2.5 20.5h19" />
    </svg>
  )
}

export function IconSystem({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="12" rx="2" />
      <path d="M8.5 20h7M12 16.5V20" />
    </svg>
  )
}

export function IconSun({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8l1.8-1.8M18 6l1.8-1.8" />
    </svg>
  )
}

export function IconMoon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  )
}

export { IconSun as IconToday }

export function IconPlus({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4.5 12.5l5 5 10-11" />
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
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function IconLifebuoy({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M6.1 6.1l3.5 3.5M17.9 6.1l-3.5 3.5M6.1 17.9l3.5-3.5M17.9 17.9l-3.5-3.5" />
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
    </svg>
  )
}

export function IconBookmark({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M6.5 4.5h11a1 1 0 0 1 1 1v14.5l-6.5-4-6.5 4V5.5a1 1 0 0 1 1-1Z" />
    </svg>
  )
}

export function IconEdit({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 20l4.2-1 10-10a2 2 0 0 0-2.8-2.8l-10 10L4 20Z" />
      <path d="M13 5.5L18.5 11" />
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
    </svg>
  )
}
