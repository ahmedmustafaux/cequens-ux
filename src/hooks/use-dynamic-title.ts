import { useEffect } from 'react'
import { generatePageTitle } from '@/lib/config'

interface UseDynamicTitleOptions {
  title?: string
  suffix?: string
  prefix?: string
}

/**
 * Custom hook for managing dynamic page titles
 * @param options - Configuration for the dynamic title
 * @param deps - Dependencies that trigger title updates
 */
export function useDynamicTitle(
  options: UseDynamicTitleOptions = {},
  deps: React.DependencyList = []
) {
  const { title, suffix, prefix } = options

  useEffect(() => {
    let finalTitle = title || 'Dashboard'
    
    if (prefix) {
      finalTitle = `${prefix} - ${finalTitle}`
    }
    
    if (suffix) {
      finalTitle = `${finalTitle} - ${suffix}`
    }

    document.title = generatePageTitle(finalTitle)
  }, [title, suffix, prefix, deps])
}

/**
 * Hook for time-range based dynamic titles
 */
export function useTimeRangeTitle(timeRange: string) {
  const timeRangeLabels = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days", 
    "90d": "Last 90 Days"
  }
  
  const title = `Dashboard - ${timeRangeLabels[timeRange as keyof typeof timeRangeLabels] || "Overview"}`
  
  useDynamicTitle({ title })
}

/**
 * Hook for page-based dynamic titles
 */
export function usePageTitle(pageName: string, subPage?: string) {
  const title = subPage ? `${pageName} - ${subPage}` : pageName
  useDynamicTitle({ title })
}
