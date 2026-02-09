import { supabase } from '../supabase'
import type { Tag } from './types'

/**
 * Fetch all tags for a user
 */
export async function fetchTags(userId: string): Promise<Tag[]> {
    if (!userId) throw new Error('userId is required')

    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching tags:', error)
        throw error
    }

    return data || []
}

/**
 * Create a new tag
 */
export async function createTag(userId: string, name: string, color: string = 'blue'): Promise<Tag> {
    if (!userId) throw new Error('userId is required')
    if (!name.trim()) throw new Error('Tag name is required')

    const { data, error } = await supabase
        .from('tags')
        .insert({ user_id: userId, name: name.trim(), color })
        .select()
        .single()

    if (error) {
        if (error.code === '23505') { // Unique violation
            throw new Error(`Tag "${name}" already exists`)
        }
        console.error('Error creating tag:', error)
        throw error
    }

    return data
}

/**
 * Delete a tag
 */
export async function deleteTag(userId: string, id: string): Promise<void> {
    if (!userId) throw new Error('userId is required')

    const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (error) {
        console.error('Error deleting tag:', error)
        throw error
    }
}
