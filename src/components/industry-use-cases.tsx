import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, ArrowRight, Inbox, Code, Sparkles, Workflow, Megaphone, Bot } from "lucide-react"
import { EnvelopeSimple, ChatText, Phone as PhoneIcon, Bell } from "phosphor-react"
import { cn } from "@/lib/utils"

interface UseCaseItem {
  id: string
  title: string
  benefit?: string
  channels: string[]
  products: string[]
}

// Product information with descriptions and visuals
interface ProductInfo {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  gradient: string
  ctaText: string
  ctaLink: string
}

const productInfo: Record<string, ProductInfo> = {
  "product-inbox": {
    id: "product-inbox",
    name: "Inbox",
    description: "Enhance your customer support with a unified inbox",
    icon: <Inbox className="w-8 h-8" />,
    gradient: "from-blue-500 to-cyan-500",
    ctaText: "Open Inbox",
    ctaLink: "/messages"
  },
  "product-api": {
    id: "product-api",
    name: "API",
    description: "Build powerful integrations with our messaging API",
    icon: <Code className="w-8 h-8" />,
    gradient: "from-purple-500 to-pink-500",
    ctaText: "View API Docs",
    ctaLink: "/developer"
  },
  "product-ai-assist": {
    id: "product-ai-assist",
    name: "AI Assist",
    description: "Automate customer interactions with AI-powered assistance",
    icon: <Bot className="w-8 h-8" />,
    gradient: "from-green-500 to-emerald-500",
    ctaText: "Set Up AI Assist",
    ctaLink: "/automation/ai-assist"
  },
  "product-flow": {
    id: "product-flow",
    name: "Flow",
    description: "Create automated workflows for seamless communication",
    icon: <Workflow className="w-8 h-8" />,
    gradient: "from-orange-500 to-red-500",
    ctaText: "Create Flow",
    ctaLink: "/automation/flows"
  },
  "product-campaigns": {
    id: "product-campaigns",
    name: "Campaigns",
    description: "Launch targeted campaigns to engage your audience",
    icon: <Megaphone className="w-8 h-8" />,
    gradient: "from-indigo-500 to-blue-500",
    ctaText: "Create Campaign",
    ctaLink: "/campaigns"
  }
}

// Catchy titles for each product by industry
const getProductTitle = (productId: string, industry: string): string => {
  const titles: Record<string, Record<string, string>> = {
    "product-inbox": {
      ecommerce: "Enhance customer support",
      healthcare: "Streamline patient communication",
      finance: "Secure customer interactions",
      education: "Connect with students & parents",
      retail: "Deliver exceptional service",
      technology: "Scale support operations"
    },
    "product-api": {
      ecommerce: "Automate order updates",
      healthcare: "Send secure notifications",
      finance: "Real-time transaction alerts",
      education: "Automate communications",
      retail: "Power loyalty programs",
      technology: "Build integrations"
    },
    "product-ai-assist": {
      ecommerce: "Automate support 24/7",
      healthcare: "Intelligent patient assistance",
      finance: "Smart fraud detection",
      education: "Automated Q&A support",
      retail: "Instant customer help",
      technology: "AI-powered support"
    },
    "product-flow": {
      ecommerce: "Automate workflows",
      healthcare: "Streamline appointments",
      finance: "Automate reminders",
      education: "Schedule communications",
      retail: "Automate campaigns",
      technology: "Build workflows"
    },
    "product-campaigns": {
      ecommerce: "Boost sales",
      healthcare: "Engage patients",
      finance: "Personalize messaging",
      education: "Increase engagement",
      retail: "Drive conversions",
      technology: "Announce features"
    }
  }
  
  return titles[productId]?.[industry] || `Use ${productInfo[productId]?.name || "Product"}`
}

// Channel icon mapping
const channelIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  "channel-1": { icon: <ChatText weight="fill" className="w-4 h-4 text-muted-foreground" />, label: "SMS" },
  "channel-2": { icon: <img src="/icons/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4" />, label: "WhatsApp" },
  "channel-3": { icon: <EnvelopeSimple weight="fill" className="w-4 h-4 text-muted-foreground" />, label: "Email" },
  "channel-4": { icon: <PhoneIcon weight="fill" className="w-4 h-4 text-muted-foreground" />, label: "Voice" },
  "channel-5": { icon: <img src="/icons/Messenger.png" alt="Messenger" className="w-4 h-4" />, label: "Messenger" },
  "channel-6": { icon: <img src="/icons/Instagram.svg" alt="Instagram" className="w-4 h-4" />, label: "Instagram" },
  "channel-7": { icon: <Bell weight="fill" className="w-4 h-4 text-muted-foreground" />, label: "Push Notifications" },
}

