import * as React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { queryClient } from "@/lib/query-client"

export type UserType = "newUser" | "existingUser"

interface User {
  id?: string
  email: string
  name?: string
  userType: UserType
  onboardingCompleted?: boolean
  onboardingData?: any
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, name?: string, userType?: UserType, redirectTo?: string, userId?: string, onboardingCompleted?: boolean) => void
  logout: () => void
  isNewUser: () => boolean
  isExistingUser: () => boolean
  updateOnboardingStatus: (completed: boolean, skipDatabaseUpdate?: boolean) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

import { getUserTypeFromEmail } from "@/lib/user-utils"

// Helper function to determine user type based on email
function determineUserType(email: string): UserType {
  return getUserTypeFromEmail(email)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const navigate = useNavigate()
  const previousUserIdRef = useRef<string | undefined>(undefined)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Check for existing authentication on mount
    const checkAuthStatus = async () => {
      try {
        const isAuthenticated = localStorage.getItem("isAuthenticated")
        const userEmail = localStorage.getItem("userEmail")
        const userName = localStorage.getItem("userName")
        const userType = localStorage.getItem("userType") as UserType
        const userId = localStorage.getItem("userId")
        const onboardingCompleted = localStorage.getItem("onboardingCompleted")

        if (isAuthenticated === "true" && userEmail) {
          // Verify user exists in database if we have a userId
          if (userId) {
            try {
              const { findUserByEmail } = await import('@/lib/supabase/users')
              const dbUser = await findUserByEmail(userEmail)
              
              if (!dbUser) {
                // User doesn't exist in database, clear auth state
                console.log("User not found in database, clearing auth state")
                localStorage.removeItem("isAuthenticated")
                localStorage.removeItem("userEmail")
                localStorage.removeItem("userName")
                localStorage.removeItem("userType")
                localStorage.removeItem("userId")
                localStorage.removeItem("onboardingCompleted")
                setUser(null)
                setIsLoading(false)
                return
              }
              
              // Use database user data for onboarding status
              const validUserType = dbUser.onboarding_completed ? "existingUser" : "newUser"
              
              // Initialize previousUserIdRef on first load if not set
              if (previousUserIdRef.current === undefined) {
                previousUserIdRef.current = dbUser.id
              }
              
              // Check if userId has changed (account switch)
              const userIdChanged = previousUserIdRef.current !== dbUser.id
              
              // Clear cache only if userId changed (account switch) to prevent showing cached data from previous user
              if (userIdChanged) {
                queryClient.clear()
                console.log('Cleared React Query cache due to account switch')
              }
              
              // Update previous userId reference
              previousUserIdRef.current = dbUser.id
              
              setUser({
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.first_name && dbUser.last_name 
                  ? `${dbUser.first_name} ${dbUser.last_name}` 
                  : userName || undefined,
                userType: validUserType,
                onboardingCompleted: dbUser.onboarding_completed,
                onboardingData: dbUser.onboarding_data
              })
              
              // Save onboarding data to localStorage if available
              if (dbUser.onboarding_data) {
                localStorage.setItem(`onboarding-data-${dbUser.email}`, JSON.stringify(dbUser.onboarding_data))
              }
              
              // Sync localStorage with database state
              localStorage.setItem("onboardingCompleted", dbUser.onboarding_completed.toString())
              localStorage.setItem("userType", validUserType)
              
              // Sync connected channels from database
              if (dbUser.id) {
                try {
                  const { syncChannelsFromDatabase } = await import('@/lib/channel-utils')
                  await syncChannelsFromDatabase(dbUser.id)
                } catch (error) {
                  console.error('Failed to sync channels from database:', error)
                }
              }
            } catch (error) {
              console.error("Error verifying user in database:", error)
              // On error, clear auth state to be safe
              localStorage.removeItem("isAuthenticated")
              localStorage.removeItem("userEmail")
              localStorage.removeItem("userName")
              localStorage.removeItem("userType")
              localStorage.removeItem("userId")
              localStorage.removeItem("onboardingCompleted")
              setUser(null)
            }
          } else {
            // No userId, but has email - might be old cached state
            // Initialize previousUserIdRef on first load if not set
            if (previousUserIdRef.current === undefined) {
              previousUserIdRef.current = userId || undefined
            }
            
            // Check if userId has changed (account switch)
            const userIdChanged = previousUserIdRef.current !== (userId || undefined)
            
            // Clear cache only if userId changed (account switch)
            if (userIdChanged) {
              queryClient.clear()
              console.log('Cleared React Query cache due to account switch')
            }
            
            // Update previous userId reference
            previousUserIdRef.current = userId || undefined
            
            // Default to existingUser if not specified
            const validUserType = userType === "newUser" || userType === "existingUser" 
              ? userType 
              : determineUserType(userEmail)
            
            setUser({
              id: userId || undefined,
              email: userEmail,
              name: userName || undefined,
              userType: validUserType,
              onboardingCompleted: onboardingCompleted === "true"
            })
          }
        } else {
          // Clear any partial auth data if invalid
          localStorage.removeItem("isAuthenticated")
          localStorage.removeItem("userEmail")
          localStorage.removeItem("userName")
          localStorage.removeItem("userType")
          localStorage.removeItem("userId")
          localStorage.removeItem("onboardingCompleted")
          
          // Clear cache when user is not authenticated
          queryClient.clear()
          previousUserIdRef.current = undefined
          setUser(null)
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Listen for storage changes (logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "isAuthenticated" && e.newValue === null) {
        // User logged out in another tab
        queryClient.clear()
        previousUserIdRef.current = undefined
        setUser(null)
        navigate("/login")
      } else if (e.key === "isAuthenticated" && e.newValue === "true") {
        // User logged in another tab, refresh auth state
        checkAuthStatus()
      }
    }

    // Small delay to prevent hydration issues, then check auth
    const timeoutId = setTimeout(() => {
      checkAuthStatus()
    }, 100)
    
    // Add storage event listener for cross-tab auth sync
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange)
    }
    
    return () => {
      clearTimeout(timeoutId)
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageChange)
      }
    }
  }, [navigate, isClient])

  const login = async (email: string, name?: string, userType?: UserType, redirectTo?: string, userId?: string, onboardingCompleted?: boolean) => {
    try {
      // Initialize previousUserIdRef on first login if not set
      if (previousUserIdRef.current === undefined) {
        previousUserIdRef.current = userId
      }
      
      // Check if userId has changed (account switch)
      const userIdChanged = previousUserIdRef.current !== userId
      
      // Clear cache only if userId changed (account switch) to prevent showing cached data from previous user
      if (userIdChanged) {
        queryClient.clear()
        console.log('Cleared React Query cache due to account switch')
      }
      
      // Update previous userId reference
      previousUserIdRef.current = userId
      
      // Determine user type if not provided
      const determinedUserType = userType || determineUserType(email)

      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", email)
      localStorage.setItem("userType", determinedUserType)
      if (name) {
        localStorage.setItem("userName", name)
      }
      if (userId) {
        localStorage.setItem("userId", userId)
      }
      if (onboardingCompleted !== undefined) {
        localStorage.setItem("onboardingCompleted", onboardingCompleted.toString())
      }

      setUser({ 
        id: userId,
        email, 
        name,
        userType: determinedUserType,
        onboardingCompleted: onboardingCompleted
      })
      
      // Sync connected channels from database on login
      if (userId) {
        // Don't await - sync in background to not block login
        import('@/lib/channel-utils').then(({ syncChannelsFromDatabase }) => {
          syncChannelsFromDatabase(userId).catch(error => {
            console.error('Failed to sync channels from database on login:', error)
          })
        })
      }
      
      // Determine redirect destination
      let destination = redirectTo
      
      // If no specific redirect, determine based on onboarding status
      if (!destination) {
        // Default to onboarding if onboardingCompleted is false, null, or undefined
        // Only redirect to getting-started if explicitly true
        if (onboardingCompleted === true) {
          destination = "/getting-started"
        } else {
          destination = "/onboarding"
        }
      }
      
      navigate(destination, { replace: true })
    } catch (error) {
      console.error("Error during login:", error)
      // Handle login error if needed
    }
  }

  const logout = () => {
    // Clear React Query cache on logout to prevent showing cached data
    queryClient.clear()
    previousUserIdRef.current = undefined
    
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    localStorage.removeItem("userType")
    localStorage.removeItem("userId")
    localStorage.removeItem("onboardingCompleted")
    setUser(null)
    navigate("/login")
  }

  const updateOnboardingStatus = async (completed: boolean, skipDatabaseUpdate = false) => {
    if (!user?.id) {
      console.warn("Cannot update onboarding status: user ID not available")
      return
    }
    
    try {
      // Only update database if not already updated and skipDatabaseUpdate is false
      // This prevents duplicate updates when called after markOnboardingComplete
      if (!skipDatabaseUpdate && user.onboardingCompleted !== completed) {
        const { updateUserOnboarding } = await import('@/lib/supabase/users')
        console.log("Updating onboarding status in database for user:", user.id)
        await updateUserOnboarding(user.id, completed)
        console.log("Onboarding status updated in database")
      } else if (skipDatabaseUpdate) {
        console.log("Skipping database update (already updated), just updating React state")
      }
      
      // Always update local storage and React state
      localStorage.setItem("onboardingCompleted", completed.toString())
      
      // Update user type based on onboarding status
      if (completed) {
        localStorage.setItem("userType", "existingUser")
        // Update user state atomically to ensure both fields update together
        setUser(prev => prev ? { 
          ...prev, 
          onboardingCompleted: completed,
          userType: "existingUser"
        } : null)
      } else {
        setUser(prev => prev ? { 
          ...prev, 
          onboardingCompleted: completed
        } : null)
      }
    } catch (error: any) {
      console.error("Error updating onboarding status in auth context:", error)
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      })
      throw error
    }
  }
  
  // Helper methods to check user type
  const isNewUser = () => {
    return user?.userType === "newUser"
  }
  
  const isExistingUser = () => {
    return user?.userType === "existingUser"
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    isNewUser,
    isExistingUser,
    updateOnboardingStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
