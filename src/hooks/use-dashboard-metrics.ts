import { useQuery } from '@tanstack/react-query'
import { fetchDashboardMetrics } from '@/lib/supabase/dashboard'
import { useAuth } from '@/hooks/use-auth'

// Query keys
export const dashboardMetricsKeys = {
  all: ['dashboard-metrics'] as const,
  byTimeRange: (timeRange: string) => [...dashboardMetricsKeys.all, timeRange] as const,
}

/**
 * Fetch dashboard metrics for a specific time range
 */
export function useDashboardMetrics(timeRange: string) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: dashboardMetricsKeys.byTimeRange(timeRange),
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated')
      return fetchDashboardMetrics(user.id, timeRange)
    },
    enabled: !!user?.id,
    staleTime: 30000, // Consider data fresh for 30 seconds
  })
}
