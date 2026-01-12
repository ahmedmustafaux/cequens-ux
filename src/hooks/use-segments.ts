import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSegments, fetchSegmentById, createSegment, updateSegment, deleteSegment, updateSegmentContacts } from '@/lib/supabase/segments'
import type { Segment } from '@/lib/supabase/types'
import { useAuth } from '@/hooks/use-auth'

// Query keys
export const segmentKeys = {
  all: ['segments'] as const,
  lists: () => [...segmentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...segmentKeys.lists(), filters] as const,
  details: () => [...segmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...segmentKeys.details(), id] as const,
}

/**
 * Fetch all segments
 */
export function useSegments() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: segmentKeys.lists(),
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated')
      return fetchSegments(user.id)
    },
    enabled: !!user?.id,
  })
}

/**
 * Fetch a single segment by ID
 */
export function useSegment(id: string | undefined) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: segmentKeys.detail(id || ''),
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated')
      return fetchSegmentById(user.id, id!)
    },
    enabled: !!id && !!user?.id,
  })
}

/**
 * Create a new segment
 */
export function useCreateSegment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (segment: Omit<Segment, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'contact_ids'>) => {
      if (!user?.id) throw new Error('User not authenticated')
      return createSegment(user.id, segment)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() })
    },
  })
}

/**
 * Update an existing segment
 */
export function useUpdateSegment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, segment }: { id: string; segment: Partial<Omit<Segment, 'id' | 'user_id' | 'created_at' | 'updated_at'>> }) => {
      if (!user?.id) throw new Error('User not authenticated')
      return updateSegment(user.id, id, segment)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: segmentKeys.detail(data.id) })
    },
  })
}

/**
 * Delete a segment
 */
export function useDeleteSegment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      return deleteSegment(user.id, id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() })
    },
  })
}

/**
 * Update segment contacts
 */
export function useUpdateSegmentContacts() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (segmentId: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      return updateSegmentContacts(user.id, segmentId)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: segmentKeys.detail(data.id) })
    },
  })
}

