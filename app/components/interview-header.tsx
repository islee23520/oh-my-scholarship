interface ProgressNode {
  id: string | number
  isCurrent: boolean
  isCompleted: boolean
}

export function InterviewHeader({
  isVisible,
  answeredCount,
  totalCount,
  progressNodes,
}: {
  isVisible: boolean
  answeredCount: number
  totalCount: number
  progressNodes: ProgressNode[]
}) {
  if (!isVisible) {
    return null
  }

  return (
    <header className="relative z-10 w-full border-b border-border/70 bg-bg/90 px-4 py-4 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
        <div className="text-xs text-text-muted">Progress: {answeredCount} / {totalCount}</div>
        <div className="flex items-center gap-1">
          {progressNodes.map((node) => (
            <div key={String(node.id)} className="flex flex-1 items-center">
              <div
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  node.isCompleted ? 'bg-accent' : node.isCurrent ? 'bg-accent/50' : 'bg-border'
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
