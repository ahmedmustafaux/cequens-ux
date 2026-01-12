import { supabase } from '../supabase'
import type { Segment, SegmentFilter } from './types'
import { fetchContacts } from './contacts'
import type { AppContact } from './types'
import { detectCountryFromPhoneNumber, validatePhoneNumber } from '../phone-utils'

/**
 * Fetch all segments
 * @param userId - The ID of the user whose segments to fetch
 */
export async function fetchSegments(userId: string): Promise<Segment[]> {
  if (!userId) {
    throw new Error('userId is required to fetch segments')
  }

  const { data, error } = await supabase
    .from('segments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching segments:', error)
    throw error
  }

  return (data || []).map(segment => ({
    ...segment,
    filters: segment.filters as SegmentFilter[],
  }))
}

/**
 * Fetch a single segment by ID
 * @param userId - The ID of the user who owns the segment
 * @param id - The segment ID
 */
export async function fetchSegmentById(userId: string, id: string): Promise<Segment | null> {
  if (!userId) {
    throw new Error('userId is required to fetch segment')
  }

  const { data, error } = await supabase
    .from('segments')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching segment:', error)
    throw error
  }

  return data ? {
    ...data,
    filters: data.filters as SegmentFilter[],
  } : null
}

/**
 * Create a new segment
 * @param userId - The ID of the user creating the segment
 * @param segment - The segment data to create
 */
export async function createSegment(userId: string, segment: Omit<Segment, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'contact_ids'>): Promise<Segment> {
  if (!userId) {
    throw new Error('userId is required to create segment')
  }

  const { data, error } = await supabase
    .from('segments')
    .insert({
      user_id: userId,
      name: segment.name,
      description: segment.description || null,
      filters: segment.filters,
      contact_ids: [],
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating segment:', error)
    throw error
  }

  // Update contact_ids based on filters
  const updatedSegment = await updateSegmentContacts(userId, data.id)
  return {
    ...updatedSegment,
    filters: updatedSegment.filters as SegmentFilter[],
  }
}

/**
 * Update an existing segment
 * @param userId - The ID of the user who owns the segment
 * @param id - The segment ID
 * @param segment - The segment data to update
 */
export async function updateSegment(userId: string, id: string, segment: Partial<Omit<Segment, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Segment> {
  if (!userId) {
    throw new Error('userId is required to update segment')
  }

  const updateData: any = {}
  if (segment.name !== undefined) updateData.name = segment.name
  if (segment.description !== undefined) updateData.description = segment.description
  if (segment.filters !== undefined) updateData.filters = segment.filters
  if (segment.contact_ids !== undefined) updateData.contact_ids = segment.contact_ids

  const { data, error } = await supabase
    .from('segments')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating segment:', error)
    throw error
  }

  // Update contact_ids based on filters if filters were updated (and contact_ids wasn't explicitly set)
  if (segment.filters !== undefined && segment.contact_ids === undefined) {
    const updatedSegment = await updateSegmentContacts(userId, id)
    return {
      ...updatedSegment,
      filters: updatedSegment.filters as SegmentFilter[],
    }
  }

  return {
    ...data,
    filters: data.filters as SegmentFilter[],
  }
}

/**
 * Delete a segment
 * @param userId - The ID of the user who owns the segment
 * @param id - The segment ID
 */
export async function deleteSegment(userId: string, id: string): Promise<void> {
  if (!userId) {
    throw new Error('userId is required to delete segment')
  }

  const { error } = await supabase
    .from('segments')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting segment:', error)
    throw error
  }
}

/**
 * Update all segments for a user when contacts change
 * This function recalculates contact_ids for all segments belonging to a user
 * @param userId - The ID of the user whose segments to update
 */
