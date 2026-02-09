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
    customAttributes: dbContact.custom_attributes || {},
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
    custom_attributes: appContact.customAttributes || {},
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

/**
 * Add tags to multiple contacts
 * @param userId - The ID of the user who owns the contacts
 * @param contactIds - Array of contact IDs to update
 * @param tagsToAdd - Array of tags to add
 */
export async function addTagsToContacts(userId: string, contactIds: string[], tagsToAdd: string[]): Promise<void> {
  if (!userId) {
    throw new Error('userId is required to add tags')
  }

  if (!contactIds || contactIds.length === 0) {
    throw new Error('No contacts selected')
  }

  if (!tagsToAdd || tagsToAdd.length === 0) {
    return
  }

  // Fetch current tags for these contacts
  const { data: contacts, error: fetchError } = await supabase
    .from('contacts')
    .select('id, tags')
    .eq('user_id', userId)
    .in('id', contactIds)

  if (fetchError) {
    console.error('Error fetching contacts for tag update:', fetchError)
    throw fetchError
  }

  // Update each contact with merged tags using parallel updates
  try {
    await Promise.all(contacts.map(contact => {
      const currentTags = contact.tags || []
      // Merge new tags, avoiding duplicates
      const updatedTags = [...new Set([...currentTags, ...tagsToAdd])]

      return supabase
        .from('contacts')
        .update({
          tags: updatedTags,
          updated_at: new Date().toISOString()
        })
        .eq('id', contact.id)
        .eq('user_id', userId)
    }))
  } catch (error) {
    console.error('Error adding tags to contacts:', error)
    throw error
  }

  // Update segments in background
  updateAllSegmentsForUser(userId).catch(err => {
    console.error('Error updating segments after tag update:', err)
  })
}

/**
 * Remove tags from multiple contacts
 * @param userId - The ID of the user who owns the contacts
 * @param contactIds - Array of contact IDs to update
 * @param tagsToRemove - Array of tags to remove
 */
export async function removeTagsFromContacts(userId: string, contactIds: string[], tagsToRemove: string[]): Promise<void> {
  if (!userId) {
    throw new Error('userId is required to remove tags')
  }

  if (!contactIds || contactIds.length === 0) {
    throw new Error('No contacts selected')
  }

  if (!tagsToRemove || tagsToRemove.length === 0) {
    return
  }

  // Fetch current tags for these contacts
  const { data: contacts, error: fetchError } = await supabase
    .from('contacts')
    .select('id, tags')
    .eq('user_id', userId)
    .in('id', contactIds)

  if (fetchError) {
    console.error('Error fetching contacts for tag removal:', fetchError)
    throw fetchError
  }

  // Update each contact by filtering out tags
  try {
    await Promise.all(contacts.map(contact => {
      const currentTags = contact.tags || []
      const updatedTags = currentTags.filter((tag: string) => !tagsToRemove.includes(tag))

      // Only update if changes were made
      if (currentTags.length === updatedTags.length) {
        return Promise.resolve()
      }

      return supabase
        .from('contacts')
        .update({
          tags: updatedTags,
          updated_at: new Date().toISOString()
        })
        .eq('id', contact.id)
        .eq('user_id', userId)
    }))
  } catch (error) {
    console.error('Error removing tags from contacts:', error)
    throw error
  }

  // Update segments in background
  updateAllSegmentsForUser(userId).catch(err => {
    console.error('Error updating segments after tag removal:', err)
  })
}

/**
 * Update a custom attribute for multiple contacts
 * @param userId - The ID of the user who owns the contacts
 * @param contactIds - Array of contact IDs to update
 * @param key - The attribute key to update
 * @param value - The value to set for the attribute
 */
export async function updateContactsAttribute(userId: string, contactIds: string[], key: string, value: any): Promise<void> {
  if (!userId) {
    throw new Error('userId is required to update attribute')
  }

  if (!contactIds || contactIds.length === 0) {
    throw new Error('No contacts selected')
  }

  if (!key) {
    throw new Error('Attribute key is required')
  }

  // Fetch current attributes for these contacts
  const { data: contacts, error: fetchError } = await supabase
    .from('contacts')
    .select('id, custom_attributes')
    .eq('user_id', userId)
    .in('id', contactIds)

  if (fetchError) {
    console.error('Error fetching contacts for attribute update:', fetchError)
    throw fetchError
  }

  // Update each contact with new attribute value using parallel updates
  try {
    await Promise.all(contacts.map(contact => {
      const currentAttributes = contact.custom_attributes || {}
      const updatedAttributes = {
        ...currentAttributes,
        [key]: value
      }

      return supabase
        .from('contacts')
        .update({
          custom_attributes: updatedAttributes,
          updated_at: new Date().toISOString()
        })
        .eq('id', contact.id)
        .eq('user_id', userId)
    }))
  } catch (error) {
    console.error('Error updating attribute for contacts:', error)
    throw error
  }

  // Update segments in background
  updateAllSegmentsForUser(userId).catch(err => {
    console.error('Error updating segments after attribute update:', err)
  })
}

/**
 * Remove a specific tag name from all contacts that have it
 * @param userId - The ID of the user who owns the contacts
 * @param tagName - The name of the tag to remove
 */
export async function removeTagNameFromAllContacts(userId: string, tagName: string): Promise<void> {
  if (!userId) {
    throw new Error('userId is required to remove tag from contacts')
  }

  if (!tagName) {
    return
  }

  // Fetch all contacts for this user that have this tag
  const { data: contacts, error: fetchError } = await supabase
    .from('contacts')
    .select('id, tags')
    .eq('user_id', userId)
    .contains('tags', [tagName])

  if (fetchError) {
    console.error('Error fetching contacts for tag cleanup:', fetchError)
    throw fetchError
  }

  if (!contacts || contacts.length === 0) {
    return
  }

  // Update each contact by filtering out the tag
  try {
    await Promise.all(contacts.map(contact => {
      const currentTags = contact.tags || []
      const updatedTags = currentTags.filter((tag: string) => tag !== tagName)

      return supabase
        .from('contacts')
        .update({
          tags: updatedTags,
          updated_at: new Date().toISOString()
        })
        .eq('id', contact.id)
        .eq('user_id', userId)
    }))
  } catch (error) {
    console.error('Error removing tag from all contacts:', error)
    throw error
  }

  // Update segments in background
  updateAllSegmentsForUser(userId).catch(err => {
    console.error('Error updating segments after global tag removal:', err)
  })
}
