import { supabase } from '../supabase'
import type { Contact, AppContact } from './types'
import { detectCountryFromPhoneNumber } from '../phone-utils'
import { updateAllSegmentsForUser } from './segments'

/**
 * Extracts country ISO from phone number if not already set
 */
function ensureCountryISO(phone: string, existingCountryISO: string | null): string {
  // If countryISO is already set and valid, use it
  if (existingCountryISO && existingCountryISO.trim() !== '') {
    return existingCountryISO.toUpperCase()
  }
  
  // Try to detect country from phone number
  if (phone && phone.trim() !== '') {
    try {
      const detection = detectCountryFromPhoneNumber(phone)
      if (detection.countryISO) {
        return detection.countryISO.toUpperCase()
      }
    } catch (error) {
      console.warn('Failed to detect country from phone number:', error)
    }
  }
  
  // Default fallback
  return existingCountryISO?.toUpperCase() || 'SA'
}

/**
 * Converts database Contact to app Contact format
 */
function dbContactToAppContact(dbContact: Contact): AppContact {
  // Ensure countryISO is set from phone number if missing
  const countryISO = ensureCountryISO(dbContact.phone, dbContact.country_iso)
  
  return {
    id: dbContact.id,
    name: dbContact.name,
    firstName: dbContact.first_name || undefined,
    lastName: dbContact.last_name || undefined,
    phone: dbContact.phone,
    emailAddress: dbContact.email_address || undefined,
    countryISO: countryISO,
    avatar: dbContact.avatar || dbContact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    avatarColor: dbContact.avatar_color || 'bg-blue-500',
    tags: dbContact.tags || [],
    channel: dbContact.channel || null,
    conversationStatus: dbContact.conversation_status || 'unassigned',
    assignee: dbContact.assignee,
    lastMessage: dbContact.last_message || '',
    isSelected: false,
    createdAt: dbContact.created_at ? new Date(dbContact.created_at) : undefined,
    updatedAt: dbContact.updated_at ? new Date(dbContact.updated_at) : undefined,
    lastInteractionTime: dbContact.last_interaction_time ? new Date(dbContact.last_interaction_time) : undefined,
    language: dbContact.language || undefined,
    botStatus: dbContact.bot_status || undefined,
    lastInteractedChannel: dbContact.last_interacted_channel || undefined,
    conversationOpenedTime: dbContact.conversation_opened_time ? new Date(dbContact.conversation_opened_time) : undefined,
    archived: dbContact.archived || false,
  }
}

/**
 * Converts app Contact to database Contact format
 */
function appContactToDbContact(appContact: Partial<AppContact>): Partial<Contact> & { user_id?: string } {
  return {
    name: appContact.name,
    first_name: appContact.firstName || null,
    last_name: appContact.lastName || null,
    phone: appContact.phone,
    email_address: appContact.emailAddress || null,
    country_iso: appContact.countryISO,
    avatar: appContact.avatar || null,
    avatar_color: appContact.avatarColor || null,
    tags: appContact.tags || [],
    channel: appContact.channel || null,
    conversation_status: appContact.conversationStatus,
    assignee: appContact.assignee || null,
    last_message: appContact.lastMessage || null,
    language: appContact.language || null,
    bot_status: appContact.botStatus || null,
    last_interacted_channel: appContact.lastInteractedChannel || null,
    conversation_opened_time: appContact.conversationOpenedTime?.toISOString() || null,
    last_interaction_time: appContact.lastInteractionTime?.toISOString() || null,
    archived: appContact.archived !== undefined ? appContact.archived : undefined,
  }
}

/**
 * Fetch all contacts with optional search
 * @param userId - The ID of the user whose contacts to fetch
 * @param searchQuery - Optional search query to filter contacts
 * @param includeArchived - Whether to include archived contacts (default: false)
 */
export async function fetchContacts(userId: string, searchQuery?: string, includeArchived: boolean = false): Promise<AppContact[]> {
  if (!userId) {
    throw new Error('userId is required to fetch contacts')
  }

  let query = supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)

  // Filter out archived contacts by default
  if (!includeArchived) {
    query = query.eq('archived', false)
  }

  // If search query is provided, search in name, phone, and last_message columns
  if (searchQuery && searchQuery.trim()) {
    const searchTerm = searchQuery.trim()
    // Escape special characters for SQL LIKE patterns
    const escapedTerm = searchTerm.replace(/%/g, '\\%').replace(/_/g, '\\_')
    const searchPattern = `%${escapedTerm}%`
    // Use Supabase's or() filter with ilike for case-insensitive search
    // Format: column.ilike.value,column2.ilike.value (comma-separated, no spaces)
    query = query.or(`name.ilike.${searchPattern},phone.ilike.${searchPattern},last_message.ilike.${searchPattern},first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email_address.ilike.${searchPattern}`)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching contacts:', error)
    throw error
  }

  return (data || []).map(dbContactToAppContact)
}

