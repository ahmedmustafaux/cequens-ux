import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/page-header"
import { PageWrapper } from "@/components/page-wrapper"
import { 
  pageVariants, 
  smoothTransition
} from "@/lib/transitions"
import { getActiveChannels } from "@/lib/channel-utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardSkeleton,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Send,
  Settings,
  CheckCircle2,
  Clock,
  Zap
} from "lucide-react"
import { EnvelopeSimple, ChatText, Phone as PhoneIcon, Bell } from "phosphor-react"

// Channel type definition
interface Channel {
  id: string
  name: string
  description: string
  icon?: React.ElementType
  iconUrl?: string
  status: "active" | "available" | "coming-soon"
  category: "recommended" | "other"
  color: string
  features?: string[]
  products?: ("campaigns" | "inbox" | "API" | "Flow builder" | "AI Assist" | "Verify")[]
  popular?: boolean
}

// Channels data
const channels: Channel[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "WhatsApp Business API messaging",
    iconUrl: "/icons/WhatsApp.svg",
    status: "available",
    category: "other",
    color: "",
    features: ["Business API", "Templates", "Media sharing"],
    products: ["API", "inbox", "campaigns", "Flow builder", "AI Assist", "Verify"],
    popular: true
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Instagram Direct Messages and comments",
    iconUrl: "/icons/Instagram.svg",
    status: "available",
    category: "other",
    color: "",
    features: ["Direct messages", "Story replies", "Comments"],
    products: ["inbox", "AI Assist"],
    popular: true
  },
  {
    id: "messenger",
    name: "Messenger",
    description: "Chat with customers on your website",
    iconUrl: "/icons/Messenger.png",
    status: "available",
    category: "recommended",
    color: "",
    features: ["Real-time chat", "Automated responses", "Rich media support"],
    products: ["inbox", "AI Assist"]
  },
  {
    id: "sms",
    name: "SMS",
    description: "Text messaging for notifications and campaigns",
    icon: ChatText,
    status: "available",
    category: "other",
    color: "",
    features: ["Bulk SMS", "Two-way messaging", "Delivery reports"],
    products: ["campaigns", "API", "inbox", "Flow builder", "Verify"],
    popular: true
  },
  {
    id: "email",
    name: "Email",
    description: "Respond to customer queries via email",
    icon: EnvelopeSimple,
    status: "available",
    category: "recommended",
    color: "",
    features: ["Bulk campaigns", "Templates", "Analytics"],
    products: ["campaigns", "Flow builder", "AI Assist"]
  },
  {
    id: "phone",
    name: "Phone",
    description: "Voice and video calls with screen sharing",
    icon: PhoneIcon,
    status: "available",
    category: "recommended",
    color: "",
    features: ["Voice calls", "Video calls", "Call recording"],
    products: ["Verify", "AI Assist"]
  },
  {
    id: "rcs",
    name: "RCS",
    description: "Rich messaging with media and interactive elements",
    icon: Send,
    status: "available",
    category: "other",
    color: "",
    features: ["Rich media", "Interactive buttons", "Read receipts"],
    products: ["Flow builder", "AI Assist"]
  },
  {
    id: "push",
    name: "Push Notifications",
    description: "Mobile and web push notifications",
    icon: Bell,
    status: "available",
    category: "other",
    color: "",
    features: ["Mobile push", "Web push", "Segmentation"],
    products: ["campaigns", "API", "Flow builder", "AI Assist"]
  },
]

