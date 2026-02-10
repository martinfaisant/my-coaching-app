type PageHeaderProps = {
  title: string
  rightContent?: React.ReactNode
}

export function PageHeader({ title, rightContent }: PageHeaderProps) {
  return (
    <header className="h-20 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white/80 backdrop-blur-md border-b border-stone-100 z-10">
      <div>
        <h1 className="text-xl font-bold text-stone-800">{title}</h1>
      </div>
      {rightContent && <div>{rightContent}</div>}
    </header>
  )
}