/**
 * Fetch a single contact by ID
 * @param userId - The ID of the user who owns the contact
 * @param id - The contact ID
 */
export async function fetchContactById(userId: string, id: string): Promise<AppContact | null> {
  if (!userId) {
    throw new Error('userId is required to fetch contact')
  }

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching contact:', error)
    throw error
  }

  return data ? dbContactToAppContact(data) : null
}

/**
 * Create a new contact
 * @param userId - The ID of the user creating the contact
 * @param contact - The contact data to create
 */
export async function createContact(userId: string, contact: Partial<AppContact>): Promise<AppContact> {
  if (!userId) {
    throw new Error('userId is required to create contact')
  }

  const dbContact = appContactToDbContact(contact)
  dbContact.user_id = userId

  const { data, error } = await supabase
    .from('contacts')
    .insert(dbContact)
    .select()
    .single()

  if (error) {
    console.error('Error creating contact:', error)
    throw error
  }

  const createdContact = dbContactToAppContact(data)

  // Update all segments for this user in the background
  // Don't await to avoid blocking the contact creation
  updateAllSegmentsForUser(userId).catch(err => {
    console.error('Error updating segments after contact creation:', err)
  })

  return createdContact
}

/**
 * Update an existing contact
 * @param userId - The ID of the user who owns the contact
 * @param id - The contact ID
 * @param contact - The contact data to update
 */
export async function updateContact(userId: string, id: string, contact: Partial<AppContact>): Promise<AppContact> {
  if (!userId) {
    throw new Error('userId is required to update contact')
  }

  const dbContact = appContactToDbContact(contact)
  // Remove user_id from update data to prevent changing ownership
  delete dbContact.user_id

  const { data, error } = await supabase
    .from('contacts')
    .update(dbContact)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating contact:', error)
    throw error
  }

  const updatedContact = dbContactToAppContact(data)

  // Update all segments for this user in the background
  // Don't await to avoid blocking the contact update
  updateAllSegmentsForUser(userId).catch(err => {
    console.error('Error updating segments after contact update:', err)
  })

  return updatedContact
}

/**
 * Delete a contact
 * @param userId - The ID of the user who owns the contact
 * @param id - The contact ID
 */
export async function deleteContact(userId: string, id: string): Promise<void> {
  if (!userId) {
    throw new Error('userId is required to delete contact')
  }

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting contact:', error)
    throw error
  }

  // Update all segments for this user in the background
  // Don't await to avoid blocking the contact deletion
  updateAllSegmentsForUser(userId).catch(err => {
    console.error('Error updating segments after contact deletion:', err)
  })
}

/**
 * Filter contacts by conversation status
 * @param userId - The ID of the user whose contacts to fetch
 * @param status - The conversation status to filter by
 */
export async function fetchContactsByStatus(userId: string, status: string): Promise<AppContact[]> {
  if (!userId) {
    throw new Error('userId is required to fetch contacts by status')
  }

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .eq('conversation_status', status)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contacts by status:', error)
    throw error
  }

  return (data || []).map(dbContactToAppContact)
}

/**
 * Archive one or more contacts
 * @param userId - The ID of the user who owns the contacts
 * @param ids - Array of contact IDs to archive
 */
export async function archiveContacts(userId: string, ids: string[]): Promise<void> {
  if (!userId) {
    throw new Error('userId is required to archive contacts')
  }

  if (!ids || ids.length === 0) {
    throw new Error('At least one contact ID is required')
  }

  const { error } = await supabase
    .from('contacts')
    .update({ archived: true })
    .eq('user_id', userId)
    .in('id', ids)

  if (error) {
    console.error('Error archiving contacts:', error)
    throw error
  }

  // Update all segments for this user in the background
  // Don't await to avoid blocking the archive operation
  updateAllSegmentsForUser(userId).catch(err => {
    console.error('Error updating segments after archiving contacts:', err)
  })
}

/**
 * Unarchive one or more contacts
 * @param userId - The ID of the user who owns the contacts
 * @param ids - Array of contact IDs to unarchive
 */
export async function unarchiveContacts(userId: string, ids: string[]): Promise<void> {
  if (!userId) {
    throw new Error('userId is required to unarchive contacts')
  }

  if (!ids || ids.length === 0) {
    throw new Error('At least one contact ID is required')
  }

  const { error } = await supabase
    .from('contacts')
    .update({ archived: false })
    .eq('user_id', userId)
    .in('id', ids)

  if (error) {
    console.error('Error unarchiving contacts:', error)
    throw error
  }

  // Update all segments for this user in the background
  // Don't await to avoid blocking the unarchive operation
  updateAllSegmentsForUser(userId).catch(err => {
    console.error('Error updating segments after unarchiving contacts:', err)
  })
}

