import * as React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import { Check, Sparkles, MessageSquare, ArrowRight, Search, ChevronDown, X, Info } from "lucide-react"
import { EnvelopeSimple, ChatText, Phone as PhoneIcon, Bell } from "phosphor-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Field, 
  FieldLabel, 
  FieldContent 
} from "@/components/ui/field"
import { 
  InputGroup, 
  InputGroupInput, 
  InputGroupAddon 
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { smoothTransition } from "@/lib/transitions"
import { cn } from "@/lib/utils"

// Channel icon mapping
const channelIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  "channel-1": { 
    icon: <ChatText weight="fill" className="w-3.5 h-3.5 text-primary" />, 
    label: "SMS" 
  },
  "channel-2": { 
    icon: <img src="/icons/WhatsApp.svg" alt="WhatsApp" className="w-3.5 h-3.5" />, 
    label: "WhatsApp" 
  },
  "channel-3": { 
    icon: <EnvelopeSimple weight="fill" className="w-3.5 h-3.5 text-primary" />, 
    label: "Email" 
  },
  "channel-4": { 
    icon: <PhoneIcon weight="fill" className="w-3.5 h-3.5 text-primary" />, 
    label: "Voice" 
  },
  "channel-5": { 
    icon: <img src="/icons/Messenger.png" alt="Messenger" className="w-3.5 h-3.5" />, 
    label: "Messenger" 
  },
  "channel-6": { 
    icon: <img src="/icons/Instagram.svg" alt="Instagram" className="w-3.5 h-3.5" />, 
    label: "Instagram" 
  },
  "channel-7": { 
    icon: <Bell weight="fill" className="w-3.5 h-3.5 text-primary" />, 
    label: "Push Notifications" 
  },
}

// Product icon mapping
const productIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  "product-api": { icon: <span className="text-xs font-semibold">API</span>, label: "API" },
  "product-inbox": { icon: <span className="text-xs font-semibold">Inbox</span>, label: "Inbox" },
  "product-ai-assist": { icon: <span className="text-xs font-semibold">AI Assist</span>, label: "AI Assist" },
  "product-flow": { icon: <span className="text-xs font-semibold">Flow</span>, label: "Flow" },
  "product-campaigns": { icon: <span className="text-xs font-semibold">Campaigns</span>, label: "Campaigns" },
}

// Use cases per industry (includes benefits)
interface UseCaseItem {
  id: string;
  title: string;
  benefit?: string;
  channels: string[];
  products: string[];
}

