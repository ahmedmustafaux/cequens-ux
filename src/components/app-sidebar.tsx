import * as React from "react"
// Image component replaced with img tag for Vite
import { getAppName } from "@/lib/config"
import {
  BarChart3,
  Home,
  MessageSquare,
  Settings,
  Users,
  FileText,
  Bot,
  Boxes,
  Globe,
  Lightbulb,
  Tags,
  Layout,
  Inbox,
  Megaphone,
  Brain,
  Code,
  CreditCard,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/hooks/use-auth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Campaigns",
      url: "/campaigns",
      icon: Megaphone,
      items: [
        {
          title: "Automation",
          url: "/campaigns/automation",
          icon: Lightbulb,
        },
        {
          title: "Settings",
          url: "/campaigns/settings",
          icon: Settings,
        },
      ],
    },
    {
      title: "Inbox",
      url: "/inbox",
      icon: Inbox,
      items: [
        {
          title: "Requests",
          url: "/inbox/requests",
          icon: MessageSquare,
        },
        {
          title: "Settings",
          url: "/inbox/settings",
          icon: Settings,
        },
      ],
    },
    {
      title: "Audience",
      url: "/contacts",
      icon: Users,
      items: [
        {
          title: "Segments",
          url: "/contacts/segments",
          icon: Layout,
        },
        {
          title: "Tags & Attributes",
          url: "/contacts/tags",
          icon: Tags,
        },
      ],
    },
    {
      title: "Automation Hub",
      url: "/automation",
      icon: Bot,
      items: [
        {
          title: "Journey Builder",
          url: "/automation/journey",
          icon: Boxes,
        },
        {
          title: "Templates",
          url: "/automation/templates",
          icon: FileText,
        },
        {
          title: "Bot Studio",
          url: "/automation/bots",
          icon: Brain,
        },
      ],
    },
    {
      title: "Channels",
      url: "/channels",
      icon: Globe,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
  ],
  navClouds: [],
  navSecondary: [
    {
      title: "Developer Hub",
      url: "/developer-apis",
      icon: Code,
      items: [
        {
          title: "API Docs",
          url: "/developer-apis/docs",
        },
        {
          title: "SMS API",
          url: "/developer-apis/sms",
        },
        {
          title: "Voice API",
          url: "/developer-apis/voice",
        },
        {
          title: "WhatsApp Business API",
          url: "/developer-apis/whatsapp",
        },
        {
          title: "Push Notification API",
          url: "/developer-apis/push",
        },
        {
          title: "OTP API",
          url: "/developer-apis/otp",
        },
        {
          title: "Bot APIs",
          url: "/developer-apis/bots",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "Account Settings",
          url: "/settings/profile",
        },
        {
          title: "Team Management",
          url: "/settings/organization",
        },
        {
          title: "Audience Export",
          url: "/settings/contacts-export",
        },
        {
          title: "Integrations",
          url: "/settings/plugins",
        },
        {
          title: "System Preferences",
          url: "/settings/preferences",
        },
      ],
    },
    {
      title: "Billing",
      url: "/billing",
      icon: CreditCard,
    },
  ],
}
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}
export function AppSidebar({ ...props }: AppSidebarProps) {
  const { user } = useAuth()
  
  // Create user data for NavUser component
  const userData = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    avatar: "", // Use empty string to trigger Avatar fallback with initials
  }
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
       
                <img
                  src="/Logo.svg" 
                  alt={getAppName()} 
                  className="ml-1 py-2 w-25 h-auto"
                />
      
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
