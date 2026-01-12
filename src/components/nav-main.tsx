import { useLocation } from "react-router-dom"
import { type LucideIcon, ChevronDown, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useNavigationContext } from "@/hooks/use-navigation-context"
export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    items?: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }[]
}) {
  const location = useLocation()
  const pathname = location.pathname
  const { isActive, navigateTo } = useNavigationContext()
  const [openItems, setOpenItems] = useState<string[]>([])
  
  // Auto-expand/collapse sub-menus based on active state
  useEffect(() => {
    const activeParent = items.find(item => 
      item.items && (isActive(item.url) || item.items.some(subItem => isActive(subItem.url)))
    )
    
    // Close all sub-menus first
    setOpenItems([])
    
    // Then open the active one if it exists
    if (activeParent) {
      setOpenItems([activeParent.title])
    }
  }, [pathname, items, isActive])
  
  const toggleItem = (title: string) => {
    setOpenItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }
  const handleNavigation = (e: React.MouseEvent, url: string) => {
    e.preventDefault()
    navigateTo(url)
  }
  
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            // Check if any subItem is active
            const hasActiveSubItem = item.items && item.items.some(subItem => isActive(subItem.url))
            // Parent is only active if its URL is active AND no subItem is active
            const itemIsActive = isActive(item.url) && !hasActiveSubItem
            const hasSubItems = item.items && item.items.length > 0
            const isOpen = openItems.includes(item.title)
            
            return (
              <SidebarMenuItem key={item.title}>
                {hasSubItems ? (
                  <>
                    <SidebarMenuButton 
                      isActive={itemIsActive}
                      onClick={(e) => {
                        // If clicking on the chevron, just toggle
                        if ((e.target as HTMLElement).closest('.sidebar-chevron')) {
                          toggleItem(item.title)
                        } else {
                          // If clicking on the main button, navigate to the main page
                          handleNavigation(e, item.url)
                        }
                      }}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <div 
                        className="ml-auto size-4 sidebar-chevron flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleItem(item.title)
                        }}
                      >
                        {isOpen ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </div>
                    </SidebarMenuButton>
                    <SidebarMenuSub className={isOpen ? "animate-in slide-in-from-top-2 duration-200" : "hidden"}>
                      {item.items?.map((subItem) => {
                        const isSubActive = isActive(subItem.url)
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton 
                              isActive={isSubActive}
                              onClick={(e) => handleNavigation(e, subItem.url)}
                            >
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </>
                ) : (
                  <SidebarMenuButton 
                    isActive={itemIsActive}
                    onClick={(e) => handleNavigation(e, item.url)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