// Use cases with benefits per industry
const clientBenefitsByIndustry: Record<string, UseCaseItem[]> = {
  ecommerce: [
    {
      id: "use-case-1",
      title: "Order & shipping updates",
      benefit: "Reduced customer support inquiries by 40% with automated order tracking",
      channels: ["channel-1", "channel-2", "channel-3"],
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
      channels: ["channel-1", "channel-2", "channel-3"],
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
      channels: ["channel-1", "channel-2", "channel-3"],
      products: ["product-flow"]
    },
    {
      id: "use-case-4",
      title: "Financial advice & updates",
      benefit: "Increased customer engagement by 55% with personalized financial insights and market updates",
      channels: ["channel-1", "channel-2", "channel-3"],
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
      channels: ["channel-1", "channel-2", "channel-3"],
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
      channels: ["channel-1", "channel-2", "channel-3"],
      products: ["product-inbox"]
    }
  ],
  technology: [
    {
      id: "use-case-1",
      title: "Product updates & releases",
      benefit: "Increased feature adoption by 65% with timely release notifications",
      channels: ["channel-3", "channel-2"],
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
      channels: ["channel-3", "channel-2"],
      products: ["product-campaigns"]
    }
  ]
}

interface IndustryUseCasesProps {
  industry: string
  isLoading?: boolean
}

export function IndustryUseCases({ industry, isLoading = false }: IndustryUseCasesProps) {
  const [activeProductIndex, setActiveProductIndex] = React.useState(0)
  
  // Get use cases for the industry
  const useCases = clientBenefitsByIndustry[industry] || clientBenefitsByIndustry.ecommerce
  
  // Group use cases by product
  const productsWithUseCases = React.useMemo(() => {
    const productMap = new Map<string, UseCaseItem[]>()
    
    useCases.forEach((useCase) => {
      useCase.products.forEach((productId) => {
        if (!productMap.has(productId)) {
          productMap.set(productId, [])
        }
        productMap.get(productId)!.push(useCase)
      })
    })
    
    // Convert to array and filter to only include products that have info
    return Array.from(productMap.entries())
      .filter(([productId]) => productInfo[productId])
      .map(([productId, useCases]) => ({
        product: productInfo[productId],
        useCases
      }))
  }, [useCases])
  
  const goToProduct = (index: number) => {
    if (index >= 0 && index < productsWithUseCases.length) {
      setActiveProductIndex(index)
    }
  }
  
  const goToNext = () => {
    setActiveProductIndex((prev) => (prev + 1) % productsWithUseCases.length)
  }
  
  const goToPrevious = () => {
    setActiveProductIndex((prev) => (prev - 1 + productsWithUseCases.length) % productsWithUseCases.length)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Skeleton className="h-48 w-full rounded-t-xl" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (productsWithUseCases.length === 0) {
    return null
  }

  const activeProduct = productsWithUseCases[activeProductIndex]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="overflow-hidden py-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProductIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Visual Banner */}
            <div className="relative h-32 bg-muted flex items-center justify-center">
              <div className="text-muted-foreground">
                {activeProduct.product.icon}
              </div>
            </div>

            <CardContent className="px-4 pt-4 space-y-4">
              {/* Product Info */}
              <div>
                <h3 className="text-md font-semibold">
                  {activeProduct.product.description}
                </h3>
              </div>

              {/* Use Cases */}
              {activeProduct.useCases.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Use Cases
                  </h4>
                  <div className="space-y-2">
                    {activeProduct.useCases.slice(0, 3).map((useCase) => (
                      <div key={useCase.id} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight">
                            {useCase.title}
                          </p>
                          {useCase.benefit && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {useCase.benefit}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Link */}
              <a
                href={activeProduct.product.ctaLink}
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                {activeProduct.product.ctaText}
                <ChevronRight className="ml-2 h-4 w-4" />
              </a>
            </CardContent>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation */}
        {productsWithUseCases.length > 1 && (
          <div className="border-t border-border p-3">
            <div className="flex items-center justify-between">
              {/* Previous Button */}
              <button
                type="button"
                onClick={goToPrevious}
                className="p-1.5 rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={productsWithUseCases.length <= 1}
              >
                <ChevronLeft className="h-4 w-4 text-foreground cursor-pointer" />
              </button>

              {/* Indicators */}
              <div className="flex items-center gap-1.5">
                {productsWithUseCases.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goToProduct(index)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      index === activeProductIndex
                        ? "w-6 bg-primary"
                        : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    aria-label={`Go to product ${index + 1}`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={goToNext}
                className="p-1.5 rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={productsWithUseCases.length <= 1}
              >
                <ChevronRight className="h-4 w-4 text-foreground cursor-pointer" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
