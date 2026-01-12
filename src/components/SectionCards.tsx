import { TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { DashboardMetricsData } from "@/lib/supabase/dashboard"

interface SectionCardsProps {
  timeRange: string
  metrics?: DashboardMetricsData | null
  isLoading?: boolean
  isEmpty?: boolean
  error?: Error | null
}

export function SectionCards({ timeRange, metrics, isLoading = false, isEmpty = false, error }: SectionCardsProps) {
  const getTimePeriodText = (range: string) => {
    switch (range) {
      case "7d":
        return "7 days"
      case "30d":
        return "30 days"
      case "90d":
        return "3 months"
      default:
        return "30 days"
    }
  }

  const timePeriodText = getTimePeriodText(timeRange)

  // Empty state values for new users or when no data
  const emptyMetrics: DashboardMetricsData = {
    messagesSent: { value: "0", change: "0%", trend: "up" as const },
    deliveryRate: { value: "0%", change: "0%", trend: "up" as const },
    activeSenders: { value: "0", change: "0%", trend: "up" as const },
    responseRate: { value: "0%", change: "0%", trend: "up" as const },
  }

  // Use empty metrics if explicitly empty, or if no metrics data available, or if there's an error
  const displayMetrics = isEmpty || !metrics || error ? emptyMetrics : metrics
  const cardClassName = "@container/card"

  // Card data configuration
  const cardsData = [
    {
      description: "Messages Sent",
      value: displayMetrics.messagesSent.value,
      change: displayMetrics.messagesSent.change,
      trend: displayMetrics.messagesSent.trend,
    },
    {
      description: "Delivery Rate",
      value: displayMetrics.deliveryRate.value,
      change: displayMetrics.deliveryRate.change,
      trend: displayMetrics.deliveryRate.trend,
    },
    {
      description: "Active Senders",
      value: displayMetrics.activeSenders.value,
      change: displayMetrics.activeSenders.change,
      trend: displayMetrics.activeSenders.trend,
    },
    {
      description: "Response Rate",
      value: displayMetrics.responseRate.value,
      change: displayMetrics.responseRate.change,
      trend: displayMetrics.responseRate.trend,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cardsData.map((card, index) => (
        <Card key={index} className={cn(cardClassName, "max-w-full")}>
          <CardHeader>
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex items-baseline justify-between gap-3">
                  <Skeleton className="h-7 w-20 flex-shrink-0" />
                  <Skeleton className="h-5 w-14 flex-shrink-0" />
                </div>
              </>
            ) : (
              <>
                <CardDescription className="truncate">{card.description}</CardDescription>
                <div className="flex items-baseline justify-between gap-3">
                  <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl whitespace-nowrap">
                    {card.value}
                  </CardTitle>
                  <Badge variant="secondary" className="ml-auto flex-shrink-0 whitespace-nowrap">
                    {card.trend === "up" ? <TrendingUp /> : <TrendingDown />}
                    {card.change}
                  </Badge>
                </div>
              </>
            )}
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
