import * as React from "react"
import { useMemo } from "react"
import {
  Sparkles,
  User,
  Megaphone,
  Code,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { ChatText, EnvelopeSimple } from "phosphor-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"


import {
  workflowTemplates,
  type WorkflowTemplate,
  type AppIcon,
} from "@/data/home-templates"

import { cn } from "@/lib/utils"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Skeleton } from "@/components/ui/skeleton"

/* ------------------------------------------------------------------ */
/* Badge config */
/* ------------------------------------------------------------------ */

const BADGE_CONFIG: Record<string, { styles: string; icon: React.ReactNode }> = {
  "AI Powered": {
    styles:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400",
    icon: <Sparkles className="w-3 h-3 mr-1" />,
  },
  Campaigns: {
    styles:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-400",
    icon: <Megaphone className="w-3 h-3 mr-1" />,
  },
  API: {
    styles:
      "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/30 dark:text-purple-400",
    icon: <Code className="w-3 h-3 mr-1" />,
  },
  Inbox: {
    styles:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400",
    icon: <Inbox className="w-3 h-3 mr-1" />,
  },
}

/* ------------------------------------------------------------------ */
/* App icons */
/* ------------------------------------------------------------------ */

const APP_ICON_COMPONENTS: Record<string, React.ComponentType<any>> = {
  ChatText,
  EnvelopeSimple,
}

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

const getTemplateScore = (template: WorkflowTemplate, onboardingData: any) => {
  let score = 0

  // Industry Match (High weight)
  // If user has specific industry, matching it is very important
  // If user has "custom" or "none", we don't penalize, but we don't boost either
  if (template.industries && onboardingData.industry &&
    onboardingData.industry !== "custom" && onboardingData.industry !== "none") {
    if (template.industries.includes(onboardingData.industry)) {
      score += 10
    } else {
      // If template is industry-specific but doesn't match user's industry, penalize heavily
      // unless the template is marked as generic/all industries (empty industries array usually means all)
      return -1 // Exclude this template
    }
  }

  // Goal Matches
  if (template.goals && onboardingData.goals) {
    const matchingGoals = template.goals.filter(g => onboardingData.goals.includes(g))
    score += matchingGoals.length * 2
  }

  // Channel Matches
  if (template.channels && onboardingData.channels) {
    const matchingChannels = template.channels.filter(c => onboardingData.channels.includes(c))
    score += matchingChannels.length * 1
  }

  return score
}

const matchesOnboarding = (template: WorkflowTemplate, onboardingData: any) => {
  return getTemplateScore(template, onboardingData) > 0
}

