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
  MessageCircle,
  Instagram,
  Phone,
  Library,
  ShieldCheck,

} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/hooks/use-auth"
import { EnvelopeSimple, ChatText, Phone as PhoneIcon, Bell } from "phosphor-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useNavigationContext } from "@/hooks/use-navigation-context"
import { getActiveChannels } from "@/lib/channel-utils"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
const data = {
  // Group 1: Home, Inbox, Engage, Verify, AI & Bots, Developer Hub
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Inbox",
      url: "https://console.cequens.com/chat-dashboard/#/inbox",
      icon: Inbox,
      external: true,
    },
    {
      title: "Engage",
      url: "/campaigns",
      icon: Megaphone,
      items: [
        {
          title: "Campaigns",
          url: "/campaigns",
        },
        {
          title: "Journey Builder",
          url: "/automation/journey",
        },
      ],
    },
    {
      title: "Verify",
      url: "/verify",
      icon: ShieldCheck,
    },
    {
      title: "AI & Bots",
      url: "/automation/bots",
      icon: Bot,
      items: [
        {
          title: "My AI Agents",
          url: "/automation/bots",
        },
        {
          title: "Knowledge Base",
          url: "/automation/kb",
        },
        {
          title: "Bot Templates",
          url: "/automation/bot-templates",
        },
      ],
    },

  ],
  // Group 2: Audience, Library
  navGroup2: [
    {
      title: "Audience",
      url: "/contacts",
      icon: Users,
      items: [
        {
          title: "All Contacts",
          url: "/contacts",
        },
        {
          title: "Segments",
          url: "/contacts/segments",
        },
        {
          title: "Tags",
          url: "/contacts/tags",
        },
        {
          title: "Custom Attributes",
          url: "/contacts/attributes",
        },
      ],
    },
    {
      title: "Library",
      url: "/library",
      icon: Library,
      items: [
        {
          title: "Message Templates",
          url: "/automation/templates",
        },
        {
          title: "Use Cases",
          url: "/use-cases",
          badge: "New",
        },
      ],
    },

  ],
  // Group 3: Analytics
  navGroup3: [
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
      items: [
        {
          title: "Performance Dashboard",
          url: "/analytics/performance",
        },
        {
          title: "Campaign Analytics",
          url: "/analytics/campaigns",
        },
        {
          title: "Conversation Metrics",
          url: "/analytics/conversations",
        },
        {
          title: "Channel Reports",
          url: "/analytics/channels",
        },
        {
          title: "Agent Performance",
          url: "/analytics/agent",
        },
        {
          title: "Custom Reports",
          url: "/analytics/custom",
        },
      ],
    },
  ],

  // Secondary: Settings, Billing, Support
  navSecondary: [
    {
      title: "Developer Hub",
      url: "/developer-apis",
      icon: Code,
      items: [
        {
          title: "API Keys",
          url: "/developer-apis/keys",
        },
        {
          title: "Webhooks",
          url: "/developer-apis/webhooks",
        },
        {
          title: "Documentation",
          url: "/developer-apis/docs",
        },
        {
          title: "API Logs",
          url: "/developer-apis/logs",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "Account Information",
          url: "/settings/profile",
        },
        {
          title: "Company & Compliance",
          url: "/settings/company",
        },
        {
          title: "Team Management",
          url: "/settings/organization",
        },
        {
          title: "Security & Logs",
          url: "/settings/security",
        },
        {
          title: "Integrations",
          url: "/settings/plugins",
        },
      ],
    },
    {
      title: "Billing",
      url: "/billing",
      icon: CreditCard,
      items: [
        {
          title: "Plans & Features",
          url: "/billing/plans",
        },
        {
          title: "Usage & Credits",
          url: "/billing/usage",
        },
        {
          title: "Payment Methods",
          url: "/billing/payments",
        },
        {
          title: "Invoice History",
          url: "/billing/invoices",
        },
      ],
    },
    {
      title: "Support",
      url: "/support",
      icon: Lightbulb,
      items: [
        {
          title: "Help Center",
          url: "/support/help",
        },
        {
          title: "Best Practices",
          url: "/support/best-practices",
        },
        {
          title: "FAQs",
          url: "/support/faqs",
        },
      ],
    },
  ],
}

function ChannelPrompter() {
  const [activeChannels, setActiveChannels] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const { isActive, navigateTo } = useNavigationContext()

  React.useEffect(() => {
    setActiveChannels(getActiveChannels())
    setLoading(false)

    const handleChannelChange = (e: any) => {
      setActiveChannels(e.detail.channelIds)
    }
    window.addEventListener('activeChannelsChanged', handleChannelChange)
    return () => window.removeEventListener('activeChannelsChanged', handleChannelChange)
  }, [])

  const channelIsActive = isActive("/channels")

  return (
    <SidebarGroup className="py-2 px-2">
      <div className={cn(
        "rounded-xl border transition-all duration-300 overflow-hidden",
        activeChannels.length === 0
          ? "bg-primary/[0.03] border-primary/20 shadow-sm"
          : "bg-transparent border-transparent"
      )}>
        {activeChannels.length === 0 && (
          <div
            className="p-2.5 flex items-center justify-around border-b border-primary/10 bg-primary/[0.02] cursor-pointer hover:bg-primary/[0.05] transition-colors"
            onClick={() => navigateTo('/channels')}
          >
            <img src="/icons/WhatsApp.svg" alt="WhatsApp" className="size-3.5 opacity-80" />
            <img src="/icons/Instagram.svg" alt="Instagram" className="size-3.5 opacity-80" />
            <img src="/icons/Messenger.png" alt="Messenger" className="size-3.5 opacity-80" />
            <ChatText weight="fill" className="size-3.5 text-primary/60" />
            <EnvelopeSimple weight="fill" className="size-3.5 text-primary/60" />
            <PhoneIcon weight="fill" className="size-3.5 text-primary/60" />
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={channelIsActive}
              onClick={() => navigateTo("/channels")}
              className={cn(
                "w-full",
                activeChannels.length === 0 && "hover:bg-primary/5"
              )}
            >
              <Globe className={cn("size-4", activeChannels.length === 0 && "text-primary")} />
              <span className={cn(activeChannels.length === 0 && "font-semibold text-primary")}>Channels</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </SidebarGroup>
  )
}
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> { }
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
        {/* Main Group (Home, Inbox, Engage, Verify, AI & Bots) */}
        <NavMain items={data.navMain} />

        <SidebarSeparator className="mx-0" />

        {/* Secondary Group (Audience, Library, Dev Hub) */}
        <NavMain items={data.navGroup2} />

        <SidebarSeparator className="mx-0" />

        {/* Analytics Group */}
        <NavMain items={data.navGroup3} />

        <div className="mt-auto flex flex-col">
          <ChannelPrompter />
          <NavSecondary items={data.navSecondary} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
