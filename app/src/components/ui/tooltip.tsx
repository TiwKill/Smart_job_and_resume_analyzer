import * as React from "react"

export function Tooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
  return (
    <span className="relative group">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow group-hover:block group-hover:opacity-100">
        {content}
      </span>
    </span>
  )
}


