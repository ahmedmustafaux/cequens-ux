import { supabase } from '../supabase'
import type { Campaign } from './types'

/**
 * Fetch all campaigns
 * @param userId - The ID of the user whose campaigns to fetch
 */
export async function fetchCampaigns(userId: string): Promise<Campaign[]> {
  if (!userId) {
    throw new Error('userId is required to fetch campaigns')
  }

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching campaigns:', error)
    throw error
  }

  return data || []
}

/**
 * Fetch a single campaign by ID
 * @param userId - The ID of the user who owns the campaign
 * @param id - The campaign ID
 */
export async function fetchCampaignById(userId: string, id: string): Promise<Campaign | null> {
  if (!userId) {
    throw new Error('userId is required to fetch campaign')
  }

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching campaign:', error)
    throw error
  }

  return data
}

/**
 * Create a new campaign
 * @param userId - The ID of the user creating the campaign
 * @param campaign - The campaign data to create
 */
export async function createCampaign(userId: string, campaign: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Campaign> {
  if (!userId) {
    throw new Error('userId is required to create campaign')
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      ...campaign,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating campaign:', error)
    throw error
  }

  return data
}

/**
 * Update an existing campaign
 * @param userId - The ID of the user who owns the campaign
 * @param id - The campaign ID
 * @param campaign - The campaign data to update
 */
export async function updateCampaign(userId: string, id: string, campaign: Partial<Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Campaign> {
  if (!userId) {
    throw new Error('userId is required to update campaign')
  }

  // Remove user_id from update data to prevent changing ownership
  const { user_id, ...updateData } = campaign as any

  const { data, error } = await supabase
    .from('campaigns')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating campaign:', error)
    throw error
  }

  return data
}

/**
 * Delete a campaign
 * @param userId - The ID of the user who owns the campaign
 * @param id - The campaign ID
 */
export async function deleteCampaign(userId: string, id: string): Promise<void> {
  if (!userId) {
    throw new Error('userId is required to delete campaign')
  }

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting campaign:', error)
    throw error
  }
}

