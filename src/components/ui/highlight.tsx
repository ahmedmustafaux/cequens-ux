import React from 'react'
import { useSearch } from '@/contexts/search-context'

interface HighlightProps {
  text: string
  searchTerm?: string
  columnId?: string
  className?: string
  highlightClassName?: string
}

export function Highlight({ 
  text, 
  searchTerm, 
  columnId, 
  className = "",
  highlightClassName = "bg-warning/20 text-warning-foreground px-0.5 py-0.5 rounded-sm font-medium"
}: HighlightProps) {
  const { getSearchTerm } = useSearch()
  
  // Get search term from props, context, or use empty string
  const activeSearchTerm = searchTerm || (columnId ? getSearchTerm(columnId) : "")
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    // Highlight component rendering
  }
  
  if (!activeSearchTerm || !text) {
    return <span className={className}>{text}</span>
  }

  // Create a regex that matches the search term case-insensitively
  const regex = new RegExp(`(${activeSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches the search term (case-insensitive)
        const isMatch = part.toLowerCase() === activeSearchTerm.toLowerCase()
        return isMatch ? (
          <mark
            key={index}
            className={highlightClassName}
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      })}
    </span>
  )
}

// Auto-highlight component that automatically uses search context
interface AutoHighlightProps {
  text: string
  columnId: string
  className?: string
  highlightClassName?: string
}

export function AutoHighlight({ 
  text, 
  columnId, 
  className = "",
  highlightClassName = "bg-warning/20 text-warning-foreground px-0.5 py-0.5 rounded-sm font-medium"
}: AutoHighlightProps) {
  return (
    <Highlight 
      text={text} 
      columnId={columnId} 
      className={className}
      highlightClassName={highlightClassName}
    />
  )
}
