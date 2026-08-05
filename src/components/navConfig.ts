import type { ComponentType } from 'react'
import { IconToday, IconInbox, IconWeek, IconGoals, IconJournal, IconInsights } from './icons'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string; active?: boolean }>
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/today', label: 'Today', icon: IconToday },
  { to: '/inbox', label: 'Inbox', icon: IconInbox },
  { to: '/week', label: 'Week', icon: IconWeek },
  { to: '/goals', label: 'Goals', icon: IconGoals },
  { to: '/journal', label: 'Journal', icon: IconJournal },
  { to: '/insights', label: 'Insights', icon: IconInsights },
]
