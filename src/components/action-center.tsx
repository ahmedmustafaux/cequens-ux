import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { 
  Field, 
  FieldContent 
} from '@/components/ui/field'
import { 
  InputGroup, 
  InputGroupInput, 
  InputGroupAddon 
} from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
 
import { Search, ArrowUp, ArrowDown, Command, X, Users, MessageSquare, BarChart3, Settings, Plus, FileText, Calendar, Bell, Mail, Phone, Globe, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useContacts } from '@/hooks/use-contacts'
import { cn } from '@/lib/utils'
import { useCreateContactContext } from '@/contexts/create-contact-context'
interface SearchItem {
  id: string
  title: string
  description: string
  type: 'contact' | 'page'
}
interface ActionItem {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  shortcut?: string
  category: 'search' | 'action' | 'navigation'
  action: () => void
}
interface ActionCenterProps {
  isOpen: boolean
  onClose: () => void
  searchValue: string
  onSearchChange: (value: string) => void
}
export function ActionCenter({ isOpen, onClose, searchValue, onSearchChange }: ActionCenterProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  // Local query state so typing here doesn't affect the header search bar
  const [query, setQuery] = useState("")
  const [latestSearches, setLatestSearches] = useState<Array<{
    id: string
    title: string
    subtitle: string
    type: 'contact' | 'action' | 'search'
    originalItem?: any
  }>>([])
  const navigate = useNavigate()
  const { open: openCreateContactSheet } = useCreateContactContext()
  
  // Minimal debounce (100ms) for real-time feel
  const [debouncedQuery, setDebouncedQuery] = useState("")
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 100) // 100ms debounce for real-time feel
    return () => clearTimeout(timer)
  }, [query])
  
  // Fetch contacts from database with search
  // placeholderData keeps previous results visible during loading for smooth transitions
  const { data: contacts = [] } = useContacts(debouncedQuery || undefined)
  
  const quickActions: ActionItem[] = [
    {
      id: 'create-contact',
      title: 'Create new contact',
      description: 'Add a new contact to your database',
      icon: <Users className="h-4 w-4" />,
      shortcut: '⌘ A',
      category: 'action',
      action: () => {
        openCreateContactSheet()
        onClose()
      }
    },
    {
      id: 'create-campaign',
      title: 'Create new campaign',
      description: 'Start a new messaging campaign',
      icon: <MessageSquare className="h-4 w-4" />,
      shortcut: '⌘ B',
      category: 'action',
      action: () => {
        navigate('/campaigns/create')
        onClose()
      }
    },
    {
      id: 'view-analytics',
      title: 'View analytics',
      description: 'Open analytics dashboard',
      icon: <BarChart3 className="h-4 w-4" />,
      shortcut: '⌘ C',
      category: 'navigation',
      action: () => {
        navigate('/analytics')
        onClose()
      }
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure application settings',
      icon: <Settings className="h-4 w-4" />,
      shortcut: '⌘ D',
      category: 'navigation',
      action: () => {
        navigate('/settings')
        onClose()
      }
    },
    {
      id: 'templates',
      title: 'Message templates',
      description: 'Manage message templates',
      icon: <FileText className="h-4 w-4" />,
      shortcut: '⌘ E',
      category: 'action',
      action: () => {
        navigate('/campaigns/templates')
        onClose()
      }
    },
    {
      id: 'campaigns',
      title: 'All campaigns',
      description: 'View and manage campaigns',
      icon: <MessageSquare className="h-4 w-4" />,
      shortcut: '⌘ F',
      category: 'navigation',
      action: () => {
        navigate('/campaigns')
        onClose()
      }
    }
  ]
  const allActions = [...quickActions]
  const filteredActions = query.trim()
    ? allActions.filter(action => {
        const searchTerm = query.toLowerCase()
        return action.title.toLowerCase().includes(searchTerm) ||
               (action.description?.toLowerCase() || '').includes(searchTerm) ||
               action.category.toLowerCase().includes(searchTerm)
      })
    : allActions
  // Audience search (top 5) - contacts are already filtered by database
  const displayedContacts = query.trim() ? contacts.slice(0, 5) : []
  // Removed auto-focus behavior
  useEffect(() => {
    setSelectedIndex(-1)
  }, [query])
  // Reset local query when dialog opens
  useEffect(() => {
    if (isOpen) setQuery("")
  }, [isOpen])
  // Function to save search result
  const saveSearchResult = (item: any, searchQuery: string) => {
    if (!item) return
    
    let resultItem: {
      id: string
      title: string
      subtitle: string
      type: 'contact' | 'action' | 'search'
      originalItem?: any
    }
    // Handle contacts
    if ('phone' in item) {
      resultItem = {
        id: `contact-${item.id}`,
        title: item.name,
        subtitle: item.phone,
        type: 'contact',
        originalItem: item
      }
    }
    // Handle actions
    else if (item.action) {
      resultItem = {
        id: `action-${item.id}`,
        title: item.title,
        subtitle: item.description || 'Quick action',
        type: 'action',
        originalItem: item
      }
    }
    // Handle search terms as fallback
    else {
      const trimmedQuery = searchQuery.trim()
      if (!trimmedQuery || trimmedQuery.length < 2) return
      
      resultItem = {
        id: `search-${Date.now()}`,
        title: trimmedQuery,
        subtitle: 'Search query',
        type: 'search'
      }
    }
    setLatestSearches(prev => {
      // Remove if already exists and add to front
      const filtered = prev.filter(existing => existing.id !== resultItem.id)
      return [resultItem, ...filtered].slice(0, 5) // Keep only last 5 searches
    })
  }
  
  const scrollSelectedIntoView = (index: number) => {
    if (!contentRef.current || index < 0) return
    
    // Calculate total available items
    const recentSearchesCount = !query.trim() ? Math.min(3, latestSearches.length) : 0
    const totalItems = recentSearchesCount + displayedContacts.length + filteredActions.length
    if (index >= totalItems) return
    // Find the selected item element
    const selectedElement = contentRef.current.querySelector(`[data-item-index="${index}"]`) as HTMLElement
    if (!selectedElement) return
    const container = contentRef.current
    const containerRect = container.getBoundingClientRect()
    const elementRect = selectedElement.getBoundingClientRect()
    // Check if element is above viewport
    if (elementRect.top < containerRect.top) {
      selectedElement.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
    // Check if element is below viewport
    else if (elementRect.bottom > containerRect.bottom) {
      selectedElement.scrollIntoView({ block: 'end', behavior: 'smooth' })
    }
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const recentSearchesCount = !query.trim() ? Math.min(3, latestSearches.length) : 0
    const contactsCount = displayedContacts.length
    const actionsCount = filteredActions.length
    const totalItems = recentSearchesCount + contactsCount + actionsCount
    
    const getNextValidIndex = (currentIndex: number, isUp: boolean): number => {
      if (totalItems === 0) return -1;
      
      // If no index selected yet
      if (currentIndex < 0) {
        return isUp ? totalItems - 1 : 0;
      }
      
      // Simple circular navigation
      return isUp 
        ? (currentIndex - 1 + totalItems) % totalItems 
        : (currentIndex + 1) % totalItems;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => {
          const newIndex = getNextValidIndex(prev, false)
          setTimeout(() => scrollSelectedIntoView(newIndex), 0)
          return newIndex
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => {
          const newIndex = getNextValidIndex(prev, true)
          setTimeout(() => scrollSelectedIntoView(newIndex), 0)
          return newIndex
        })
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          // Handle recent searches first (when no query)
          if (!query.trim() && selectedIndex < recentSearchesCount) {
            const searchResult = latestSearches[selectedIndex]
            handleLatestSearchClick(searchResult)
            return
          }
          // Adjust index for contacts/actions when recent searches are present
          const adjustedIndex = query.trim() ? selectedIndex : selectedIndex - recentSearchesCount
          const allItems = [...displayedContacts, ...filteredActions]
          const selectedItem = allItems[adjustedIndex]
          if (!selectedItem) return
          // Save the search result
          if (query.trim()) {
            saveSearchResult(selectedItem, query)
          }
          // Handle contacts
          if ('phone' in selectedItem) {
            navigate(`/contacts/${selectedItem.id}`)
            onClose()
            return
          }
          // Handle quick actions
          if (selectedItem.action) {
            selectedItem.action()
          }
        }
        break
      case 'Escape':
        onClose()
        break
    }
  }
  const handleLatestSearchClick = (searchResult: any) => {
    if (searchResult.type === 'contact' && searchResult.originalItem) {
      navigate(`/contacts/${searchResult.originalItem.id}`)
      onClose()
    } else if (searchResult.type === 'action' && searchResult.originalItem) {
      searchResult.originalItem.action()
    } else if (searchResult.type === 'search') {
      setQuery(searchResult.title)
    }
  }
  const handleItemClick = (item: any, index: number) => {
    setSelectedIndex(index)
    
    // Handle latest search clicks (search result objects)
    if (item.id && item.type) {
      handleLatestSearchClick(item)
      return
    }
    
    // Save the search result if user clicked on a search result
    if (query.trim()) {
      saveSearchResult(item, query)
    }
    
    // Handle contacts
    if ('phone' in item) {
      navigate(`/contacts/${item.id}`)
      onClose()
      return
    }
    // Handle quick actions
    if (item.action) {
      item.action()
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden h-[600px] flex flex-col bg-background border border-border" showCloseButton={false}>
        {/* 1. Searchbar with reduced padding and bottom border */}
        <div className="p-3 border-b border-border flex-shrink-0">
          <div className="relative">
            <Field>
              <FieldContent>
                <InputGroup className="border-0 bg-transparent focus-visible:bg-transparent focus-visible:ring-0 shadow-none">
                  <InputGroupAddon>
                    <Search className="h-4 w-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    ref={inputRef}
                    type="text"
                    placeholder="Find contacts, create campaigns, or discover actions"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pr-18 h-10 text-sm"
                  />
                </InputGroup>
              </FieldContent>
            </Field>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Kbd
                onClick={() => {
                  const allItems = [...displayedContacts, ...filteredActions]
                  if (allItems[selectedIndex]) {
                    // Save the search result
                    if (query.trim()) {
                      const allItems = [...displayedContacts, ...filteredActions]
                      if (allItems[selectedIndex]) {
                        saveSearchResult(allItems[selectedIndex], query)
                      }
                    }
                    
                    if (selectedIndex < displayedContacts.length) {
                      // Handle contact item
                      const contact = allItems[selectedIndex] as any
                      navigate(`/contacts/${contact.id}`)
                      onClose()
                    } else {
                      // Handle action item
                      const actionItem = allItems[selectedIndex] as ActionItem
                      actionItem.action()
                    }
                  }
                }}
                className="cursor-pointer"
              >
                ⏎
              </Kbd>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-7 w-7 p-0 hover:bg-muted/50"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        {/* 2. Content with reduced padding and overflow-auto */}
        <div ref={contentRef} className="p-3 flex-1 overflow-y-auto space-y-1.5">
          {/* Latest Searches - show when no query */}
          {!query.trim() && latestSearches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <h3 className="text-sm font-medium text-muted-foreground mx-2 mb-1">Recent searches</h3>
              <div className="space-y-0.5">
                {latestSearches.slice(0, 3).map((searchResult, index) => {
                  const getIcon = () => {
                    switch (searchResult.type) {
                      case 'contact':
                        return <Users className="h-4 w-4" />
                      case 'action':
                        return searchResult.originalItem?.icon || <Zap className="h-4 w-4" />
                      default:
                        return <Search className="h-4 w-4" />
                    }
                  }
                  
                  return (
                  <motion.div
                    key={searchResult.id}
                    data-item-index={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "flex items-center gap-2.5 p-2 rounded-md cursor-pointer",
                      selectedIndex === index ? "bg-muted" : "hover:bg-muted/100"
                    )}
                    onClick={() => handleItemClick(searchResult, index)}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-md flex items-center justify-center",
                      searchResult.type === 'contact' ? "bg-muted" :
                      searchResult.type === 'action' ? "bg-primary/10 border border-border-primary/20 text-primary" :
                      "bg-muted"
                    )}>
                      {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{searchResult.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{searchResult.subtitle}</div>
                    </div>
                  </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
          <AnimatePresence>
            {displayedContacts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <h3 className="text-sm font-medium text-muted-foreground mx-2 mb-1">Audience</h3>
                <div className="space-y-0.5">
                  {displayedContacts.map((contact, index) => {
                    const recentSearchesCount = !query.trim() ? Math.min(3, latestSearches.length) : 0
                    const globalIndex = recentSearchesCount + index
                    return (
                    <motion.div
                      key={contact.id}
                      data-item-index={globalIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        "flex items-center gap-2.5 p-2 rounded-md cursor-pointer",
                        selectedIndex === globalIndex ? "bg-muted" : "hover:bg-muted/100"
                      )}
                      onClick={() => handleItemClick(contact, globalIndex)}
                    >
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{`${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Contact'}</div>
                        <div className="text-xs text-muted-foreground truncate">{contact.phone}</div>
                      </div>
                    </motion.div>
                  )})}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {filteredActions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="text-sm font-medium text-muted-foreground mx-2 mb-1">Quick actions</h3>
                <div className="space-y-0.5">
                  {filteredActions.map((action, index) => {
                    const recentSearchesCount = !query.trim() ? Math.min(3, latestSearches.length) : 0
                    const globalIndex = recentSearchesCount + displayedContacts.length + index
                    return (
                      <motion.div
                        key={action.id}
                        data-item-index={globalIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "flex items-center gap-2.5 p-2 rounded-md cursor-pointer",
                          selectedIndex === globalIndex ? "bg-muted" : "hover:bg-muted/100"
                        )}
                        onClick={() => handleItemClick(action, globalIndex)}
                      >
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center border border-border-primary/20 text-primary">
                          {action.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{action.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{action.description}</div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {query.trim() && (displayedContacts.length === 0) && filteredActions.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Search className="h-6 w-6 mx-auto mb-1.5 opacity-50" />
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          )}
        </div>
        {/* 3. Footer with reduced padding */}
        <div className="px-3 py-4 border-t border-border bg-background flex items-center justify-between text-xs text-muted-foreground flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <KbdGroup>
                <Kbd><ArrowUp className="h-3 w-3" /></Kbd>
                <Kbd><ArrowDown className="h-3 w-3" /></Kbd>
              </KbdGroup>
              <span>Move up/down</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span>Close</span>
            <Kbd
              className="cursor-pointer"
              onClick={onClose}
            >
              ESC
            </Kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
