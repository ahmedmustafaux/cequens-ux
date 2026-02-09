import { supabase } from '../supabase'
import type { Tag } from './types'
import { removeTagNameFromAllContacts } from './contacts'

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

    // 1. Fetch the tag first to get its name before deleting
    const { data: tag, error: fetchError } = await supabase
        .from('tags')
        .select('name')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

    if (fetchError) {
        console.error('Error fetching tag for deletion:', fetchError)
        throw fetchError
    }

    const tagName = tag.name

    // 2. Delete the tag from the tags table
    const { error: deleteError } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (deleteError) {
        console.error('Error deleting tag:', deleteError)
        throw deleteError
    }

    // 3. Clean up contacts by removing this tagName from their tags array
    // This is done after successful deletion of the tag itself
    await removeTagNameFromAllContacts(userId, tagName).catch(err => {
        console.error('Error cleaning up contacts after tag deletion:', err)
        // We don't throw here as the tag itself is already deleted
    })
}
