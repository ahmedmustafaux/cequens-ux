/**
 * Utility functions for managing active channels
 */

import {
  addUserConnectedChannel,
  removeUserConnectedChannel,
  updateUserConnectedChannels,
  getUserConnectedChannels
} from './supabase/users'

const STORAGE_KEY_ACTIVE_CHANNELS = 'cequens-active-channels'
const STORAGE_KEY_WHATSAPP_CONFIG = 'cequens-whatsapp-config'
const STORAGE_KEY_SMS_CONFIG = 'cequens-sms-config'
const STORAGE_KEY_EMAIL_CONFIG = 'cequens-email-config'
const STORAGE_KEY_INSTAGRAM_CONFIG = 'cequens-instagram-config'
const STORAGE_KEY_MESSENGER_CONFIG = 'cequens-messenger-config'

/**
 * Get active channels from localStorage
 * @returns Array of active channel IDs
 */
export function getActiveChannels(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_CHANNELS)
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Failed to load active channels:', error)
    return []
  }
}

/**
 * Set active channels in localStorage
 * @param channelIds Array of channel IDs to mark as active
 */
export function setActiveChannels(channelIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_CHANNELS, JSON.stringify(channelIds))
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('activeChannelsChanged', {
      detail: { channelIds }
    }))
  } catch (error) {
    console.error('Failed to save active channels:', error)
  }
}

/**
 * Add a channel to active channels (localStorage only)
 * @param channelId Channel ID to add
 */
export function addActiveChannel(channelId: string): void {
  const current = getActiveChannels()
  if (!current.includes(channelId)) {
    setActiveChannels([...current, channelId])
  }
}

/**
 * Remove a channel from active channels (localStorage only)
 * @param channelId Channel ID to remove
 */
export function removeActiveChannel(channelId: string): void {
  const current = getActiveChannels()
  setActiveChannels(current.filter(id => id !== channelId))
}

/**
 * Add a channel to active channels and sync with database
 * @param channelId Channel ID to add
 * @param userId User ID to update in database
 */
export async function addActiveChannelWithSync(channelId: string, userId: string): Promise<void> {
  try {
    // Update localStorage first for immediate UI feedback
    addActiveChannel(channelId)

    // Sync with database
    if (userId) {
      await addUserConnectedChannel(userId, channelId)
    }
  } catch (error) {
    console.error('Failed to add channel to database:', error)
    // On error, we still keep localStorage updated for offline support
  }
}

/**
 * Remove a channel from active channels and sync with database
 * @param channelId Channel ID to remove
 * @param userId User ID to update in database
 */
export async function removeActiveChannelWithSync(channelId: string, userId: string): Promise<void> {
  try {
    // Update localStorage first for immediate UI feedback
    removeActiveChannel(channelId)

    // Sync with database
    if (userId) {
      await removeUserConnectedChannel(userId, channelId)
    }
  } catch (error) {
    console.error('Failed to remove channel from database:', error)
    // On error, we still keep localStorage updated for offline support
  }
}

/**
 * Load channels from database and sync with localStorage
 * @param userId User ID to load channels for
 */
export async function syncChannelsFromDatabase(userId: string): Promise<void> {
  try {
    if (!userId) return

    const dbChannels = await getUserConnectedChannels(userId)
    const localChannels = getActiveChannels()

    // Merge: use database as source of truth, but keep any local channels that aren't in DB
    // This handles the case where channels were added offline
    const mergedChannels = [...new Set([...dbChannels, ...localChannels])]

    // Update localStorage with merged channels
    setActiveChannels(mergedChannels)

    // If there are local channels not in DB, sync them to DB
    if (localChannels.length > 0) {
      const channelsToSync = localChannels.filter(ch => !dbChannels.includes(ch))
      if (channelsToSync.length > 0) {
        await updateUserConnectedChannels(userId, mergedChannels)
      }
    }
  } catch (error) {
    console.error('Failed to sync channels from database:', error)
    // On error, continue with localStorage channels
  }
}

/**
 * Check if a channel is active
 * @param channelId Channel ID to check
 * @returns boolean indicating if channel is active
 */
export function isChannelActive(channelId: string): boolean {
  return getActiveChannels().includes(channelId)
}

/**
 * Check if any channel is active
 * @returns boolean indicating if any channel is active
 */
export function hasActiveChannels(): boolean {
  return getActiveChannels().length > 0
}

// WhatsApp configuration storage

export interface WhatsAppConfig {
  formData: {
    businessAccountId: string
    accessToken: string
    apiToken: string
    webhookUrl: string
    webhookVerifyToken: string
    about: string
  }
  phoneNumbers: Array<{
    id: string
    phoneNumber: string
    phoneNumberId: string
    displayName: string
    countryISO: string
    qualityRating: number
    messageLimit: number
    status: "verified" | "pending" | "restricted"
    messagesSent24h: number
    messagesReceived24h: number
    deliveryRate: number
  }>
}

