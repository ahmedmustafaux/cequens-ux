import * as React from "react"
import { X, ChevronLeft, ChevronRight, Users, Lock, Sparkles, Zap, BarChart3 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface FeaturedContentCardProps {
  onDismiss?: () => void
  className?: string
  showDismiss?: boolean
  isLoading?: boolean
}

interface Feature {
  id: string
  title: string
  description: string
  readTime: string
  badge: string
  visual: React.ReactNode
  cta: {
    label: string
    href?: string
  }
}

const features: Feature[] = [
  {
    id: "roles-permissions",
    title: "Create roles and permissions",
    description: "Control access to your team. Assign team members specific roles and customize what they can see and do.",
    readTime: "2 min",
    badge: "New",
    visual: (
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg border border-border bg-background flex items-center justify-center">
          <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex items-center">
          <div className="w-8 h-px bg-border" />
          <Lock className="w-3 h-3 text-muted-foreground mx-1" />
          <div className="w-8 h-px bg-border" />
        </div>
        <div className="w-12 h-12 rounded-lg border border-border bg-background flex items-center justify-center">
          <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    ),
    cta: {
      label: "Get started"
    }
  },
  {
    id: "ai-automation",
    title: "AI-powered automation",
    description: "Streamline your workflows with intelligent automation. Let AI handle repetitive tasks and focus on what matters most.",
    readTime: "3 min",
    badge: "New",
    visual: (
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg border border-border bg-background flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex items-center">
          <div className="w-8 h-px bg-border" />
          <Zap className="w-4 h-4 text-muted-foreground mx-1" />
          <div className="w-8 h-px bg-border" />
        </div>
        <div className="w-12 h-12 rounded-lg border border-border bg-background flex items-center justify-center">
          <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
    ),
    cta: {
      label: "Learn more"
    }
  },
  {
    id: "analytics-insights",
    title: "Advanced analytics dashboard",
    description: "Get deep insights into your platform performance with real-time analytics, custom reports, and data visualization tools.",
    readTime: "4 min",
    badge: "Enhanced",
    visual: (
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg border border-border bg-background flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex items-center">
          <div className="w-8 h-px bg-border" />
          <Sparkles className="w-4 h-4 text-muted-foreground mx-1" />
          <div className="w-8 h-px bg-border" />
        </div>
        <div className="w-12 h-12 rounded-lg border border-border bg-background flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
      </div>
    ),
    cta: {
      label: "Explore"
    }
  }
]

export function FeaturedContentCard({ onDismiss, className, showDismiss = true, isLoading = false }: FeaturedContentCardProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isDismissed, setIsDismissed] = React.useState(false)
  const storageKey = "featured-content-dismissed"

  // Check localStorage on mount (only if dismiss is enabled)
  React.useEffect(() => {
    if (showDismiss) {
      const dismissed = localStorage.getItem(storageKey)
      if (dismissed === "true") {
        setIsDismissed(true)
      }
    }
  }, [showDismiss])

  const handleDismiss = () => {
    if (!showDismiss) return
    setIsDismissed(true)
    localStorage.setItem(storageKey, "true")
    onDismiss?.()
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : features.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < features.length - 1 ? prev + 1 : 0))
  }

  // Don't check dismissal if showDismiss is false (always show)
  if (showDismiss && isDismissed) {
    return null
  }

  const currentFeature = features[currentIndex]
  
  // Get background color based on feature
  const getBackgroundColor = (featureId: string) => {
    switch (featureId) {
      case "roles-permissions":
        return "bg-blue-50 dark:bg-blue-950/20"
      case "ai-automation":
        return "bg-purple-50 dark:bg-purple-950/20"
      case "analytics-insights":
        return "bg-green-50 dark:bg-green-950/20"
      default:
        return "bg-blue-50 dark:bg-blue-950/20"
    }
  }

  return (
    <Card className={cn("relative", className)}>
      {/* Dismiss button - only show if enabled */}
      {showDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-10 p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <CardContent>
        {/* Visual element */}
        <div className={cn("relative w-full h-32 rounded-t-lg flex items-center justify-center p-4 mb-4", !isLoading && getBackgroundColor(currentFeature.id))}>
          {isLoading ? (
            <Skeleton className="h-16 w-full rounded-md" />
          ) : (
            currentFeature.visual
          )}
        </div>

        <div className="pt-2 pb-4">
          {/* Badge replacing metadata */}
          {!isLoading && (
            <div className="mb-3 flex items-center gap-2">
              {currentFeature.badge === "New" ? (
                <Badge className="text-xs bg-primary text-primary-foreground border-primary">
                  {currentFeature.badge}
                </Badge>
              ) : (
                <Badge className="text-xs bg-green-600 dark:bg-green-500 text-white border-green-600 dark:border-green-500">
                  {currentFeature.badge}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">• {currentFeature.readTime}</span>
            </div>
          )}

          {/* Title */}
          {isLoading ? (
            <Skeleton className="h-6 w-3/4 mb-2 rounded-md" />
          ) : (
            <h3 className="text-lg font-semibold mb-2 leading-tight">
              {currentFeature.title}
            </h3>
          )}

          {/* Description */}
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-5/6 rounded-md" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentFeature.description}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-0">
        {isLoading ? (
          <Skeleton className="h-9 w-24 rounded-md" />
        ) : (
          <Button variant="outline" size="sm" asChild>
            <a href={currentFeature.cta.href || "#"}>
              {currentFeature.cta.label}
            </a>
          </Button>
        )}

        {/* Pagination */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-6 w-20 rounded-md" />
          ) : (
            <>
              <button
                onClick={handlePrevious}
                className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                {currentIndex + 1} of {features.length}
              </span>
              <button
                onClick={handleNext}
                className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
