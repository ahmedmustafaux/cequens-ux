import * as React from "react"
import { Megaphone, Inbox, Bot, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useNavigationContext } from "@/hooks/use-navigation-context"

interface Product {
  id: string
  name: string
  description: string
  icon: React.ElementType
  url: string
  external?: boolean
}

const products: Product[] = [
  {
    id: "engage",
    name: "Engage",
    description: "Automated campaigns",
    icon: Megaphone,
    url: "/engage/campaigns",
  },
  {
    id: "inbox",
    name: "Inbox",
    description: "Automated inbox",
    icon: Inbox,
    url: "https://console.cequens.com/chat-dashboard/#/inbox",
    external: true,
  },
  {
    id: "ai-bots",
    name: "AI & Bots",
    description: "Automated agents",
    icon: Bot,
    url: "/automation/bots",
  },
  {
    id: "verify",
    name: "Verify",
    description: "Automated verification",
    icon: ShieldCheck,
    url: "/verify",
  },
]

export function ProductList({ className }: { className?: string }) {
  const { navigateTo } = useNavigationContext()

  const handleNavigation = (url: string, external?: boolean) => {
    if (external) {
      window.open(url, "_blank", "noopener,noreferrer")
    } else {
      navigateTo(url)
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const IconComponent = product.icon
          return (
            <Card
              key={product.id}
              className={cn("cursor-pointer hover:shadow-md transition-shadow max-w-full")}
              onClick={() => handleNavigation(product.url, product.external)}
            >
              <CardContent className="flex items-center gap-2.5">
                {/* Icon Container */}
                <div className="w-10 h-10 rounded-md bg-orange-500 border border-orange-600 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>

                {/* Text Content */}
                <div className="flex flex-col min-w-0">
                  <h3 className="text-sm font-semibold font-sans tracking-wide text-foreground leading-tight mb-0.5">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {product.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
