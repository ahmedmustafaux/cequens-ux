import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAttributeDefinitions, createAttributeDefinition, deleteAttributeDefinition } from '@/lib/supabase/attributes'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import type { CustomAttributeDefinition } from '@/lib/supabase/types'

export const attributeKeys = {
    all: ['attributes'] as const,
}

export function useAttributes() {
    const { user } = useAuth()
    const userId = user?.id || ''

    return useQuery({
        queryKey: attributeKeys.all,
        queryFn: () => fetchAttributeDefinitions(userId),
        enabled: !!userId,
    })
}

export function useCreateAttribute() {
    const { user } = useAuth()
    const userId = user?.id || ''
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (definition: Omit<CustomAttributeDefinition, 'id' | 'user_id' | 'created_at'>) =>
            createAttributeDefinition(userId, definition),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: attributeKeys.all })
            toast.success('Attribute definition created successfully')
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create attribute definition')
        },
    })
}

export function useDeleteAttribute() {
    const { user } = useAuth()
    const userId = user?.id || ''
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteAttributeDefinition(userId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: attributeKeys.all })
            toast.success('Attribute definition deleted successfully')
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete attribute definition')
        },
    })
}
