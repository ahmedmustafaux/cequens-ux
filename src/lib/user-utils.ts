import { useAuth, UserType } from "@/hooks/use-auth"

/**
 * Utility functions for working with user types
 */

/**
 * Hook to check if a feature should be shown to the current user
 * @param allowedUserTypes Array of user types that can access the feature
 * @returns boolean indicating if the feature should be shown
 */
export function useFeatureAccess(allowedUserTypes: UserType[]): boolean {
  const { user } = useAuth()
  
  if (!user) return false
  
  return allowedUserTypes.includes(user.userType)
}

/**
 * Hook to check if a feature is only for new users
 * @returns boolean indicating if the feature should be shown only to new users
 */
export function useNewUserFeature(): boolean {
  const { isNewUser } = useAuth()
  return isNewUser()
}

/**
 * Hook to check if a feature is only for existing users
 * @returns boolean indicating if the feature should be shown only to existing users
 */
export function useExistingUserFeature(): boolean {
  const { isExistingUser } = useAuth()
  return isExistingUser()
}

/**
 * Helper function to check if a user is a new user by email
 * @param email User email to check
 * @returns boolean indicating if the user is a new user
 */
export function isNewUserByEmail(email: string): boolean {
  return email.includes("ahmed@")
}

/**
 * Helper function to check if a user is an existing user by email
 * @param email User email to check
 * @returns boolean indicating if the user is an existing user
 */
export function isExistingUserByEmail(email: string): boolean {
  return email.includes("demo@")
}

/**
 * Helper function to determine user type from email
 * @param email User email
 * @returns UserType based on email pattern
 */
export function getUserTypeFromEmail(email: string): UserType {
  if (isNewUserByEmail(email)) {
    return "newUser"
  }
  return "existingUser"
}