export default function ChannelsPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(true)
  const [activeChannels, setActiveChannels] = React.useState<string[]>([])

  // Load active channels from localStorage
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Load active channels from localStorage (defaults to empty array)
      setActiveChannels(getActiveChannels())
    }, 400)

    return () => clearTimeout(timer)
  }, [])

  // Listen for active channels changes from other components
  React.useEffect(() => {
    const handleActiveChannelsChange = (event: CustomEvent) => {
      setActiveChannels(event.detail.channelIds)
    }

    window.addEventListener('activeChannelsChanged', handleActiveChannelsChange as EventListener)
    return () => {
      window.removeEventListener('activeChannelsChanged', handleActiveChannelsChange as EventListener)
    }
  }, [])

  const handleChannelAction = (channelId: string, isActive: boolean) => {
    // Map channel IDs to their routes
    const channelRoutes: Record<string, string> = {
      whatsapp: "/channels/whatsapp",
      messenger: "/channels/messenger",
      instagram: "/channels/instagram",
      email: "/channels/email",
      phone: "/channels/call",
      sms: "/channels/sms",
      rcs: "/channels/rcs",
      push: "/channels/push",
    }

    const route = channelRoutes[channelId]
    if (route) {
      navigate(route)
    }
  }

  const getStatusBadge = (channel: Channel) => {
    const isActive = activeChannels.includes(channel.id)
    
    if (isActive) {
      return (
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20">
          Active
        </Badge>
      )
    }
    
    return null
  }

  const renderChannelIcon = (channel: Channel) => {
    if (channel.iconUrl) {
      return (
        <div className="p-2.5 rounded-lg bg-muted border border-border">
          <img 
            src={channel.iconUrl} 
            alt={channel.name}
            className="w-6 h-6 object-contain"
          />
        </div>
      )
    }
    
    if (channel.icon) {
      const Icon = channel.icon
      // Check if it's a Phosphor icon (has weight prop) and use filled style
      const isPhosphorIcon = Icon === ChatText || Icon === EnvelopeSimple || Icon === PhoneIcon || Icon === Bell
      return (
        <div className="p-2.5 rounded-lg bg-muted border border-border">
          {isPhosphorIcon ? (
            <Icon weight="fill" className="w-6 h-6 text-foreground" />
          ) : (
            <Icon className="w-6 h-6 text-foreground" />
          )}
        </div>
      )
    }
    
    return null
  }

  const toTitleCase = (str: string) => {
    // If already has mixed case (like "Flow builder" or "AI Assist"), preserve it
    if (str !== str.toLowerCase() && str !== str.toUpperCase()) {
      return str
    }
    // Handle multi-word strings
    if (str.includes(' ')) {
      return str.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    }
    // Single word: first letter uppercase, rest lowercase
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const renderAllBadges = (channel: Channel) => {
    const products = channel.products || []
    
    if (products.length === 0) {
      return null
    }

    // All badges are now in products array
    const allBadges = products.map(product => toTitleCase(product))

    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Compatible with</p>
        <div className="flex flex-wrap gap-2">
          {allBadges.map((badge) => (
            <Badge
              key={badge}
              variant="secondary"
              className="text-xs px-2 py-0.5 h-5 bg-muted text-foreground border-border"
            >
              {badge}
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  return (
    <PageWrapper isLoading={isLoading}>
      <PageHeader
        title="Channels"
        description="Configure and manage your communication channels"
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className="space-y-6">
          <div>
            <div className="h-5 w-28 bg-muted rounded mb-3 animate-pulse" />
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
          <div>
            <div className="h-5 w-28 bg-muted rounded mb-3 animate-pulse" />
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="space-y-6"
        >
          {/* Active Channels Section */}
          {activeChannels.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Active Channels</p>
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
                {channels
                  .filter((channel) => activeChannels.includes(channel.id))
                  .map((channel) => {
                    return (
                      <Card 
                        key={channel.id} 
                        className="h-full hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleChannelAction(channel.id, true)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start gap-2.5">
                            {renderChannelIcon(channel)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <CardTitle className="text-base">{channel.name}</CardTitle>
                                {channel.popular && (
                                  <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 dark:border-purple-400/30 dark:bg-purple-400/10 dark:hover:bg-purple-400/20">
                                    Popular
                                  </Badge>
                                )}
                                {getStatusBadge(channel)}
                              </div>
                              <CardDescription className="truncate text-xs">
                                {channel.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        {renderAllBadges(channel) && (
                          <CardContent>
                            {renderAllBadges(channel)}
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
              </div>
            </div>
          )}

          {/* All Channels Section */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">All Channels</p>
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
              {channels
                .filter((channel) => !activeChannels.includes(channel.id))
                .map((channel) => {
                  return (
                    <Card 
                      key={channel.id} 
                      className="h-full hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleChannelAction(channel.id, false)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-2.5">
                          {renderChannelIcon(channel)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <CardTitle className="text-base">{channel.name}</CardTitle>
                              {channel.popular && (
                                <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 dark:border-purple-400/30 dark:bg-purple-400/10 dark:hover:bg-purple-400/20">
                                  Popular
                                </Badge>
                              )}
                              {getStatusBadge(channel)}
                            </div>
                            <CardDescription className="truncate text-xs">
                              {channel.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      {renderAllBadges(channel) && (
                        <CardContent>
                          {renderAllBadges(channel)}
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
            </div>
          </div>
        </motion.div>
      )}
    </PageWrapper>
  )
}