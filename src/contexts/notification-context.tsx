import React, { createContext, useContext, useState, ReactNode } from "react"
import { toast } from "sonner"
// Notification type definition
export interface Notification {
  id: string
  title: string
  description: string
  type: 'success' | 'error' | 'info' | 'warning'
  category?: 'system' | 'campaign' | 'contact' | 'message' | 'billing'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  timestamp: Date
  read: boolean
}
// Context type definition
interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  removeNotification: (id: string) => void
}
// Create the context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)
// Provider component
interface NotificationProviderProps {
  children: ReactNode
  maxNotifications?: number
  checkInterval?: number
  notificationTemplates?: Array<{
    title: string
    description: string
    type: 'success' | 'error' | 'info' | 'warning'
  }>
}
export function NotificationProvider({
  children,
  maxNotifications = 10
}: NotificationProviderProps) {
  // Static notifications with different dates
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Campaign Created",
      description: "Your campaign 'Summer Sale' has been successfully created",
      type: "success",
      category: "campaign",
      priority: "medium",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false
    },
    {
      id: "2",
      title: "Message Delivery Failed",
      description: "Failed to deliver message to 5 recipients",
      type: "error",
      category: "message",
      priority: "high",
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      read: false
    },
    {
      id: "3",
      title: "New Contact Added",
      description: "John Doe has been added to your contact list",
      type: "info",
      category: "contact",
      priority: "low",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: true
    },
    {
      id: "4",
      title: "Campaign Completed",
      description: "Your campaign 'Welcome Series' has finished sending",
      type: "success",
      category: "campaign",
      priority: "low",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true
    },
    {
      id: "5",
      title: "Low Balance Alert",
      description: "Your account balance is running low",
      type: "warning",
      category: "billing",
      priority: "urgent",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: false
    },
    {
      id: "6",
      title: "Template Updated",
      description: "Your email template 'Welcome' has been updated",
      type: "info",
      category: "campaign",
      priority: "low",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      read: true
    },
    {
      id: "7",
      title: "System Maintenance Scheduled",
      description: "Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM",
      type: "warning",
      category: "system",
      priority: "medium",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: false
    },
    {
      id: "8",
      title: "New Message Received",
      description: "You have a new message from Ahmed Ali",
      type: "info",
      category: "message",
      priority: "medium",
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      read: false
    },
    {
      id: "9",
      title: "Payment Received",
      description: "Payment of $299.00 has been successfully processed",
      type: "success",
      category: "billing",
      priority: "low",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      read: true
    },
    {
      id: "10",
      title: "Contact Opted Out",
      description: "Sarah Johnson has opted out of marketing communications",
      type: "warning",
      category: "contact",
      priority: "medium",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      read: false
    }
  ])
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  // Context methods
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev.slice(0, maxNotifications - 1)])
    
    // Also show a toast notification using the global position from Toaster component
    const toastType = notification.type as "success" | "error" | "info" | "warning";
    toast[toastType](notification.title, {
      description: notification.description
    });
  }
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }
  
  const clearAll = () => {
    setNotifications([])
  }
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }
  
  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification
  }
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
// Custom hook to use the notification context
export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}
// Legacy hook for backward compatibility
export function useNotifications() {
  const context = useNotificationContext()
  return {
    notifications: context.notifications,
    unreadCount: context.unreadCount,
    addNotification: context.addNotification,
    markAsRead: context.markAsRead,
    markAllAsRead: context.markAllAsRead,
    clearAll: context.clearAll
  }
}
