# User Type System Documentation

This document explains how to use the user type system to implement features for specific user types.

## Overview

The user type system allows you to distinguish between different types of users and show or hide features based on their user type. Currently, the system supports two user types:

- **newUser**: Users who have just signed up (e.g., ahmed@
- **existingUser**: Established users who should see all features (e.g., demo@

## How It Works

The user type is determined during login and stored in localStorage. The system provides hooks and components to check the user type and conditionally render content.

## Implementation Details

### User Type Definition

The user type is defined in `src/hooks/use-auth.tsx`:

```typescript
export type UserType = "newUser" | "existingUser"
```

### Authentication System

The authentication system has been extended to include user type information:

```typescript
interface User {
  email: string
  name?: string
  userType: UserType
}
```

The `login` function now accepts a `userType` parameter, and if not provided, it determines the user type based on the email address.

### Utility Functions

The `src/lib/user-utils.ts` file provides utility functions for working with user types:

```typescript
// Check if a feature should be shown to the current user
useFeatureAccess(allowedUserTypes: UserType[]): boolean

// Check if a feature is only for new users
useNewUserFeature(): boolean

// Check if a feature is only for existing users
useExistingUserFeature(): boolean

// Check if a user is a new user by email
isNewUserByEmail(email: string): boolean

// Check if a user is an existing user by email
isExistingUserByEmail(email: string): boolean

// Determine user type from email
getUserTypeFromEmail(email: string): UserType
```

### React Components

The `src/components/user-type-display.tsx` file provides React components for displaying content based on user type:

```typescript
// Display user type information
<UserTypeDisplay />

// Display content only for new users
<NewUserFeature>
  {/* Content only visible to new users */}
</NewUserFeature>

// Display content only for existing users
<ExistingUserFeature>
  {/* Content only visible to existing users */}
</ExistingUserFeature>
```

## Usage Examples

### Conditional Rendering Based on User Type

```tsx
import { useAuth } from "@/hooks/use-auth"

function MyComponent() {
  const { user } = useAuth()
  
  if (user?.userType === "newUser") {
    return <div>Content for new users</div>
  }
  
  return <div>Content for all users</div>
}
```

### Using Hooks

```tsx
import { useNewUserFeature, useExistingUserFeature } from "@/lib/user-utils"

function MyComponent() {
  const isNewUser = useNewUserFeature()
  const isExistingUser = useExistingUserFeature()
  
  return (
    <div>
      {isNewUser && <div>New user content</div>}
      {isExistingUser && <div>Existing user content</div>}
    </div>
  )
}
```

### Using Components

```tsx
import { NewUserFeature, ExistingUserFeature } from "@/components/user-type-display"

function MyComponent() {
  return (
    <div>
      <NewUserFeature>
        <h2>Welcome to your new account!</h2>
        <p>Here are some tips to get started...</p>
      </NewUserFeature>
      
      <ExistingUserFeature>
        <h2>Welcome back!</h2>
        <p>Here's what's new since your last visit...</p>
      </ExistingUserFeature>
    </div>
  )
}
```

## Test Users

The system includes test users for development and testing:

- **demo@cequens.com**: An existing user (admin and master/owner account)
- **ahmed@cequens.com**: A new user (admin who just signed up)

## Adding New User Types

To add a new user type:

1. Update the `UserType` type in `src/hooks/use-auth.tsx`
2. Update the `determineUserType` function in `src/hooks/use-auth.tsx`
3. Add utility functions in `src/lib/user-utils.ts`
4. Create components for the new user type if needed