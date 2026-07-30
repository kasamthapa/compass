import { ThemeToggle } from './ThemeToggle'

interface PageHeaderProps {
  title: string
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 pb-2">
      <h1 className="font-display text-large-title text-text">{title}</h1>
      <ThemeToggle />
    </header>
  )
}
