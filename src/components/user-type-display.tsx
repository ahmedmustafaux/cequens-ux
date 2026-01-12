import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { useNewUserFeature, useExistingUserFeature } from "@/lib/user-utils"
import { Badge } from "@/components/ui/badge"

/**
 * Component to display user type information
 */
export function UserTypeDisplay() {
  const { user } = useAuth()
  const isNewUser = useNewUserFeature()
  const isExistingUser = useExistingUserFeature()
  
  if (!user) {
    return null
  }
  
  return (
    <div className="flex flex-col gap-2 p-4 border border-border rounded-lg">
      <div className="flex items-center gap-2">
        <span className="font-medium">User:</span>
        <span>{user.email}</span>
        {user.userType === "newUser" ? (
          <Badge variant="outline" className="bg-info/10 text-info-foreground border-border-info">
            New User
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-success/10 text-success-foreground border-border-success">
            Existing User
          </Badge>
        )}
      </div>
      
      {isNewUser && (
        <div className="mt-2 p-3 bg-info/10 text-info-foreground rounded border border-border-info">
          <p className="text-sm font-medium">New User Features</p>
          <p className="text-xs mt-1">You're seeing this because you're a new user.</p>
        </div>
      )}
      
      {isExistingUser && (
        <div className="mt-2 p-3 bg-success/10 text-success-foreground rounded border border-border-success">
          <p className="text-sm font-medium">Existing User Features</p>
          <p className="text-xs mt-1">You're seeing this because you're an existing user.</p>
        </div>
      )}
    </div>
  )
}

/**
 * Component to display content only for new users
 */
export function NewUserFeature({ children }: { children: React.ReactNode }) {
  const isNewUser = useNewUserFeature()
  
  if (!isNewUser) {
    return null
  }
  
  return (
    <div className="p-3 bg-info/10 text-info-foreground rounded border border-border-info">
      {children}
    </div>
  )
}

/**
 * Component to display content only for existing users
 */
export function ExistingUserFeature({ children }: { children: React.ReactNode }) {
  const isExistingUser = useExistingUserFeature()
  
  if (!isExistingUser) {
    return null
  }
  
  return (
    <div className="p-3 bg-success/10 text-success-foreground rounded border border-border-success">
      {children}
    </div>
  )
}