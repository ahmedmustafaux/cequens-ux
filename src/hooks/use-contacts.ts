import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchContacts, fetchContactById, createContact, updateContact, deleteContact, fetchContactsByStatus, archiveContacts, unarchiveContacts } from '@/lib/supabase/contacts'
import type { AppContact } from '@/lib/supabase/types'
import { useAuth } from '@/hooks/use-auth'
import { segmentKeys } from '@/hooks/use-segments'

// Query keys
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...contactKeys.lists(), filters] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
}

/**
 * Fetch all contacts with optional search
 * Uses placeholderData to keep previous results visible during loading for smooth transitions
 */
export function useContacts(searchQuery?: string, includeArchived: boolean = false) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: contactKeys.list({ search: searchQuery, userId: user?.id, includeArchived }),
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated')
      return fetchContacts(user.id, searchQuery, includeArchived)
    },
    enabled: !!user?.id,
    placeholderData: (previousData) => previousData, // Keep previous data while loading for smooth transitions
    staleTime: 0, // Always consider data stale to ensure fresh search results
    refetchOnWindowFocus: false, // Don't refetch on window focus for smoother UX
  })
}

/**
 * Fetch a single contact by ID
 */
export function useContact(id: string | undefined) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: contactKeys.detail(id || ''),
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated')
      return fetchContactById(user.id, id!)
    },
    enabled: !!id && !!user?.id,
  })
}

/**
 * Fetch contacts by status
 */
export function useContactsByStatus(status: string) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: [...contactKeys.lists(), 'status', status, 'userId', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated')
      return fetchContactsByStatus(user.id, status)
    },
    enabled: !!user?.id,
  })
}

/**
 * Create a new contact
 */
export function useCreateContact() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (contact: Partial<AppContact>) => {
      if (!user?.id) throw new Error('User not authenticated')
      return createContact(user.id, contact)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      // Invalidate segments so they refresh with updated contact counts
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() })
    },
  })
}

/**
 * Update an existing contact
 */
export function useUpdateContact() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, contact }: { id: string; contact: Partial<AppContact> }) => {
      if (!user?.id) throw new Error('User not authenticated')
      return updateContact(user.id, id, contact)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(data.id) })
      // Invalidate segments so they refresh with updated contact counts
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() })
    },
  })
}

/**
 * Delete a contact
 */
export function useDeleteContact() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      return deleteContact(user.id, id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      // Invalidate segments so they refresh with updated contact counts
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() })
    },
  })
}

/**
 * Archive one or more contacts
 */
export function useArchiveContacts() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (ids: string[]) => {
      if (!user?.id) throw new Error('User not authenticated')
      return archiveContacts(user.id, ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      // Invalidate segments so they refresh with updated contact counts
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() })
    },
  })
}

/**
 * Unarchive one or more contacts
 */
export function useUnarchiveContacts() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (ids: string[]) => {
      if (!user?.id) throw new Error('User not authenticated')
      return unarchiveContacts(user.id, ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      // Invalidate segments so they refresh with updated contact counts
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() })
    },
  })
}

