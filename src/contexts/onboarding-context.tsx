import * as React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { updateUserOnboarding } from "@/lib/supabase/users"

interface OnboardingData {
  industry?: string
  channels?: string[]
  goals?: string[]
  teamSize?: string
  usage?: string[]
}

interface OnboardingContextType {
  hasCompletedOnboarding: boolean
  completeOnboarding: (data?: OnboardingData) => Promise<void>
  onboardingData: OnboardingData | null
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  
  // Check if user has completed onboarding
  useEffect(() => {
    if (user) {
      // Check onboarding status from user object (comes from database)
      // Also check localStorage as fallback
      const localCompleted = localStorage.getItem("onboardingCompleted") === "true"
      const userCompleted = user.onboardingCompleted !== undefined ? user.onboardingCompleted : localCompleted
      
      if (user.onboardingCompleted !== undefined) {
        setHasCompletedOnboarding(user.onboardingCompleted)
      } else if (localCompleted) {
        setHasCompletedOnboarding(true)
      } else if (user.userType === "newUser") {
        // Fallback: check localStorage for onboarding completion
        const completed = localStorage.getItem(`onboarding-completed-${user.email}`)
        setHasCompletedOnboarding(completed === "true")
        
        // Load onboarding data
        const savedData = localStorage.getItem(`onboarding-data-${user.email}`)
        if (savedData) {
          try {
            setOnboardingData(JSON.parse(savedData))
          } catch (e) {
            console.error("Failed to parse onboarding data", e)
          }
        }
        
        // Remove old "getting-started-seen" key if it exists (cleanup from previous version)
        localStorage.removeItem(`getting-started-seen-${user.email}`)
      } else {
        // Existing users don't need onboarding
        setHasCompletedOnboarding(true)
      }
    }
  }, [user])
  
  // Function to mark onboarding as completed
  const completeOnboarding = async (data?: OnboardingData) => {
    if (user && user.id) {
      try {
        // Update in database with onboarding data
        console.log("Updating onboarding in database for user:", user.id, "with data:", data)
        await updateUserOnboarding(user.id, true, data || null)
        console.log("Onboarding updated successfully in database")
        
        // Update local storage
        localStorage.setItem(`onboarding-completed-${user.email}`, "true")
        localStorage.setItem("onboardingCompleted", "true")
        localStorage.setItem("userType", "existingUser")
        setHasCompletedOnboarding(true)
        
        // Save onboarding data if provided
        if (data) {
          localStorage.setItem(`onboarding-data-${user.email}`, JSON.stringify(data))
          setOnboardingData(data)
        }
      } catch (error: any) {
        console.error("Error completing onboarding in context:", error)
        console.error("Error details:", {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint
        })
        throw error
      }
    } else if (user) {
      // Fallback to localStorage if no user ID
      localStorage.setItem(`onboarding-completed-${user.email}`, "true")
      setHasCompletedOnboarding(true)
      
      if (data) {
        localStorage.setItem(`onboarding-data-${user.email}`, JSON.stringify(data))
        setOnboardingData(data)
      }
    }
  }
  
  return (
    <OnboardingContext.Provider value={{ 
      hasCompletedOnboarding, 
      completeOnboarding,
      onboardingData
    }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}