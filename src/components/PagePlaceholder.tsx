interface PagePlaceholderProps {
  title: string
}

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <h1 className="font-display text-2xl font-semibold text-text">
        {title}
      </h1>
    </div>
  )
}