export async function updateAllSegmentsForUser(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('userId is required to update segments')
  }

  try {
    // Fetch all segments for the user
    const segments = await fetchSegments(userId)
    
    if (segments.length === 0) {
      // No segments to update
      return
    }

    console.log(`[Segments] Updating ${segments.length} segment(s) for user ${userId}`)
    
    // Update each segment's contact_ids based on current contacts
    await Promise.all(
      segments.map(async (segment) => {
        try {
          const updated = await updateSegmentContacts(userId, segment.id)
          console.log(`[Segments] Updated segment "${segment.name}": ${updated.contact_ids.length} contacts`)
          return updated
        } catch (error) {
          console.error(`[Segments] Error updating segment "${segment.name}":`, error)
          throw error
        }
      })
    )
    
    console.log(`[Segments] Successfully updated all segments for user ${userId}`)
  } catch (error) {
    console.error('[Segments] Error updating all segments for user:', error)
    // Don't throw - this is a background operation and shouldn't fail contact operations
  }
}

/**
 * Update segment's contact_ids based on filters
 * This function evaluates the segment filters and updates the contact_ids array
 * @param userId - The ID of the user who owns the segment
 * @param segmentId - The segment ID
 */
export async function updateSegmentContacts(userId: string, segmentId: string): Promise<Segment> {
  const segment = await fetchSegmentById(userId, segmentId)
  if (!segment) {
    throw new Error('Segment not found')
  }

  // Fetch all non-archived contacts for the user
  // Archived contacts are excluded from segments by default
  const contacts = await fetchContacts(userId, undefined, false) // includeArchived = false
  
  // Filter contacts based on segment filters and get matching contact IDs
  const matchingContactIds = getMatchingContactIds(contacts, segment.filters)

  const { data, error } = await supabase
    .from('segments')
    .update({ contact_ids: matchingContactIds })
    .eq('id', segmentId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating segment contacts:', error)
    throw error
  }

  return {
    ...data,
    filters: data.filters as SegmentFilter[],
  }
}

/**
 * Helper function to match contacts against segment filters
 * Returns an array of contact IDs that match all the segment's filters
 * 
 * @param contacts - Array of contacts to filter
 * @param filters - Array of segment filters to apply
 * @returns Array of contact IDs that match all filters
 */
function getMatchingContactIds(contacts: AppContact[], filters: SegmentFilter[]): string[] {
  if (filters.length === 0) {
    return []
  }

  // Filter contacts that match ALL filters (AND logic)
  // Only include non-archived contacts
  return contacts
    .filter(contact => !contact.archived) // Exclude archived contacts
    .filter(contact => filters.every(filter => contactMatchesFilter(contact, filter)))
    .map(contact => contact.id)
}

/**
 * Check if a contact matches a filter
 * Comprehensive filter matching for all supported fields and operators
 * Exported for use in client-side filtering
 */
