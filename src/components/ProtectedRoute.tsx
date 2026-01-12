import { useAuth } from "@/hooks/use-auth"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Navigate, useLocation } from "react-router-dom"
import { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { hasCompletedOnboarding } = useOnboarding()
  const location = useLocation()
  const currentPath = location.pathname

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-border-primary"></div>
      </div>
    )
  }

  // If not authenticated, redirect to login with the current location
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If authenticated but new user hasn't completed onboarding and not already on onboarding page
  // Check onboardingCompleted from user object first, then fall back to context
  // Only check if we have a valid user object
  if (user) {
    // Consider onboarding needed if:
    // 1. onboardingCompleted is explicitly false
    // 2. onboardingCompleted is undefined/null (default to needing onboarding)
    // 3. userType is "newUser" and onboardingCompleted is not explicitly true
    const userNeedsOnboarding = 
      user.onboardingCompleted === false || 
      user.onboardingCompleted === undefined ||
      user.onboardingCompleted === null ||
      (user.userType === "newUser" && user.onboardingCompleted !== true)
    
    const needsOnboarding = 
      (userNeedsOnboarding || !hasCompletedOnboarding) && 
      currentPath !== "/onboarding"
    
    if (needsOnboarding) {
      return <Navigate to="/onboarding" replace />
    }
  }

  // If authenticated and onboarding completed (or not required), render the protected content
  return <>{children}</>
}

interface PublicRouteProps {
  children: ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-border-primary"></div>
      </div>
    )
  }

  // If authenticated and on login/signup, redirect to intended location or guide page
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/getting-started"
    return <Navigate to={from} replace />
  }

  // If not authenticated, render the public content (login/signup)
  return <>{children}</>
}