/**
 * Save WhatsApp configuration to localStorage
 * @param config WhatsApp configuration object
 */
export function saveWhatsAppConfig(config: WhatsAppConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_WHATSAPP_CONFIG, JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save WhatsApp config:', error)
  }
}

/**
 * Load WhatsApp configuration from localStorage
 * @returns WhatsApp configuration or null if not found
 */
export function loadWhatsAppConfig(): WhatsAppConfig | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_WHATSAPP_CONFIG)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('Failed to load WhatsApp config:', error)
    return null
  }
}

/**
 * Clear WhatsApp configuration from localStorage
 */
export function clearWhatsAppConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_WHATSAPP_CONFIG)
  } catch (error) {
    console.error('Failed to clear WhatsApp config:', error)
  }
}

// SMS configuration storage
export interface SMSConfig {
  formData: {
    businessName: string
    apiKey: string
    apiSecret: string
    webhookUrl: string
  }
  senderIds: Array<{
    id: string
    senderId: string
    status: "active" | "pending" | "rejected"
    throughput: number
    type: "transactional" | "marketing"
  }>
}

/**
 * Save SMS configuration to localStorage
 * @param config SMS configuration object
 */
export function saveSMSConfig(config: SMSConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_SMS_CONFIG, JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save SMS config:', error)
  }
}

/**
 * Load SMS configuration from localStorage
 * @returns SMS configuration or null if not found
 */
export function loadSMSConfig(): SMSConfig | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SMS_CONFIG)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('Failed to load SMS config:', error)
    return null
  }
}

/**
 * Clear SMS configuration from localStorage
 */
export function clearSMSConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SMS_CONFIG)
  } catch (error) {
    console.error('Failed to clear SMS config:', error)
  }
}

// Email configuration storage
export interface EmailConfig {
  formData: {
    domain: string
    apiKey: string
    webhookUrl: string
  }
  domains: Array<{
    id: string
    domain: string
    status: "verified" | "pending" | "failed"
    spf: boolean
    dkim: boolean
    dmarc: boolean
  }>
}

/**
 * Save Email configuration to localStorage
 * @param config Email configuration object
 */
export function saveEmailConfig(config: EmailConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_EMAIL_CONFIG, JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save Email config:', error)
  }
}

/**
 * Load Email configuration from localStorage
 * @returns Email configuration or null if not found
 */
export function loadEmailConfig(): EmailConfig | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_EMAIL_CONFIG)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('Failed to load Email config:', error)
    return null
  }
}

/**
 * Clear Email configuration from localStorage
 */
export function clearEmailConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_EMAIL_CONFIG)
  } catch (error) {
    console.error('Failed to clear Email config:', error)
  }
}

// Instagram configuration storage
export interface InstagramConfig {
  formData: {
    pageId: string
    accessToken: string
    apiToken: string
    about: string
  }
  pages: Array<{
    id: string
    name: string
    username: string
    followers: number
    status: "active" | "pending"
    logo?: string
  }>
}

/**
 * Save Instagram configuration to localStorage
 * @param config Instagram configuration object
 */
export function saveInstagramConfig(config: InstagramConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_INSTAGRAM_CONFIG, JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save Instagram config:', error)
  }
}

/**
 * Load Instagram configuration from localStorage
 * @returns Instagram configuration or null if not found
 */
export function loadInstagramConfig(): InstagramConfig | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_INSTAGRAM_CONFIG)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('Failed to load Instagram config:', error)
    return null
  }
}

/**
 * Clear Instagram configuration from localStorage
 */
export function clearInstagramConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_INSTAGRAM_CONFIG)
  } catch (error) {
    console.error('Failed to clear Instagram config:', error)
  }
}

// Messenger configuration storage
export interface MessengerConfig {
  formData: {
    pageId: string
    accessToken: string
    apiToken: string
    about: string
  }
  pages: Array<{
    id: string
    name: string
    status: "active" | "pending"
    logo?: string
  }>
}

/**
 * Save Messenger configuration to localStorage
 * @param config Messenger configuration object
 */
export function saveMessengerConfig(config: MessengerConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_MESSENGER_CONFIG, JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save Messenger config:', error)
  }
}

/**
 * Load Messenger configuration from localStorage
 * @returns Messenger configuration or null if not found
 */
export function loadMessengerConfig(): MessengerConfig | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MESSENGER_CONFIG)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('Failed to load Messenger config:', error)
    return null
  }
}

/**
 * Clear Messenger configuration from localStorage
 */
export function clearMessengerConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_MESSENGER_CONFIG)
  } catch (error) {
    console.error('Failed to clear Messenger config:', error)
  }
}
