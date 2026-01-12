import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCampaigns, fetchCampaignById, createCampaign, updateCampaign, deleteCampaign } from '@/lib/supabase/campaigns'
import type { Campaign } from '@/lib/supabase/types'
import { useAuth } from '@/hooks/use-auth'

// Query keys
export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...campaignKeys.lists(), filters] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
}

/**
 * Fetch all campaigns
 */
export function useCampaigns() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: campaignKeys.lists(),
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated')
      return fetchCampaigns(user.id)
    },
    enabled: !!user?.id,
  })
}

/**
 * Fetch a single campaign by ID
 */
export function useCampaign(id: string | undefined) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: campaignKeys.detail(id || ''),
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated')
      return fetchCampaignById(user.id, id!)
    },
    enabled: !!id && !!user?.id,
  })
}

/**
 * Create a new campaign
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (campaign: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated')
      return createCampaign(user.id, campaign)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
    },
  })
}

/**
 * Update an existing campaign
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, campaign }: { id: string; campaign: Partial<Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>> }) => {
      if (!user?.id) throw new Error('User not authenticated')
      return updateCampaign(user.id, id, campaign)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(data.id) })
    },
  })
}

/**
 * Delete a campaign
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      return deleteCampaign(user.id, id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
    },
  })
}