export function contactMatchesFilter(contact: AppContact, filter: SegmentFilter): boolean {
  const { field, operator, value } = filter

  switch (field) {
    // Country ISO - case-insensitive comparison
    case 'countryISO':
      // Normalize country ISO values for case-insensitive comparison
      const contactCountryISO = contact.countryISO ? contact.countryISO.toUpperCase().trim() : null
      if (operator === 'equals') {
        // Handle both string and array values (for backwards compatibility)
        const filterValue = typeof value === 'string' 
          ? value.toUpperCase().trim() 
          : Array.isArray(value) && value.length > 0 && typeof value[0] === 'string'
          ? value[0].toUpperCase().trim()
          : null
        if (filterValue === null || filterValue === '') return false
        // Handle null comparison: null === null, null !== 'SA'
        if (contactCountryISO === null) {
          return filterValue === 'NULL' || filterValue === 'NONE'
        }
        return contactCountryISO === filterValue
      }
      if (operator === 'notEquals') {
        // Handle both string and array values (for backwards compatibility)
        const filterValue = typeof value === 'string' 
          ? value.toUpperCase().trim() 
          : Array.isArray(value) && value.length > 0 && typeof value[0] === 'string'
          ? value[0].toUpperCase().trim()
          : null
        if (filterValue === null || filterValue === '') return false
        if (contactCountryISO === null) {
          return filterValue !== 'NULL' && filterValue !== 'NONE'
        }
        return contactCountryISO !== filterValue
      }
      if (operator === 'in' && Array.isArray(value) && value.length > 0) {
        return value.some(v => typeof v === 'string' && contactCountryISO === v.toUpperCase().trim())
      }
      if (operator === 'notIn' && Array.isArray(value) && value.length > 0) {
        return !value.some(v => typeof v === 'string' && contactCountryISO === v.toUpperCase().trim())
      }
      if (operator === 'hasAnyOf' && Array.isArray(value) && value.length > 0) {
        return value.some(v => typeof v === 'string' && contactCountryISO === v.toUpperCase().trim())
      }
      return false

    // Tags
    case 'tags':
      const contactTags = contact.tags || []
      if (operator === 'isEmpty') {
        return contactTags.length === 0
      }
      if (operator === 'isNotEmpty') {
        return contactTags.length > 0
      }
      if (operator === 'hasAnyOf' && Array.isArray(value) && value.length > 0) {
        return value.some(tag => typeof tag === 'string' && contactTags.includes(tag))
      }
      if (operator === 'hasAllOf' && Array.isArray(value) && value.length > 0) {
        // Contact must have ALL tags in the filter value array
        return value.every(tag => typeof tag === 'string' && contactTags.includes(tag))
      }
      if (operator === 'hasNoneOf' && Array.isArray(value) && value.length > 0) {
        // Contact must have NONE of the tags in the filter value array
        return !value.some(tag => typeof tag === 'string' && contactTags.includes(tag))
      }
      return false

    // Channel
    case 'channel':
      // Normalize channel values for case-insensitive comparison
      const contactChannel = contact.channel ? contact.channel.toLowerCase().trim() : null
      if (operator === 'exists') {
        return contact.channel !== null && contact.channel !== undefined && contact.channel.trim() !== ''
      }
      if (operator === 'doesNotExist') {
        return contact.channel === null || contact.channel === undefined || contact.channel.trim() === ''
      }
      if (operator === 'hasAnyOf' && Array.isArray(value) && value.length > 0) {
        // Contact's channel matches any of the values in the array
        return value.some(v => typeof v === 'string' && contactChannel === v.toLowerCase().trim())
      }
      if (operator === 'hasAllOf' && Array.isArray(value) && value.length > 0) {
        // For channel (single value), hasAllOf means the contact's channel must match ALL values
        // This only makes sense if all values are the same, otherwise it will never match
        // More logically: check if contact channel is in the array (since contact can only have one channel)
        return value.every(v => typeof v === 'string' && contactChannel === v.toLowerCase().trim())
      }
      if (operator === 'hasNoneOf' && Array.isArray(value) && value.length > 0) {
        // Contact's channel must not match any of the values in the array
        return !value.some(v => typeof v === 'string' && contactChannel === v.toLowerCase().trim())
      }
      return false

    // Conversation Status
    case 'conversationStatus':
      const conversationStatus = (contact.conversationStatus || '').trim()
      if (operator === 'equals' && typeof value === 'string') {
        return conversationStatus === value.trim()
      }
      if (operator === 'notEquals' && typeof value === 'string') {
        return conversationStatus !== value.trim()
      }
      if (operator === 'in' && Array.isArray(value) && value.length > 0) {
        return value.some(v => typeof v === 'string' && conversationStatus === v.trim())
      }
      if (operator === 'notIn' && Array.isArray(value) && value.length > 0) {
        return !value.some(v => typeof v === 'string' && conversationStatus === v.trim())
      }
      if (operator === 'hasAnyOf' && Array.isArray(value) && value.length > 0) {
        return value.some(v => typeof v === 'string' && conversationStatus === v.trim())
      }
      return false

    // First Name
    case 'firstName':
      const firstName = (contact.firstName || '').trim()
      if (operator === 'equals' && typeof value === 'string') {
        return firstName === value.trim()
      }
      if (operator === 'notEquals' && typeof value === 'string') {
        return firstName !== value.trim()
      }
      if (operator === 'contains' && typeof value === 'string') {
        const searchValue = value.trim().toLowerCase()
        return searchValue === '' ? true : firstName.toLowerCase().includes(searchValue)
      }
      if (operator === 'startsWith' && typeof value === 'string') {
        const searchValue = value.trim().toLowerCase()
        return searchValue === '' ? true : firstName.toLowerCase().startsWith(searchValue)
      }
      if (operator === 'endsWith' && typeof value === 'string') {
        const searchValue = value.trim().toLowerCase()
        return searchValue === '' ? true : firstName.toLowerCase().endsWith(searchValue)
      }
      if (operator === 'isEmpty') {
        return firstName === ''
      }
      if (operator === 'isNotEmpty') {
        return firstName !== ''
      }
      return false

    // Last Name
    case 'lastName':
      const lastName = (contact.lastName || '').trim()
      if (operator === 'equals' && typeof value === 'string') {
        return lastName === value.trim()
      }
      if (operator === 'notEquals' && typeof value === 'string') {
        return lastName !== value.trim()
      }
      if (operator === 'contains' && typeof value === 'string') {
        const searchValue = value.trim().toLowerCase()
        return searchValue === '' ? true : lastName.toLowerCase().includes(searchValue)
      }
      if (operator === 'startsWith' && typeof value === 'string') {
        const searchValue = value.trim().toLowerCase()
        return searchValue === '' ? true : lastName.toLowerCase().startsWith(searchValue)
      }
      if (operator === 'endsWith' && typeof value === 'string') {
        const searchValue = value.trim().toLowerCase()
        return searchValue === '' ? true : lastName.toLowerCase().endsWith(searchValue)
      }
      if (operator === 'isEmpty') {
        return lastName === ''
      }
      if (operator === 'isNotEmpty') {
        return lastName !== ''
      }
      return false

    // Phone Number - contact.phone is stored in E.164 format
    case 'phoneNumber':
      const contactPhone = (contact.phone || '').trim() // E.164 format
      
      // Normalize filter value to E.164 format for comparison
      const normalizeFilterValue = (val: string): string => {
        if (!val || val.trim() === '') return ''
        // Try to detect and normalize the filter value
        const detection = detectCountryFromPhoneNumber(val)
        if (detection.isValid && detection.formattedNumber) {
          return detection.formattedNumber
        }
        // If detection fails, try validation
        const validation = validatePhoneNumber(val)
        if (validation.isValid && validation.formatted) {
          return validation.formatted
        }
        // Return as-is if normalization fails
        return val.trim()
      }
      
      if (operator === 'equals' && typeof value === 'string') {
        if (contactPhone === '') return value.trim() === ''
        const normalizedValue = normalizeFilterValue(value)
        return contactPhone === normalizedValue
      }
      if (operator === 'notEquals' && typeof value === 'string') {
        if (contactPhone === '') return value.trim() !== ''
        const normalizedValue = normalizeFilterValue(value)
        return contactPhone !== normalizedValue
      }
      if (operator === 'contains' && typeof value === 'string') {
        const searchValue = value.trim()
        if (searchValue === '') return true // Empty search matches all
        if (contactPhone === '') return false
        // For contains, check both E.164 format and local format
        const normalizedValue = normalizeFilterValue(value)
        return contactPhone.includes(normalizedValue) || contactPhone.includes(searchValue)
      }
      if (operator === 'startsWith' && typeof value === 'string') {
        const searchValue = value.trim()
        if (searchValue === '') return true // Empty search matches all
        if (contactPhone === '') return false
        // For startsWith, normalize and compare
        const normalizedValue = normalizeFilterValue(value)
        return contactPhone.startsWith(normalizedValue) || contactPhone.startsWith(searchValue)
      }
      if (operator === 'endsWith' && typeof value === 'string') {
        const searchValue = value.trim().replace(/\D/g, '')
        if (searchValue === '') return true // Empty search matches all
        if (contactPhone === '') return false
        // For endsWith, check the last digits (national number part)
        const contactNational = contactPhone.replace(/^\+\d{1,4}/, '') // Remove country code
        return contactNational.endsWith(searchValue)
      }
      if (operator === 'exists') {
        return contactPhone !== '' && contactPhone !== null && contactPhone !== undefined
      }
      if (operator === 'doesNotExist') {
        return contactPhone === '' || contactPhone === null || contactPhone === undefined
      }
      return false

    // Email Address
    case 'emailAddress':
      const email = (contact.emailAddress || '').trim()
      if (operator === 'equals' && typeof value === 'string') {
        return email === value.trim()
      }
      if (operator === 'notEquals' && typeof value === 'string') {
        return email !== value.trim()
      }
      if (operator === 'contains' && typeof value === 'string') {
        const searchValue = value.trim().toLowerCase()
        return searchValue === '' ? true : email.toLowerCase().includes(searchValue)
      }
      if (operator === 'startsWith' && typeof value === 'string') {
        const searchValue = value.trim().toLowerCase()
        return searchValue === '' ? true : email.toLowerCase().startsWith(searchValue)
      }
      if (operator === 'endsWith' && typeof value === 'string') {
        const searchValue = value.trim().toLowerCase()
        return searchValue === '' ? true : email.toLowerCase().endsWith(searchValue)
      }
      if (operator === 'exists') {
        return email !== '' && email !== null && email !== undefined
      }
      if (operator === 'doesNotExist') {
        return email === '' || email === null || email === undefined
      }
      return false

    // Language
    case 'language':
      const language = (contact.language || '').trim()
      if (operator === 'equals') {
        // Handle both string and array values (for backwards compatibility)
        const filterValue = typeof value === 'string' 
          ? value.trim() 
          : Array.isArray(value) && value.length > 0 && typeof value[0] === 'string'
          ? value[0].trim()
          : ''
        if (filterValue === '') return language === ''
        return language === filterValue
      }
      if (operator === 'notEquals') {
        // Handle both string and array values (for backwards compatibility)
        const filterValue = typeof value === 'string' 
          ? value.trim() 
          : Array.isArray(value) && value.length > 0 && typeof value[0] === 'string'
          ? value[0].trim()
          : ''
        if (filterValue === '') return language !== ''
        return language !== filterValue
      }
      if (operator === 'in' && Array.isArray(value) && value.length > 0) {
        return value.some(v => typeof v === 'string' && language === v.trim())
      }
      if (operator === 'notIn' && Array.isArray(value) && value.length > 0) {
        return !value.some(v => typeof v === 'string' && language === v.trim())
      }
      if (operator === 'hasAnyOf' && Array.isArray(value) && value.length > 0) {
        return value.some(v => typeof v === 'string' && language === v.trim())
      }
      if (operator === 'isEmpty') {
        return language === ''
      }
      if (operator === 'isNotEmpty') {
        return language !== ''
      }
      return false

    // Bot Status
    case 'botStatus':
      const botStatus = (contact.botStatus || '').trim()
      if (operator === 'equals') {
        // Handle both string and array values (for backwards compatibility)
        const filterValue = typeof value === 'string' 
          ? value.trim() 
          : Array.isArray(value) && value.length > 0 && typeof value[0] === 'string'
          ? value[0].trim()
          : ''
        if (filterValue === '') return botStatus === ''
        return botStatus === filterValue
      }
      if (operator === 'notEquals') {
        // Handle both string and array values (for backwards compatibility)
        const filterValue = typeof value === 'string' 
          ? value.trim() 
          : Array.isArray(value) && value.length > 0 && typeof value[0] === 'string'
          ? value[0].trim()
          : ''
        if (filterValue === '') return botStatus !== ''
        return botStatus !== filterValue
      }
      if (operator === 'in' && Array.isArray(value) && value.length > 0) {
        return value.some(v => typeof v === 'string' && botStatus === v.trim())
      }
      if (operator === 'notIn' && Array.isArray(value) && value.length > 0) {
        return !value.some(v => typeof v === 'string' && botStatus === v.trim())
      }
      if (operator === 'hasAnyOf' && Array.isArray(value) && value.length > 0) {
        return value.some(v => typeof v === 'string' && botStatus === v.trim())
      }
      if (operator === 'isEmpty') {
        return botStatus === ''
      }
      if (operator === 'isNotEmpty') {
        return botStatus !== ''
      }
      return false

    // Assignee
    case 'assignee':
      const assignee = (contact.assignee || '').trim()
      if (operator === 'equals') {
        // Handle both string and array values (for backwards compatibility)
        const filterValue = typeof value === 'string' 
          ? value.trim() 
          : Array.isArray(value) && value.length > 0 && typeof value[0] === 'string'
          ? value[0].trim()
          : ''
        if (filterValue === '') return assignee === '' || assignee === null || assignee === undefined
        return assignee === filterValue
      }
      if (operator === 'notEquals') {
        // Handle both string and array values (for backwards compatibility)
        const filterValue = typeof value === 'string' 
          ? value.trim() 
          : Array.isArray(value) && value.length > 0 && typeof value[0] === 'string'
          ? value[0].trim()
          : ''
        if (filterValue === '') return assignee !== '' && assignee !== null && assignee !== undefined
        return assignee !== filterValue
      }
      if (operator === 'in' && Array.isArray(value) && value.length > 0) {
        return value.some(v => typeof v === 'string' && assignee === v.trim())
      }
      if (operator === 'notIn' && Array.isArray(value) && value.length > 0) {
        return !value.some(v => typeof v === 'string' && assignee === v.trim())
      }
      if (operator === 'hasAnyOf' && Array.isArray(value) && value.length > 0) {
        return value.some(v => typeof v === 'string' && assignee === v.trim())
      }
      if (operator === 'isEmpty') {
        return assignee === '' || assignee === null || assignee === undefined
      }
      if (operator === 'isNotEmpty') {
        return assignee !== '' && assignee !== null && assignee !== undefined
      }
      return false

    // Last Interacted Channel
    case 'lastInteractedChannel':
      // Normalize channel values for case-insensitive comparison
      const lastInteractedChannel = contact.lastInteractedChannel ? contact.lastInteractedChannel.toLowerCase().trim() : null
      if (operator === 'equals' && typeof value === 'string') {
        return lastInteractedChannel === value.toLowerCase().trim()
      }
      if (operator === 'notEquals' && typeof value === 'string') {
        return lastInteractedChannel !== value.toLowerCase().trim()
      }
      if (operator === 'exists') {
        return contact.lastInteractedChannel !== null && contact.lastInteractedChannel !== undefined && contact.lastInteractedChannel.trim() !== ''
      }
      if (operator === 'doesNotExist') {
        return contact.lastInteractedChannel === null || contact.lastInteractedChannel === undefined || contact.lastInteractedChannel.trim() === ''
      }
      return false

    // Created At
    case 'createdAt':
      if (!contact.createdAt) {
        return operator === 'doesNotExist' || operator === 'isEmpty'
      }
      const createdAt = contact.createdAt
      if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
        return operator === 'doesNotExist' || operator === 'isEmpty'
      }
      if (operator === 'exists') {
        return true
      }
      if (operator === 'doesNotExist') {
        return false
      }
      if (operator === 'isTimestampAfter' && typeof value === 'string') {
        const filterDate = new Date(value)
        if (isNaN(filterDate.getTime())) return false
        return createdAt > filterDate
      }
      if (operator === 'isTimestampBefore' && typeof value === 'string') {
        const filterDate = new Date(value)
        if (isNaN(filterDate.getTime())) return false
        return createdAt < filterDate
      }
      if (operator === 'isTimestampBetween' && typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
        const fromDate = new Date(value.from)
        const toDate = new Date(value.to)
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return false
        if (fromDate > toDate) return false // Invalid range
        return createdAt >= fromDate && createdAt <= toDate
      }
      return false

    // Last Interaction Time
    case 'lastInteractionTime':
      if (!contact.lastInteractionTime) {
        return operator === 'doesNotExist' || operator === 'isEmpty'
      }
      const lastInteractionTime = contact.lastInteractionTime
      if (!(lastInteractionTime instanceof Date) || isNaN(lastInteractionTime.getTime())) {
        return operator === 'doesNotExist' || operator === 'isEmpty'
      }
      if (operator === 'exists') {
        return true
      }
      if (operator === 'doesNotExist') {
        return false
      }
      if (operator === 'isTimestampAfter' && typeof value === 'string') {
        const filterDate = new Date(value)
        if (isNaN(filterDate.getTime())) return false
        return lastInteractionTime > filterDate
      }
      if (operator === 'isTimestampBefore' && typeof value === 'string') {
        const filterDate = new Date(value)
        if (isNaN(filterDate.getTime())) return false
        return lastInteractionTime < filterDate
      }
      if (operator === 'isTimestampBetween' && typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
        const fromDate = new Date(value.from)
        const toDate = new Date(value.to)
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return false
        if (fromDate > toDate) return false // Invalid range
        return lastInteractionTime >= fromDate && lastInteractionTime <= toDate
      }
      return false

    // Conversation Opened Time
    case 'conversationOpenedTime':
      if (!contact.conversationOpenedTime) {
        return operator === 'doesNotExist' || operator === 'isEmpty'
      }
      const conversationOpenedTime = contact.conversationOpenedTime
      if (!(conversationOpenedTime instanceof Date) || isNaN(conversationOpenedTime.getTime())) {
        return operator === 'doesNotExist' || operator === 'isEmpty'
      }
      if (operator === 'exists') {
        return true
      }
      if (operator === 'doesNotExist') {
        return false
      }
      if (operator === 'isTimestampAfter' && typeof value === 'string') {
        const filterDate = new Date(value)
        if (isNaN(filterDate.getTime())) return false
        return conversationOpenedTime > filterDate
      }
      if (operator === 'isTimestampBefore' && typeof value === 'string') {
        const filterDate = new Date(value)
        if (isNaN(filterDate.getTime())) return false
        return conversationOpenedTime < filterDate
      }
      if (operator === 'isTimestampBetween' && typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
        const fromDate = new Date(value.from)
        const toDate = new Date(value.to)
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return false
        if (fromDate > toDate) return false // Invalid range
        return conversationOpenedTime >= fromDate && conversationOpenedTime <= toDate
      }
      return false

    // Time Since Last Incoming Message (using lastInteractionTime as proxy)
    case 'timeSinceLastIncomingMessage':
      if (!contact.lastInteractionTime) {
        return operator === 'doesNotExist' || operator === 'isEmpty'
      }
      const lastMessageTime = contact.lastInteractionTime
      if (!(lastMessageTime instanceof Date) || isNaN(lastMessageTime.getTime())) {
        return operator === 'doesNotExist' || operator === 'isEmpty'
      }
      if (operator === 'exists') {
        return true
      }
      if (operator === 'doesNotExist') {
        return false
      }
      if (operator === 'isGreaterThanTime' && typeof value === 'number' && value >= 0) {
        const daysSince = Math.floor((Date.now() - lastMessageTime.getTime()) / (1000 * 60 * 60 * 24))
        return daysSince > value
      }
      if (operator === 'isLessThanTime' && typeof value === 'number' && value >= 0) {
        const daysSince = Math.floor((Date.now() - lastMessageTime.getTime()) / (1000 * 60 * 60 * 24))
        return daysSince < value
      }
      if (operator === 'isBetweenTime' && typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
        const daysSince = Math.floor((Date.now() - lastMessageTime.getTime()) / (1000 * 60 * 60 * 24))
        const fromDays = typeof value.from === 'number' ? value.from : 0
        const toDays = typeof value.to === 'number' ? value.to : 0
        if (fromDays > toDays) return false // Invalid range
        return daysSince >= fromDays && daysSince <= toDays
      }
      if (operator === 'isTimestampAfter' && typeof value === 'string') {
        const filterDate = new Date(value)
        if (isNaN(filterDate.getTime())) return false
        return lastMessageTime > filterDate
      }
      if (operator === 'isTimestampBefore' && typeof value === 'string') {
        const filterDate = new Date(value)
        if (isNaN(filterDate.getTime())) return false
        return lastMessageTime < filterDate
      }
      if (operator === 'isTimestampBetween' && typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
        const fromDate = new Date(value.from)
        const toDate = new Date(value.to)
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return false
        if (fromDate > toDate) return false // Invalid range
        return lastMessageTime >= fromDate && lastMessageTime <= toDate
      }
      return false

    default:
      return false
  }
}

