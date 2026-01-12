import { supabase } from '../supabase'

export type User = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  company_name: string | null
  onboarding_completed: boolean
  onboarding_data?: any
  connected_channels?: string[]
  created_at: string
  updated_at: string
}

export type CreateUserInput = {
  email: string
  password_hash: string
  first_name?: string
  last_name?: string
  company_name?: string
}

// Simple password hashing using SHA-256
// Note: In production, consider using server-side password hashing (bcrypt) 
// or Supabase Auth for better security
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  const password_hash = await hashPassword(input.password_hash) // input.password_hash is actually the plain password
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: input.email,
      password_hash: password_hash,
      first_name: input.first_name || null,
      last_name: input.last_name || null,
      company_name: input.company_name || null,
      onboarding_completed: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    throw error
  }

  // Don't return password_hash
  const { password_hash: _, ...userWithoutPassword } = data
  return userWithoutPassword as User
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  // Note: onboarding_data and connected_channels columns must exist in database. If you get column errors, run the migrations:
  // ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_data JSONB;
  // ALTER TABLE users ADD COLUMN IF NOT EXISTS connected_channels TEXT[] DEFAULT '{}';
  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, company_name, onboarding_completed, onboarding_data, connected_channels, created_at, updated_at')
    .eq('email', email)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    // If column doesn't exist, provide helpful error message
    if (error.code === '42703' && error.message?.includes('onboarding_data')) {
      console.error('onboarding_data column does not exist. Please run: ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_data JSONB;')
      throw new Error('Database schema needs update. Please add onboarding_data column to users table.')
    }
    console.error('Error finding user:', error)
    throw error
  }

  return data as User
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  // First get the user with password hash
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) {
    return null
  }

  // Verify password
  const isValid = await verifyPassword(password, data.password_hash)
  if (!isValid) {
    return null
  }

  // Return user without password_hash
  const { password_hash: _, ...userWithoutPassword } = data
  return userWithoutPassword as User
}

/**
 * Update user onboarding status and optionally onboarding data
 */
export async function updateUserOnboarding(
  userId: string, 
  completed: boolean, 
  onboardingData?: any
): Promise<User> {
  const updateData: any = { onboarding_completed: completed }
  if (onboardingData !== undefined) {
    updateData.onboarding_data = onboardingData
  }

  console.log('Attempting to update user onboarding:', { userId, updateData })

  // Select fields - include onboarding_data only if we're updating it
  const selectFields = 'id, email, first_name, last_name, company_name, onboarding_completed, onboarding_data, connected_channels, created_at, updated_at'

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select(selectFields)

  if (error) {
    console.error('Error updating user onboarding:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    })
    throw error
  }

  // Handle case where no rows were updated (user not found or RLS blocking)
  if (!data || data.length === 0) {
    const errorMsg = 'No rows updated - user not found or update blocked by RLS policies'
    console.error(errorMsg, { userId })
    throw new Error(errorMsg)
  }

  console.log('User onboarding updated successfully:', data[0])
  return data[0] as User
}

/**
 * Check if email already exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await findUserByEmail(email)
  return user !== null
}

/**
 * Get connected channels for a user
 */
export async function getUserConnectedChannels(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('users')
    .select('connected_channels')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching connected channels:', error)
    throw error
  }

  return data?.connected_channels || []
}

/**
 * Update connected channels for a user
 */
export async function updateUserConnectedChannels(
  userId: string,
  channels: string[]
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({ connected_channels: channels })
    .eq('id', userId)
    .select('id, email, first_name, last_name, company_name, onboarding_completed, onboarding_data, connected_channels, created_at, updated_at')
    .single()

  if (error) {
    console.error('Error updating connected channels:', error)
    throw error
  }

  return data as User
}

/**
 * Add a channel to user's connected channels
 */
export async function addUserConnectedChannel(
  userId: string,
  channelId: string
): Promise<User> {
  const currentChannels = await getUserConnectedChannels(userId)
  
  if (!currentChannels.includes(channelId)) {
    return await updateUserConnectedChannels(userId, [...currentChannels, channelId])
  }

  // Return current user if channel already exists
  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, company_name, onboarding_completed, onboarding_data, connected_channels, created_at, updated_at')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    throw error
  }

  return data as User
}

/**
 * Remove a channel from user's connected channels
 */
export async function removeUserConnectedChannel(
  userId: string,
  channelId: string
): Promise<User> {
  const currentChannels = await getUserConnectedChannels(userId)
  const updatedChannels = currentChannels.filter(id => id !== channelId)
  
  return await updateUserConnectedChannels(userId, updatedChannels)
}

/**
 * Check if a user has a specific channel connected
 */
export async function hasUserConnectedChannel(
  userId: string,
  channelId: string
): Promise<boolean> {
  const channels = await getUserConnectedChannels(userId)
  return channels.includes(channelId)
}

