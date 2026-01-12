import React, { createContext, useContext, useState, ReactNode } from "react"

// Context type definition
interface CreateContactContextType {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  setOpen: (open: boolean) => void
}

// Create the context
const CreateContactContext = createContext<CreateContactContextType | undefined>(undefined)

// Provider component
interface CreateContactProviderProps {
  children: ReactNode
}

export function CreateContactProvider({ children }: CreateContactProviderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(prev => !prev)
  const setOpen = (open: boolean) => setIsOpen(open)

  const value: CreateContactContextType = {
    isOpen,
    open,
    close,
    toggle,
    setOpen
  }

  return (
    <CreateContactContext.Provider value={value}>
      {children}
    </CreateContactContext.Provider>
  )
}

// Custom hook to use the create contact context
export function useCreateContactContext() {
  const context = useContext(CreateContactContext)
  if (context === undefined) {
    throw new Error('useCreateContactContext must be used within a CreateContactProvider')
  }
  return context
}
