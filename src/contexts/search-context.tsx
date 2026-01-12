import React, { createContext, useContext, ReactNode, useRef, useCallback } from 'react'
interface SearchContextType {
  searchTerms: Record<string, string> // columnId -> searchTerm
  setSearchTerm: (columnId: string, searchTerm: string) => void
  getSearchTerm: (columnId: string) => string
}
const SearchContext = createContext<SearchContextType | undefined>(undefined)
interface SearchProviderProps {
  children: ReactNode
}
export function SearchProvider({ children }: SearchProviderProps) {
  const [searchTerms, setSearchTerms] = React.useState<Record<string, string>>({})
  const searchTermsRef = useRef<Record<string, string>>({})
  const setSearchTerm = useCallback((columnId: string, searchTerm: string) => {
    // Only update if the value has actually changed
    if (searchTermsRef.current[columnId] !== searchTerm) {
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        // Setting search term in context
      }
      
      searchTermsRef.current = {
        ...searchTermsRef.current,
        [columnId]: searchTerm
      }
      setSearchTerms(searchTermsRef.current)
    }
  }, [])
  const getSearchTerm = useCallback((columnId: string) => {
    return searchTermsRef.current[columnId] || ""
  }, [])
  const value = React.useMemo(() => ({
    searchTerms,
    setSearchTerm,
    getSearchTerm
  }), [searchTerms, setSearchTerm, getSearchTerm])
  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}
export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
