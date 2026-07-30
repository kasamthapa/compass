export interface NavItem {
  to: string
  label: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/today', label: 'Today' },
  { to: '/inbox', label: 'Inbox' },
  { to: '/week', label: 'Week' },
  { to: '/goals', label: 'Goals' },
  { to: '/journal', label: 'Journal' },
  { to: '/insights', label: 'Insights' },
]