// Use cases with benefits per industry
const clientBenefitsByIndustry: Record<string, UseCaseItem[]> = {
  ecommerce: [
    {
      id: "use-case-1",
      title: "Order & shipping updates",
      benefit: "Reduced customer support inquiries by 40% with automated order tracking",
      channels: ["channel-2", "channel-1", "channel-3"],
      products: ["product-api"]
    },
    {
      id: "use-case-2",
      title: "Abandoned cart recovery",
      benefit: "Our clients achieved 15% more sales through abandoned cart recovery",
      channels: ["channel-2", "channel-1"],
      products: ["product-api"]
    },
    {
      id: "use-case-3",
      title: "Product recommendations",
      benefit: "Increased average order value by 25% with personalized product suggestions",
      channels: ["channel-2", "channel-3"],
      products: ["product-campaigns"]
    },
    {
      id: "use-case-4",
      title: "Customer support automation",
      benefit: "Reduced response time by 70% and improved customer satisfaction with AI-powered automated support",
      channels: ["channel-2", "channel-1", "channel-3"],
      products: ["product-inbox", "product-ai-assist"]
    }
  ],
  healthcare: [
    {
      id: "use-case-1",
      title: "Appointment reminders",
      benefit: "Reduced no-show rates by 30% with automated appointment reminders",
      channels: ["channel-1", "channel-4"],
      products: ["product-api", "product-flow"]
    },
    {
      id: "use-case-2",
      title: "Test results notifications",
      benefit: "Improved patient satisfaction by 45% with secure, timely test result notifications",
      channels: ["channel-1", "channel-3"],
      products: ["product-api"]
    },
    {
      id: "use-case-3",
      title: "Health tips & wellness programs",
      benefit: "Increased patient engagement by 60% through automated health tips and programs",
      channels: ["channel-2", "channel-3"],
      products: ["product-campaigns"]
    },
    {
      id: "use-case-4",
      title: "Emergency alerts",
      benefit: "Improved patient safety with instant emergency notifications reaching 99% of recipients within seconds",
      channels: ["channel-1", "channel-4"],
      products: ["product-api"]
    }
  ],
  finance: [
    {
      id: "use-case-1",
      title: "Transaction alerts",
      benefit: "Increased customer trust with 95% faster fraud detection and real-time alerts",
      channels: ["channel-1", "channel-4"],
      products: ["product-api"]
    },
    {
      id: "use-case-2",
      title: "Account security notifications",
      benefit: "Prevented fraudulent transactions worth $2M+ with instant security notifications",
      channels: ["channel-1", "channel-4"],
      products: ["product-api"]
    },
    {
      id: "use-case-3",
      title: "Payment reminders",
      benefit: "Reduced late payments by 50% through automated payment reminders",
      channels: ["channel-2", "channel-1", "channel-3"],
      products: ["product-flow"]
    },
    {
      id: "use-case-4",
      title: "Financial advice & updates",
      benefit: "Increased customer engagement by 55% with personalized financial insights and market updates",
      channels: ["channel-2", "channel-1", "channel-3"],
      products: ["product-campaigns"]
    }
  ],
  education: [
    {
      id: "use-case-1",
      title: "Class schedules & updates",
      benefit: "Improved attendance by 35% with timely schedule change notifications",
      channels: ["channel-2", "channel-1"],
      products: ["product-api", "product-flow"]
    },
    {
      id: "use-case-2",
      title: "Assignment reminders",
      benefit: "Increased on-time submission rate by 40% through automated deadline reminders",
      channels: ["channel-3", "channel-5"],
      products: ["product-flow"]
    },
    {
      id: "use-case-3",
      title: "Parent-teacher communication",
      benefit: "Enhanced parent engagement by 55% with automated grade and attendance updates",
      channels: ["channel-2", "channel-1"],
      products: ["product-inbox"]
    },
    {
      id: "use-case-4",
      title: "Event notifications",
      benefit: "Increased event attendance by 40% with timely notifications and reminder campaigns",
      channels: ["channel-2", "channel-1", "channel-3"],
      products: ["product-campaigns"]
    }
  ],
  retail: [
    {
      id: "use-case-1",
      title: "Promotional campaigns",
      benefit: "Boosted sales by 20% during seasonal campaigns through targeted messaging",
      channels: ["channel-2", "channel-1"],
      products: ["product-campaigns"]
    },
    {
      id: "use-case-2",
      title: "Loyalty program updates",
      benefit: "Increased customer retention by 50% with automated points updates and personalized offers",
      channels: ["channel-1", "channel-3"],
      products: ["product-api"]
    },
    {
      id: "use-case-3",
      title: "In-store pickup notifications",
      benefit: "Reduced wait times by 60% with automated pickup notifications",
      channels: ["channel-1"],
      products: ["product-api"]
    },
    {
      id: "use-case-4",
      title: "Customer feedback collection",
      benefit: "Improved product quality with 3x more customer feedback collected through automated surveys",
      channels: ["channel-2", "channel-1", "channel-3"],
      products: ["product-inbox"]
    }
  ],
  technology: [
    {
      id: "use-case-1",
      title: "Product updates & releases",
      benefit: "Increased feature adoption by 65% with timely release notifications",
      channels: ["channel-2", "channel-3"],
      products: ["product-campaigns"]
    },
    {
      id: "use-case-2",
      title: "User onboarding sequences",
      benefit: "Improved activation rate by 45% with automated welcome sequences and feature tours",
      channels: ["channel-3", "channel-5"],
      products: ["product-flow"]
    },
    {
      id: "use-case-3",
      title: "Technical support tickets",
      benefit: "Reduced support ticket volume by 50% with AI-powered automated support",
      channels: ["channel-2", "channel-5"],
      products: ["product-inbox", "product-ai-assist"]
    },
    {
      id: "use-case-4",
      title: "Feature announcements",
      benefit: "Increased feature adoption by 65% with timely release notifications",
      channels: ["channel-2", "channel-3"],
      products: ["product-campaigns"]
    }
  ]
};

