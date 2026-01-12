import { Link, useLocation } from "react-router-dom"
import React, { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { motion } from "framer-motion"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { NotificationBell } from "@/components/notification-bell"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { ArrowLeft, Search } from "lucide-react"
import { 
  Field, 
  FieldContent 
} from "@/components/ui/field"
import { 
  InputGroup, 
  InputGroupInput, 
  InputGroupAddon 
} from "@/components/ui/input-group"
import { ActionCenter } from "@/components/action-center"
import { useIsMobile } from "@/hooks/use-mobile"

interface BreadcrumbItem {
  label: string
  href: string
  isCurrent: boolean
}

// Action button configuration
interface ActionButton {
  label: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  onClick?: () => void
  href?: string
  disabled?: boolean
  icon?: ReactNode
}

// Main page header props
interface PageHeaderProps {
  // Basic content
  title?: string
  description?: string
  
  // Navigation
  showBreadcrumbs?: boolean
  customBreadcrumbs?: BreadcrumbItem[]
  
  // Search functionality
  showSearch?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchFocus?: () => void
  isActionCenterOpen?: boolean
  onActionCenterClose?: () => void
  
  // Filters
  showFilters?: boolean
  filters?: ReactNode
  
  // Actions (1-3 buttons with priority)
  primaryAction?: ActionButton
  secondaryAction?: ActionButton
  tertiaryAction?: ActionButton
  
  // Custom actions (for complex scenarios)
  customActions?: ReactNode
  
  // Layout options
  className?: string
  isLoading?: boolean // Kept for backward compatibility but ignored
  
  // Responsive behavior
  stackOnMobile?: boolean
}

export function PageHeader({
  // Basic content
  title,
  description,
  
  // Navigation
  showBreadcrumbs = true,
  customBreadcrumbs,
  
  // Search
  showSearch = false,
  searchPlaceholder = "Find contacts, create campaigns, or discover actions",
  searchValue = "",
  onSearchChange,
  onSearchFocus,
  isActionCenterOpen = false,
  onActionCenterClose,
  
  // Filters
  showFilters = false,
  filters,
  
  // Actions
  primaryAction,
  secondaryAction,
  tertiaryAction,
  customActions,
  
  // Layout
  className = "",
  isLoading = false, // Ignored
  stackOnMobile = true,
}: PageHeaderProps) {
  const location = useLocation()
  const pathname = location.pathname
  const isMobile = useIsMobile()
  
  // Component-level skeleton state for breadcrumbs
  const [showBreadcrumbSkeleton, setShowBreadcrumbSkeleton] = React.useState(false)
  
  React.useEffect(() => {
    // No longer showing skeleton, just updating breadcrumbs
    setShowBreadcrumbSkeleton(false)
  }, [pathname])
  
  // Generate breadcrumbs based on pathname - memoized to prevent hydration issues
  const breadcrumbs = React.useMemo((): BreadcrumbItem[] => {
    if (customBreadcrumbs) return customBreadcrumbs
    
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []
    
    // For root path, show "Home"
    if (pathname === "/") {
      breadcrumbs.push({
        label: "Home",
        href: "/",
        isCurrent: true
      })
      return breadcrumbs
    }
    
    // Add segments
    let currentPath = ""
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1
      
      // Special handling for contact pages
      if (segments[0] === "contacts" && segments.length === 2 && isLast) {
        // Check if it's a create page, segments, tags, or contact detail page
        if (segment === "create") {
          breadcrumbs.push({
            label: "Create new contact",
            href: currentPath,
            isCurrent: isLast
          })
        } else if (segment === "segments") {
          breadcrumbs.push({
            label: "Segments",
            href: currentPath,
            isCurrent: isLast
          })
        } else if (segment === "tags") {
          breadcrumbs.push({
            label: "Tags & Attributes",
            href: currentPath,
            isCurrent: isLast
          })
        } else {
          // This is a contact detail page, show "Audience member details"
          breadcrumbs.push({
            label: "Contact details",
            href: currentPath,
            isCurrent: isLast
          })
        }
      } else {
        // Special handling for "contacts" -> "Audience"
        let label = segment.charAt(0).toUpperCase() + segment.slice(1)
        if (segment === "contacts") {
          label = "Audience"
        } else if (segment === "getting-started") {
          label = "Guide"
        }
        
        breadcrumbs.push({
          label,
          href: currentPath,
          isCurrent: isLast
        })
      }
    })
    
    return breadcrumbs
  }, [pathname, customBreadcrumbs])
  
  // Render action button
  const renderActionButton = (action: ActionButton, key: string) => {
    const buttonContent = (
      <>
        {action.icon && <span className="mr-2">{action.icon}</span>}
        {action.label}
      </>
    )
    
    if (action.href) {
      return (
        <Button
          key={key}
          variant={action.variant || "default"}
          size={action.size || "default"}
          disabled={action.disabled}
          asChild
        >
          <Link to={action.href}>{buttonContent}</Link>
        </Button>
      )
    }
    
    return (
      <Button
        key={key}
        variant={action.variant || "default"}
        size="sm"
        onClick={action.onClick}
        disabled={action.disabled}
      >
        {buttonContent}
      </Button>
    )
  }
  
  // If no title/description, render breadcrumb-only header
  if (!title && !description) {
    return (
      <>
        <header className="flex h-(--header-height) shrink-0 items-center border-b border-border transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) relative max-w-full overflow-x-hidden rounded-t-xl overflow-hidden">
          <div className="flex w-full items-center px-4 lg:px-6 py-4 min-w-0">
            {/* Left side - Sidebar trigger and breadcrumbs */}
            <div className="flex items-center gap-2 sm:gap-2 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger className="-ml-1" />
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p>Toggle sidebar</p>
                </TooltipContent>
              </Tooltip>
              <Separator
                orientation="vertical"
                className="h-4"
              />
              
              {showBreadcrumbs && (
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((breadcrumb, index) => (
                      <div key={breadcrumb.href} className="flex items-center">
                        <BreadcrumbItem>
                          {breadcrumb.isCurrent ? (
                            <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                      </div>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
            </div>
            {/* Right side - Search & Notification Bell */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Desktop Search - Compact */}
              {!isMobile && showSearch && (
                <Field className="w-auto">
                  <FieldContent>
                    <InputGroup className="bg-background border-border-muted focus-visible:bg-background focus-visible:border-ring transition-all duration-200 cursor-pointer w-auto gap-4">
                      <div className="flex items-center gap-2">
                        <InputGroupAddon>
                          <Search className="h-3.5 w-3.5" />
                        </InputGroupAddon>
                        <InputGroupInput
                          type="text"
                          placeholder="Search, discover, or create"
                          value={searchValue}
                          onChange={(e) => onSearchChange?.(e.target.value)}
                          onFocus={onSearchFocus}
                          className="h-8 text-sm cursor-pointer w-auto pr-0 pl-0"
                          style={{ width: '200px' }}
                        />
                      </div>
                      <div className="flex items-center pr-2 pointer-events-none">
                        <KbdGroup className="opacity-60">
                          <Kbd className="text-[10px] h-4 px-1">{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}</Kbd>
                          <Kbd className="text-[10px] h-4 px-1">K</Kbd>
                        </KbdGroup>
                      </div>
                    </InputGroup>
                  </FieldContent>
                </Field>
              )}
              
              {/* Mobile Search Icon */}
              {isMobile && showSearch && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={onSearchFocus}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    <p>Search</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Theme Switcher */}
              <ThemeSwitcher />
              
              {/* Notification Bell */}
              <NotificationBell />
            </div>
          </div>
        </header>
        
        {/* Action Center Dialog */}
        {showSearch && (
          <ActionCenter
            isOpen={isActionCenterOpen || false}
            onClose={onActionCenterClose || (() => {})}
            searchValue={searchValue}
            onSearchChange={onSearchChange || (() => {})}
          />
        )}
      </>
    )
  }
  
  // Main content header
  return (
    <div className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between max-w-full ${className}`}>
      {/* Left side - Title and Description */}
      <div className="space-y-1">
        {title && <h1 className="text-xl font-semibold">{title}</h1>}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      
      {/* Right side - Search, Filters, and Actions */}
      {(showSearch || showFilters || customActions || primaryAction || secondaryAction || tertiaryAction) && (
        <div className={`flex items-center gap-2 min-w-0 ${stackOnMobile ? 'flex-col items-start w-full md:flex-row md:items-center md:w-auto' : 'flex-row'}`}>
          {/* Search Bar */}
          {showSearch && (
            <div className="relative w-full md:w-64 max-w-md">
              <Field>
                <FieldContent>
                  <InputGroup className="cursor-pointer">
                    <InputGroupAddon>
                      <Search className="h-4 w-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchValue}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      className="pr-20"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      <KbdGroup className="opacity-60">
                        <Kbd className="text-xs h-5">{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}</Kbd>
                        <Kbd className="text-xs h-5">K</Kbd>
                      </KbdGroup>
                    </div>
                  </InputGroup>
                </FieldContent>
              </Field>
            </div>
          )}
          
          {/* Filters */}
          {showFilters && filters && (
            <div className="flex items-center gap-2">
              {filters}
            </div>
          )}
          
          {/* Custom Actions */}
          {customActions && (
            <div className="flex items-center gap-2">
              {customActions}
            </div>
          )}
          
          {/* Standard Actions */}
          {(primaryAction || secondaryAction || tertiaryAction) && (
            <div className="flex items-center gap-2">
              {primaryAction && renderActionButton(primaryAction, "primary")}
              {secondaryAction && renderActionButton(secondaryAction, "secondary")}
              {tertiaryAction && renderActionButton(tertiaryAction, "tertiary")}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Legacy component for backward compatibility
export function PageHeaderWithFilters({ 
  title, 
  description, 
  filters, 
  className = "",
  isLoading = false
}: {
  title: string
  description: string
  filters: ReactNode
  className?: string
  isLoading?: boolean
}) {
  return (
    <PageHeader
      title={title}
      description={description}
      showFilters={true}
      filters={filters}
      className={className}
      isLoading={isLoading}
    />
  )
}

export function PageHeaderWithActions({ 
  title, 
  description, 
  actions, 
  className = "",
  isLoading = false
}: {
  title: string
  description: string
  actions: ReactNode
  className?: string
  isLoading?: boolean
}) {
  return (
    <PageHeader
      title={title}
      description={description}
      customActions={actions}
      className={className}
      isLoading={isLoading}
    />
  )
}

// Profile Header Variant - with back button and avatar
interface PageHeaderProfileProps {
  title: string
  description?: string
  avatar?: {
    src?: string
    fallback: string
    alt?: string
  }
  onBack: () => void
  actions?: ReactNode
  className?: string
  isLoading?: boolean
}

export function PageHeaderProfile({
  title,
  description,
  avatar,
  onBack,
  actions,
  className = "",
  isLoading = false // Ignored
}: PageHeaderProfileProps) {
  return (
    <div className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${className}`}>
      {/* Left side - Back button, Avatar, Title and Description */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        {avatar && (
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={avatar.src} alt={avatar.alt} />
            <AvatarFallback className="text-lg">
              {avatar.fallback}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className="space-y-1 min-w-0">
          <h1 className="text-xl font-semibold tracking-wide truncate">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          )}
        </div>
      </div>
      
      {/* Right side - Actions */}
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
