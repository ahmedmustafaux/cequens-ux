import * as React from "react"
import { 
  PlayCircle, 
  MessageCircle, 
  Laptop, 
  HelpCircle, 
  Video,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ResourceItem {
  title: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
}

const resources: ResourceItem[] = [
  {
    title: "Watch Inbox intro",
    icon: <PlayCircle className="w-4 h-4" />,
    href: "#",
  },
  {
    title: "Contact support",
    icon: <MessageCircle className="w-4 h-4" />,
    href: "#",
  },
  {
    title: "Book a demo",
    icon: <Laptop className="w-4 h-4" />,
    href: "#",
  },
  {
    title: "Help center",
    icon: <HelpCircle className="w-4 h-4" />,
    href: "#",
  },
  {
    title: "Video guides",
    icon: <Video className="w-4 h-4" />,
    href: "#",
  },
]

export function GettingStartedResources() {
  const handleResourceClick = (resource: ResourceItem) => {
    if (resource.onClick) {
      resource.onClick()
    } else if (resource.href) {
      // Handle navigation
      if (resource.href.startsWith("#")) {
        // Placeholder - implement actual navigation
        console.log(`Navigate to: ${resource.title}`)
      } else {
        window.location.href = resource.href
      }
    }
  }

  return (
    <div className="h-fit">
      <div className="space-y-1">
        {resources.map((resource, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => handleResourceClick(resource)}
            className={cn(
              "w-full flex items-center gap-2.5 justify-start",
              "text-left group"
            )}
          >
            {resource.icon}
            <span className="flex-1 text-xs font-medium">
              {resource.title}
            </span>
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        ))}
      </div>
    </div>
  )
}