// Use case interface
interface UseCase {
  text: string;
  products: string[];
}

// Industry template interface
export interface IndustryTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  useCases: UseCase[];
  channels: string[];
  goals: string[];
  teamSize: string;
  industry: string;
}

// Predefined industry templates
export const industryTemplates: IndustryTemplate[] = [
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Online retail and marketplace businesses",
    icon: "🛒",
    useCases: [
      { text: "Order confirmations & shipping updates", products: ["product-api"] },
      { text: "Abandoned cart recovery", products: ["product-api"] },
      { text: "Product recommendations", products: ["product-campaigns"] },
      { text: "Customer support automation", products: ["product-inbox", "product-ai-assist"] }
    ],
    channels: ["channel-2", "channel-1", "channel-3"],
    goals: ["goal-1", "goal-2", "goal-4"],
    teamSize: "team-3",
    industry: "industry-1"
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Medical facilities and health services",
    icon: "🏥",
    useCases: [
      { text: "Appointment reminders", products: ["product-api", "product-flow"] },
      { text: "Test results notifications", products: ["product-api"] },
      { text: "Health tips & wellness programs", products: ["product-campaigns"] },
      { text: "Emergency alerts", products: ["product-api"] }
    ],
    channels: ["channel-2", "channel-1", "channel-4"],
    goals: ["goal-1", "goal-5"],
    teamSize: "team-4",
    industry: "industry-2"
  },
  {
    id: "finance",
    name: "Finance & Banking",
    description: "Financial institutions and fintech",
    icon: "💰",
    useCases: [
      { text: "Transaction alerts", products: ["product-api"] },
      { text: "Account security notifications", products: ["product-api"] },
      { text: "Payment reminders", products: ["product-flow"] },
      { text: "Financial advice & updates", products: ["product-campaigns"] }
    ],
    channels: ["channel-2", "channel-1", "channel-3", "channel-4"],
    goals: ["goal-1", "goal-5"],
    teamSize: "team-5",
    industry: "industry-3"
  },
  {
    id: "education",
    name: "Education",
    description: "Schools, universities, and e-learning platforms",
    icon: "🎓",
    useCases: [
      { text: "Class schedules & updates", products: ["product-api", "product-flow"] },
      { text: "Assignment reminders", products: ["product-flow"] },
      { text: "Parent-teacher communication", products: ["product-inbox"] },
      { text: "Event notifications", products: ["product-campaigns"] }
    ],
    channels: ["channel-2", "channel-1", "channel-3", "channel-5"],
    goals: ["goal-1", "goal-5"],
    teamSize: "team-3",
    industry: "industry-4"
  },
  {
    id: "retail",
    name: "Retail",
    description: "Physical stores and retail chains",
    icon: "🏪",
    useCases: [
      { text: "Promotional campaigns", products: ["product-campaigns"] },
      { text: "Loyalty program updates", products: ["product-api"] },
      { text: "In-store pickup notifications", products: ["product-api"] },
      { text: "Customer feedback collection", products: ["product-inbox"] }
    ],
    channels: ["channel-2", "channel-1", "channel-3"],
    goals: ["goal-1", "goal-2", "goal-4"],
    teamSize: "team-3",
    industry: "industry-6"
  },
  {
    id: "technology",
    name: "Technology & SaaS",
    description: "Software companies and tech startups",
    icon: "💻",
    useCases: [
      { text: "Product updates & releases", products: ["product-campaigns"] },
      { text: "User onboarding sequences", products: ["product-flow"] },
      { text: "Technical support tickets", products: ["product-inbox", "product-ai-assist"] },
      { text: "Feature announcements", products: ["product-campaigns"] }
    ],
    channels: ["channel-2", "channel-3", "channel-5"],
    goals: ["goal-1", "goal-2", "goal-3"],
    teamSize: "team-2",
    industry: "industry-5"
  }
];

interface OnboardingTemplateSelectionProps {
  onTemplateSelect: (template: IndustryTemplate) => void;
  onStartFromScratch: () => void;
  onCustomIndustry?: (industryName: string) => void;
  inlineMode?: boolean;
  selectedTemplate?: IndustryTemplate | null;
  customIndustryName?: string;
  onClear?: () => void;
  wizardCardRef?: React.RefObject<HTMLElement | HTMLDivElement | null>;
}

