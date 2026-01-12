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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import {
  workflowTemplates,
  type WorkflowTemplate,
  type AppIcon,
} from "@/data/home-templates"

import { cn } from "@/lib/utils"
import { useOnboarding } from "@/contexts/onboarding-context"

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

const matchesOnboarding = (template: WorkflowTemplate, onboardingData: any) => {
  const industry =
    !template.industries ||
    !onboardingData.industry ||
    template.industries.includes(onboardingData.industry)

  const goals =
    !template.goals ||
    !onboardingData.goals?.length ||
    template.goals.some((g) => onboardingData.goals.includes(g))

  const channels =
    !template.channels ||
    !onboardingData.channels?.length ||
    template.channels.some((c) =>
      onboardingData.channels.includes(c)
    )

  return industry && goals && channels
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
}: {
  className?: string
}) {
  const { onboardingData } = useOnboarding()
  const [activeTab, setActiveTab] = React.useState("for-you")

  const [showLeftArrow, setShowLeftArrow] = React.useState(false)
  const [showRightArrow, setShowRightArrow] = React.useState(true)

  const scrollRef = React.useRef<HTMLDivElement>(null)

  const SCROLL_STEP = 256

  const filteredTemplates = useMemo(() => {
    if (activeTab === "for-you" && onboardingData) {
      return workflowTemplates.filter((t) =>
        matchesOnboarding(t, onboardingData)
      )
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

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <h2 className="text-xl font-semibold">Explore Solutions</h2>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* ---------------- Tabs ---------------- */}
          <TabsList className="inline-flex h-9 gap-2 rounded-lg p-[3px]">
            <TabsTrigger value="for-you">
              <User className="w-4 h-4 mr-1" /> For you
            </TabsTrigger>
            <TabsTrigger value="broadcasting">
              <Megaphone className="w-4 h-4 mr-1" /> Campaigns
            </TabsTrigger>
            <TabsTrigger value="ai-powered">
              <Sparkles className="w-4 h-4 mr-1" /> AI Powered
            </TabsTrigger>
            <TabsTrigger value="apis">
              <Code className="w-4 h-4 mr-1" /> APIs
            </TabsTrigger>
            <TabsTrigger value="inbox">
              <Inbox className="w-4 h-4 mr-1" /> Inbox
            </TabsTrigger>
          </TabsList>

          {/* ---------------- Cards ---------------- */}
          <TabsContent value={activeTab}>
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
