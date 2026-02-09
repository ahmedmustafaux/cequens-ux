import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTags, createTag, deleteTag } from '@/lib/supabase/tags'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export const tagKeys = {
    all: ['tags'] as const,
    lists: () => [...tagKeys.all, 'list'] as const,
}

export function useTags() {
    const { user } = useAuth()
    const userId = user?.id || ''

    return useQuery({
        queryKey: tagKeys.all,
        queryFn: () => fetchTags(userId),
        enabled: !!userId,
    })
}

export function useCreateTag() {
    const { user } = useAuth()
    const userId = user?.id || ''
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ name, color }: { name: string, color?: string }) => createTag(userId, name, color),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tagKeys.all })
            toast.success('Tag created successfully')
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create tag')
        },
    })
}

export function useDeleteTag() {
    const { user } = useAuth()
    const userId = user?.id || ''
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteTag(userId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tagKeys.all })
            toast.success('Tag deleted successfully')
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete tag')
        },
    })
}