export function OnboardingTemplateSelection({ 
  onTemplateSelect, 
  onStartFromScratch,
  onCustomIndustry,
  inlineMode = false,
  selectedTemplate: externalSelectedTemplate,
  customIndustryName: externalCustomIndustryName,
  onClear,
  wizardCardRef
}: OnboardingTemplateSelectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [internalSelectedTemplate, setInternalSelectedTemplate] = useState<IndustryTemplate | null>(null)
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [internalCustomIndustryName, setInternalCustomIndustryName] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const overviewCardRef = useRef<HTMLDivElement>(null)
  const selectButtonRef = useRef<HTMLButtonElement>(null)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Use external state if in inline mode, otherwise use internal state
  const selectedTemplate = inlineMode ? externalSelectedTemplate : internalSelectedTemplate
  const customIndustryName = inlineMode ? externalCustomIndustryName : internalCustomIndustryName

  // Filter templates based on search
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return industryTemplates
    const query = searchQuery.toLowerCase()
    return industryTemplates.filter(
      template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.useCases.some(uc => uc.text.toLowerCase().includes(query))
    )
  }, [searchQuery])

  // Position the floating overview popover - responsive for both inline and full page modes
  useEffect(() => {
    if (selectedTemplate && overviewCardRef.current) {
      const updatePosition = () => {
        const viewportWidth = window.innerWidth
        const isMobile = viewportWidth < 1024 // lg breakpoint
        
        if (isMobile && inlineMode) {
          // Mobile + inline mode: Position below the wizard card (using fixed positioning for portal)
          if (wizardCardRef?.current && overviewCardRef.current) {
            const cardRect = wizardCardRef.current.getBoundingClientRect()
            const gap = 16 // gap-4 = 16px
            const padding = 16 // Match card padding
            
            overviewCardRef.current.style.position = 'fixed'
            overviewCardRef.current.style.left = `${Math.max(padding, cardRect.left)}px`
            overviewCardRef.current.style.top = `${cardRect.bottom + gap}px`
            overviewCardRef.current.style.width = `${Math.min(cardRect.width, viewportWidth - (padding * 2))}px`
            overviewCardRef.current.style.right = 'auto'
            overviewCardRef.current.style.maxWidth = `${viewportWidth - (padding * 2)}px`
          }
        } else if (isMobile) {
          // Mobile + full page mode: Static positioning (handled by CSS)
          overviewCardRef.current!.style.position = ''
          overviewCardRef.current!.style.left = ''
          overviewCardRef.current!.style.top = ''
          overviewCardRef.current!.style.right = ''
          overviewCardRef.current!.style.width = ''
        } else {
          // Desktop/LG: Fixed positioning
          // Try to get wizard card ref first (inline mode), then select button, then Card container
          let referenceElement: HTMLElement | null = null
          
          if (inlineMode) {
            referenceElement = wizardCardRef?.current || selectButtonRef.current
          } else {
            // Full page mode: Find the Card container
            const cardContainer = overviewCardRef.current?.closest('.min-h-screen')?.querySelector('[class*="max-w-xl"]') as HTMLElement
            referenceElement = cardContainer || selectButtonRef.current
          }
          
          if (referenceElement && overviewCardRef.current) {
            const referenceRect = referenceElement.getBoundingClientRect()
            const gap = 16 // gap-4 = 16px
            const cardWidth = 360
            const padding = 16
            
            overviewCardRef.current.style.position = 'fixed'
            const leftPosition = referenceRect.right + gap
            const maxLeft = viewportWidth - cardWidth - padding
            const finalLeft = Math.min(leftPosition, maxLeft)
            
            overviewCardRef.current.style.left = `${finalLeft}px`
            overviewCardRef.current.style.top = `${referenceRect.top}px`
            overviewCardRef.current.style.right = 'auto'
            overviewCardRef.current.style.width = `${cardWidth}px`
          }
        }
      }
      updatePosition()
      window.addEventListener('scroll', updatePosition, { passive: true })
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [selectedTemplate, wizardCardRef, inlineMode])


  const handleTemplateSelect = (template: IndustryTemplate) => {
    if (inlineMode) {
      onTemplateSelect(template)
    } else {
      setInternalSelectedTemplate(template)
    }
    setShowOtherInput(false)
    if (!inlineMode) {
      setInternalCustomIndustryName("")
    }
    setIsOpen(false)
  }

  const handleOtherSelect = () => {
    setShowOtherInput(true)
    if (inlineMode && onClear) {
      onClear()
    } else {
      setInternalSelectedTemplate(null)
    }
    setIsOpen(false)
  }

  const handleCustomIndustryChange = (value: string) => {
    if (inlineMode && onCustomIndustry) {
      onCustomIndustry(value)
    } else {
      setInternalCustomIndustryName(value)
    }
  }

  const handleClearSelection = () => {
    if (inlineMode && onClear) {
      onClear()
    } else {
      setInternalSelectedTemplate(null)
    }
    setShowOtherInput(false)
    if (!inlineMode) {
      setInternalCustomIndustryName("")
    }
  }

  const content = (
    <div className={cn("space-y-4", inlineMode && "w-full")}>
      {!inlineMode && (
        <>
          {/* Header - Only show in full page mode */}
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Welcome to Cequens!</h1>
            <p className="text-sm text-muted-foreground">
              Choose a template that matches your industry or start from scratch to customize everything.
            </p>
          </div>
        </>
      )}

      {/* Industry Select */}
      <div ref={selectRef} className="relative">
        <Field>
          <FieldLabel>Select your industry</FieldLabel>
          <FieldContent>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  ref={selectButtonRef}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <span className="flex items-center gap-2">
                    {selectedTemplate ? (
                      <>
                        <span>{selectedTemplate.icon}</span>
                        <span>{selectedTemplate.name}</span>
                      </>
                    ) : showOtherInput ? (
                      <span>Other</span>
                    ) : (
                      <span className="text-muted-foreground">Select an industry...</span>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <div className="flex flex-col">
                  {/* Search input */}
                  <div className="p-2 border-b border-border">
                    <Field>
                      <FieldContent>
                        <InputGroup className="border-0 bg-background focus-visible:ring-0 focus-visible:ring-offset-0">
                          <InputGroupAddon>
                            <Search className="h-4 w-4" />
                          </InputGroupAddon>
                          <InputGroupInput
                            placeholder="Search industries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                          />
                        </InputGroup>
                      </FieldContent>
                    </Field>
                  </div>

                  {/* Options list */}
                  <div className="max-h-[300px] overflow-y-auto">
                    {filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent transition-colors",
                          selectedTemplate?.id === template.id && "bg-accent"
                        )}
                      >
                        <span className="text-xl">{template.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{template.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {template.description}
                          </div>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}

                    {/* Other option */}
                    <div
                      onClick={handleOtherSelect}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent transition-colors border-t border-border",
                        showOtherInput && "bg-accent"
                      )}
                    >
                      <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Other</div>
                        <div className="text-xs text-muted-foreground">
                          Your industry not listed? Type it here
                        </div>
                      </div>
                      {showOtherInput && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </FieldContent>
        </Field>
      </div>

      {/* Custom Industry Input */}
      {showOtherInput && (
        <div className="mt-3 space-y-2">
          <InputGroup>
            <InputGroupInput
              type="text"
              placeholder="e.g., Real Estate, Manufacturing, Consulting..."
              value={customIndustryName || ""}
              onChange={(e) => handleCustomIndustryChange(e.target.value)}
              className="w-full"
              autoFocus
            />
          </InputGroup>
        </div>
      )}

      {/* Continue Button - Only show in full page mode */}
      {!inlineMode && (selectedTemplate || (showOtherInput && customIndustryName?.trim())) && (
        <div className="flex justify-end pt-2">
          <Button
            onClick={() => {
              if (selectedTemplate) {
                onTemplateSelect(selectedTemplate)
              } else if (showOtherInput && customIndustryName?.trim() && onCustomIndustry) {
                onCustomIndustry(customIndustryName.trim())
              } else {
                onStartFromScratch()
              }
            }}
            className="flex items-center"
          >
            Continue
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )

  // Render popover component (shared for both modes)
  const renderPopover = () => {
    if (!selectedTemplate) return null

    const popoverContent = (
      <div 
        ref={overviewCardRef}
        className={cn(
          "z-50 flex flex-col gap-4",
          // Desktop: fixed positioning, floating on right
          "lg:fixed lg:w-[360px]",
          // Mobile: fixed positioning when in inline mode (portal), static otherwise
          inlineMode ? "fixed lg:fixed" : "mt-4 lg:mt-0"
        )}
      >
        {/* Desktop: Card wrapper, Mobile: Card component */}
        <div className={cn(
          "bg-card rounded-md border border-border",
          "p-4",
          // Mobile uses Card component styling
          "lg:p-4"
        )}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={smoothTransition}
            className="space-y-4"
          >
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedTemplate.icon}</span>
                <div>
                  <h3 className={cn(
                    "font-semibold",
                    "text-base"
                  )}>
                    {selectedTemplate.name}
                  </h3>
                  <p className={cn(
                    "text-muted-foreground line-clamp-1",
                    "text-sm"
                  )}>
                    {selectedTemplate.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Use Cases & Benefits */}
            {clientBenefitsByIndustry[selectedTemplate.id] && (
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "font-semibold text-foreground",
                    "text-sm"
                  )}>
                    Use cases &
                  </p>
                  <span className={cn(
                    "rounded bg-primary/10 text-primary font-semibold",
                    "px-1.5 py-0.5 text-xs"
                  )}>
                    Product
                  </span>
                </div>
                <div className="space-y-2">
                  {clientBenefitsByIndustry[selectedTemplate.id].map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-2 rounded-md bg-muted/40 border border-border",
                        "text-sm"
                      )}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <Check className={cn(
                          "text-primary mt-0.5 flex-shrink-0",
                          "w-3.5 h-3.5"
                        )} />
                        <p className={cn(
                          "font-medium text-foreground",
                          "text-sm"
                        )}>{item.title}</p>
                      </div>
                      {item.benefit && (
                        <p className={cn(
                          "text-muted-foreground mt-1 ml-5",
                          "text-sm"
                        )}>{item.benefit}</p>
                      )}
                      {item.products.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-1.5 ml-5">
                          {item.products.map((productId) => {
                            const product = productIcons[productId]
                            return product ? (
                              <span
                                key={productId}
                                className={cn(
                                  "rounded text-primary font-medium",
                                  "px-1.5 py-0.5 text-xs"
                                )}
                                title={product.label}
                              >
                                {product.label}
                              </span>
                            ) : null
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Most Common Channels */}
            {selectedTemplate.channels && selectedTemplate.channels.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-border">
                <p className={cn(
                  "font-semibold text-foreground",
                  "text-sm"
                )}>
                  Most commonly used channels
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.channels.map((channelId) => {
                    const channel = channelIcons[channelId]
                    return channel ? (
                      <div
                        key={channelId}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1.5 rounded-md",
                          "text-sm"
                        )}
                      >
                        {channel.icon}
                        <span className="text-foreground font-medium">
                          {channel.label}
                        </span>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Alert - Relative to popover with gap-4 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={smoothTransition}
        >
          <Alert 
            variant={inlineMode ? "default" : "default"} 
            className={cn(
              "text-sm"
            )}
          >
            <Info className="w-4 h-4" />
            <AlertDescription>
              Selecting your industry helps us recommend relevant use cases and products tailored to your needs. You can access and use all of our products regardless of your selection.
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    )

    // On mobile in inline mode, render via portal to position outside the card
    if (inlineMode && isMobile && typeof window !== 'undefined') {
      return createPortal(popoverContent, document.body)
    }

    return popoverContent
  }

  // In inline mode, return content with popover
  if (inlineMode) {
    return (
      <>
        {content}
        {renderPopover()}
      </>
    )
  }

  // In full page mode, return with card and layout
  return (
    <div className="min-h-screen bg-layout flex items-start justify-center p-4 pt-16">
      <div className="w-full max-w-xl">
        <Card className="bg-card rounded-lg overflow-hidden">
          <CardContent className="p-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={smoothTransition}
            >
              {content}
            </motion.div>
          </CardContent>
        </Card>

        {/* Responsive Industry Overview Popover */}
        {renderPopover()}
      </div>
    </div>
  )
}