const filterTemplatesByTab = (
  tab: string,
  templates: WorkflowTemplate[]
) => {
  switch (tab) {
    case "broadcasting":
      return templates.filter(
        (t) => t.tags?.includes("Campaigns") && !t.isAIPowered
      )
    case "ai-powered":
      return templates.filter(
        (t) => t.isAIPowered && !t.tags?.includes("Inbox")
      )
    case "apis":
      return templates.filter(
        (t) =>
          t.tags?.includes("API") &&
          !t.isAIPowered &&
          !t.tags?.includes("Campaigns") &&
          !t.tags?.includes("Inbox")
      )
    case "inbox":
      return templates.filter((t) => t.tags?.includes("Inbox"))
    default:
      return templates
  }
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

export function RecommendedTemplates({
  className,
  isLoading
}: {
  className?: string
  isLoading?: boolean
}) {
  const { onboardingData } = useOnboarding()
  const [activeTab, setActiveTab] = React.useState("for-you")

  const [showLeftArrow, setShowLeftArrow] = React.useState(false)
  const [showRightArrow, setShowRightArrow] = React.useState(true)

  const scrollRef = React.useRef<HTMLDivElement>(null)

  const SCROLL_STEP = 256

  // Fisher-Yates shuffle helper
  const shuffleArray = (array: WorkflowTemplate[]) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray
  }

  const filteredTemplates = useMemo(() => {
    if (activeTab === "for-you" && onboardingData) {
      // Shuffle templates first to randomize order of items with equal scores
      // distinct from the fixed array order
      const shuffledTemplates = shuffleArray(workflowTemplates)

      // Calculate scores for all templates
      const scoredTemplates = shuffledTemplates.map(t => ({
        template: t,
        score: getTemplateScore(t, onboardingData)
      }))

      // Filter out non-matching (score <= 0) and sort by score descending
      const filtered = scoredTemplates
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.template)

      // If we found personalized matches, return them
      if (filtered.length > 0) {
        return filtered
      }

      // Fallback logic:
      // If the user has a specific industry selected (not custom/none),
      // but strict filtering returned nothing (maybe because of score calculation issues),
      // we should still try to find templates for that industry specifically before falling back to everything.
      if (onboardingData.industry && onboardingData.industry !== "custom" && onboardingData.industry !== "none") {
        const userIndustry = onboardingData.industry
        const industryFallback = workflowTemplates.filter(t =>
          t.industries && t.industries.includes(userIndustry)
        )
        if (industryFallback.length > 0) {
          return industryFallback
        }
      }

      // Final Fallback: Return all templates if really nothing matches
      return workflowTemplates
    }
    return filterTemplatesByTab(activeTab, workflowTemplates)
  }, [activeTab, onboardingData])

  const updateArrows = () => {
    if (!scrollRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current

    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1)
  }

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return

    scrollRef.current.scrollBy({
      left: dir === "left" ? -SCROLL_STEP : SCROLL_STEP,
      behavior: "smooth",
    })

    requestAnimationFrame(updateArrows)
  }

  const renderAppIcon = (app: AppIcon) => {
    if (app.iconType === "svg")
      return <img src={app.icon} alt={app.name} className="w-5 h-5" />

    if (app.iconType === "component") {
      const Icon = APP_ICON_COMPONENTS[app.icon]
      return Icon ? <Icon weight="fill" className="w-5 h-5 text-primary" /> : null
    }

    if (app.iconType === "emoji")
      return <span className={app.color}>{app.icon}</span>

    return (
      <span className={cn("text-sm font-bold", app.color)}>{app.icon}</span>
    )
  }

  if (isLoading) {
    return (
      <Card className={cn("flex flex-col h-[280px]", className)}>
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-[320px] flex-shrink-0">
                <div className="h-32 rounded-lg border p-4">
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <h2 className="text-xl font-semibold">Explore Solutions</h2>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* ---------------- Cards ---------------- */}
        <div className="relative">
          {/* Left Arrow */}
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-card to-transparent z-10 flex items-center justify-center transition-all duration-300",
              showLeftArrow
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2 pointer-events-none"
            )}
          >
            <button
              onClick={() => scroll("left")}
              className="w-8 h-8 rounded-full bg-background border shadow-md flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Right Arrow */}
          <div
            className={cn(
              "absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-card to-transparent z-10 flex items-center justify-center transition-all duration-300",
              showRightArrow
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-2 pointer-events-none"
            )}
          >
            <button
              onClick={() => scroll("right")}
              className="w-8 h-8 rounded-full bg-background border shadow-md flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            onScroll={updateArrows}
            className="flex gap-4 overflow-x-auto hide-scrollbar"
          >
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="w-[320px] flex-shrink-0 hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <div className="flex gap-2">
                    {template.apps.map((app) => (
                      <div
                        key={app.name}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center"
                      >
                        {renderAppIcon(app)}
                      </div>
                    ))}
                  </div>

                  <h3 className="text-sm font-medium mt-3 line-clamp-2">
                    {template.title}
                  </h3>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {template.tags?.map((tag) => {
                      const config = BADGE_CONFIG[tag]
                      return (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={cn("text-xs", config?.styles)}
                        >
                          {config?.icon}
                          {tag}
                        </Badge>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
