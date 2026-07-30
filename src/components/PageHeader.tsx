import { ThemeToggle } from './ThemeToggle'

interface PageHeaderProps {
  title: string
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 pb-6">
      <h1 className="font-display text-large-title text-text">{title}</h1>
      <ThemeToggle />
    </header>
  )
}
