import { useEffect, useRef, useCallback } from 'react'
import { Table } from '@tanstack/react-table'
import { useSearch } from '@/contexts/search-context'

interface UseTableSearchProps<TData> {
  table: Table<TData> | undefined
  searchColumns?: string[] // Array of column IDs to track for search
  columnFilters?: any[] // Pass the columnFilters state directly - TODO: Add proper typing
  globalFilter?: string // Pass the globalFilter state
}

export function useTableSearch<TData>({ 
  table, 
  searchColumns,
  columnFilters = [],
  globalFilter = ""
}: UseTableSearchProps<TData>) {
  const { setSearchTerm } = useSearch()
  const previousFiltersRef = useRef<Record<string, string>>({})

  // Sync search terms when globalFilter changes
  useEffect(() => {
    // Early return if table is not available
    if (!table) {
      return
    }

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      // Effect triggered for search functionality
    }

    // Get all searchable columns (either specified or all filterable columns)
    const columnsToTrack = searchColumns || 
      table.getAllColumns()
        .filter(column => column.getCanFilter())
        .map(column => column.id)

    // Update search terms for all tracked columns with the global filter value
    columnsToTrack.forEach(columnId => {
      setSearchTerm(columnId, globalFilter)
    })

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      // Updated search terms
    }
  }, [table, setSearchTerm, searchColumns, globalFilter])

  return {
    // Helper function to get search term for a specific column
    getSearchTerm: useCallback((columnId: string) => {
      if (!table) return ''
      const column = table.getColumn(columnId)
      return (column?.getFilterValue() as string) || ''
    }, [table])
  }
}
