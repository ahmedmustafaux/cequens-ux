import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { useNavigate, useLocation } from "react-router-dom"
interface NavigationContextType {
  // Active state management
  activePath: string
  setActivePath: (path: string) => void
  
  // Loading state management
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  // Navigation function with immediate feedback
  navigateTo: (url: string) => void
  
  // Check if a path is currently active
  isActive: (path: string) => boolean
}
const NavigationContext = createContext<NavigationContextType | undefined>(undefined)
export function NavigationProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const [activePath, setActivePath] = useState(pathname)
  const [isLoading, setIsLoading] = useState(false)
  const navigateTo = useCallback((url: string) => {
    // Don't navigate if already on the page
    if (pathname === url) return
    
    // Immediately set the active path for visual feedback
    setActivePath(url)
    
    // Set loading state
    setIsLoading(true)
    
    // Navigate using React Router
    navigate(url)
    
    // Reset loading state after navigation completes
    // This will be handled by the pathname change effect
  }, [navigate, pathname])
  const isActive = useCallback((path: string) => {
    // For exact matches (like root path)
    if (activePath === path) return true
    
    // For parent paths, check if current path starts with the given path
    // This ensures that /contacts stays active when on /contacts/123 or /contacts/create
    if (path !== '/' && activePath.startsWith(path + '/')) return true
    
    return false
  }, [activePath])
  // Update active path when pathname changes (after navigation completes)
  React.useEffect(() => {
    setActivePath(pathname)
    setIsLoading(false)
  }, [pathname])
  const value: NavigationContextType = {
    activePath,
    setActivePath,
    isLoading,
    setIsLoading,
    navigateTo,
    isActive,
  }
  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}
export function useNavigationContext() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigationContext must be used within a NavigationProvider')
  }
  return context
}
