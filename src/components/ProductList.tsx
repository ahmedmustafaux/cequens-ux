import * as React from "react"
import { Megaphone, Inbox, Bot, GitBranch } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const products: Product[] = [
  {
    id: "campaigns",
    name: "Campaigns",
    description: "Automated campaigns",
    icon: Megaphone,
  },
  {
    id: "inbox",
    name: "Inbox",
    description: "Automated inbox",
    icon: Inbox,
  },
  {
    id: "ai-agents",
    name: "AI Agents",
    description: "Automated agents",
    icon: Bot,
  },
  {
    id: "flow-builder",
    name: "Flow Builder",
    description: "Automated flows",
    icon: GitBranch,
  },
]

export function ProductList({ className }: { className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const IconComponent = product.icon
          return (
            <Card
              key={product.id}
              className={cn("cursor-pointer hover:shadow-md transition-shadow max-w-full")}
            >
              <CardContent className="flex items-center gap-2.5">
                {/* Icon Container */}
                <div className="w-10 h-10 rounded-md bg-orange-500 border border-orange-600 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-5 h-5 text-white" strokeWidth={2.5} fill="currentColor" />
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
