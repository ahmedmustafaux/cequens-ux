import { supabase } from '../supabase'
import type { Notification } from './types'

/**
 * Fetch all notifications
 * @param userId - The ID of the user whose notifications to fetch
 */
export async function fetchNotifications(userId: string): Promise<Notification[]> {
  if (!userId) {
    throw new Error('userId is required to fetch notifications')
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }

  return data || []
}

/**
 * Fetch unread notifications
 * @param userId - The ID of the user whose notifications to fetch
 */
export async function fetchUnreadNotifications(userId: string): Promise<Notification[]> {
  if (!userId) {
    throw new Error('userId is required to fetch unread notifications')
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching unread notifications:', error)
    throw error
  }

  return data || []
}

/**
 * Create a new notification
 * @param userId - The ID of the user creating the notification
 * @param notification - The notification data to create
 */
export async function createNotification(userId: string, notification: Omit<Notification, 'id' | 'user_id' | 'created_at'>): Promise<Notification> {
  if (!userId) {
    throw new Error('userId is required to create notification')
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      ...notification,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    throw error
  }

  return data
}

/**
 * Mark a notification as read
 * @param userId - The ID of the user who owns the notification
 * @param id - The notification ID
 */
export async function markNotificationAsRead(userId: string, id: string): Promise<Notification> {
  if (!userId) {
    throw new Error('userId is required to mark notification as read')
  }

  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }

  return data
}

/**
 * Mark all notifications as read
 * @param userId - The ID of the user whose notifications to mark as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('userId is required to mark all notifications as read')
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

/**
 * Delete a notification
 * @param userId - The ID of the user who owns the notification
 * @param id - The notification ID
 */
export async function deleteNotification(userId: string, id: string): Promise<void> {
  if (!userId) {
    throw new Error('userId is required to delete notification')
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting notification:', error)
    throw error
  }
}

