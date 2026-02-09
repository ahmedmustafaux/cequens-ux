import { supabase } from '../supabase'
import type { CustomAttributeDefinition } from './types'

/**
 * Fetch all custom attribute definitions
 */
export async function fetchAttributeDefinitions(userId: string): Promise<CustomAttributeDefinition[]> {
    if (!userId) throw new Error('userId is required')

    const { data, error } = await supabase
        .from('custom_attribute_definitions')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching attribute definitions:', error)
        throw error
    }

    return data || []
}

/**
 * Create a new custom attribute definition
 */
export async function createAttributeDefinition(
    userId: string,
    definition: Omit<CustomAttributeDefinition, 'id' | 'user_id' | 'created_at'>
): Promise<CustomAttributeDefinition> {
    if (!userId) throw new Error('userId is required')

    const { data, error } = await supabase
        .from('custom_attribute_definitions')
        .insert({
            user_id: userId,
            name: definition.name.trim(),
            key: definition.key.trim().toLowerCase().replace(/\s+/g, '_'),
            data_type: definition.data_type
        })
        .select()
        .single()

    if (error) {
        if (error.code === '23505') {
            throw new Error(`Attribute with key "${definition.key}" already exists`)
        }
        console.error('Error creating attribute definition:', error)
        throw error
    }

    return data
}

/**
 * Delete a custom attribute definition
 */
export async function deleteAttributeDefinition(userId: string, id: string): Promise<void> {
    if (!userId) throw new Error('userId is required')

    const { error } = await supabase
        .from('custom_attribute_definitions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (error) {
        console.error('Error deleting attribute definition:', error)
        throw error
    }
}
