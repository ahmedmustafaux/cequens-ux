import { ReactNode, useState, useEffect } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { PageWrapper } from "@/components/page-wrapper"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { NavigationProvider, useNavigationContext } from "@/hooks/use-navigation-context"
import { useAuth } from "@/hooks/use-auth"
import { NotificationProvider } from "@/contexts/notification-context"
import { CreateContactProvider, useCreateContactContext } from "@/contexts/create-contact-context"
import { CreateContactSheet } from "@/components/create-contact-sheet"

interface DashboardLayoutProps {
  children: ReactNode
}

// Inner component that can access the navigation context
function DashboardContent({ children }: { children: ReactNode }) {
  const { isLoading: isNavigating } = useNavigationContext()
  const { isOpen: isCreateSheetOpen, setOpen: setCreateSheetOpen } = useCreateContactContext()
  const [searchValue, setSearchValue] = useState("")
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false)

  const handleGlobalSearch = (value: string) => {
    setSearchValue(value)
  }

  const handleSearchFocus = () => {
    setIsActionCenterOpen(true)
  }

  const handleActionCenterClose = () => {
    setIsActionCenterOpen(false)
  }

  // Add keyboard shortcut for Command/Ctrl + K to open action center
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Command/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault() // Prevent default browser behavior
        setIsActionCenterOpen(true)
      }
    }

    // Add event listener
    window.addEventListener('keydown', handleKeyDown)

    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 14)",
          "--header-height-mobile": "calc(var(--spacing) * 18)",
          "--section-gap": "calc(var(--spacing) * 8)", // Add consistent gap between sections
        } as React.CSSProperties
      }
    >
      <div className="flex h-screen w-full m-0 p-0">
        <AppSidebar variant="inset" />
        <SidebarInset className="flex flex-1 flex-col bg-layout m-0">
          {/* Sticky Header */}
          <div className="sticky top-0 z-1 w-full bg-layout backdrop-blur-sm border-b border-border rounded-t-xl overflow-hidden">
            <PageHeader
              showBreadcrumbs={true}
              showSearch={true}
              searchPlaceholder="Find contacts, create campaigns, or discover actions"
              searchValue={searchValue}
              onSearchChange={handleGlobalSearch}
              onSearchFocus={handleSearchFocus}
              isActionCenterOpen={isActionCenterOpen}
              onActionCenterClose={handleActionCenterClose}
              isLoading={isNavigating}
            />
          </div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-6">
            <PageWrapper>
              {children}
            </PageWrapper>
          </div>
        </SidebarInset>
      </div>
      <CreateContactSheet open={isCreateSheetOpen} onOpenChange={setCreateSheetOpen} />
    </SidebarProvider>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing if not authenticated (redirect will happen in AuthProvider)
  if (!isAuthenticated) {
    return null
  }

  return (
    <NotificationProvider>
      <NavigationProvider>
        <CreateContactProvider>
          <div className="h-full w-full m-0 p-0">
            <DashboardContent>
              {children}
            </DashboardContent>
          </div>
        </CreateContactProvider>
      </NavigationProvider>
    </NotificationProvider>
  )
}
