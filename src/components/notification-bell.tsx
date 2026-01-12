import { Link } from "react-router-dom"
import { useState } from "react"
import { Bell, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotificationContext } from "@/contexts/notification-context"
// Props for the NotificationBell component
interface NotificationBellProps {
  // Optional props for customization
  className?: string
  showViewAllLink?: boolean
  viewAllLinkHref?: string
  isLoading?: boolean
}
export function NotificationBell({
  className = "",
  showViewAllLink = true,
  viewAllLinkHref = "/notifications",
  isLoading = false
}: NotificationBellProps) {
  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    )
  }
  // Use global notification context
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationContext()
  const [open, setOpen] = useState(false)
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <div className="w-2 h-2 bg-success rounded-full" />
      case 'error':
        return <div className="w-2 h-2 bg-destructive rounded-full" />
      case 'warning':
        return <div className="w-2 h-2 bg-warning rounded-full" />
      default:
        return <div className="w-2 h-2 bg-info rounded-full" />
    }
  }
  
  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`relative size-7 ${className}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className="text-base font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-6 px-2 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <DropdownMenuItem 
                  className={`p-2.5 cursor-pointer ${!notification.read ? 'bg-accent' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-2.5 w-full">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-destructive rounded-full"></div>
                              <span className="text-xs text-destructive font-medium">New</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
                {index < notifications.length - 1 && <DropdownMenuSeparator />}
              </div>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && showViewAllLink && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-center">
              <Link to={viewAllLinkHref} className="w-full">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
// Re-export the Notification type and useNotifications hook for backward compatibility
export type { Notification } from "@/contexts/notification-context"
export { useNotifications } from "@/contexts/notification-context"