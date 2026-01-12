import * as React from "react"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles,
  Minimize2,
  Maximize2,
  Check, 
  ChevronDown,
  ChevronRight, 
  Users, 
  Send,
  Settings,
  Lock,
  Code,
  Briefcase,
  BookOpen,
  Terminal,
  Key,
  Webhook,
  FileCode
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { hasActiveChannels } from "@/lib/channel-utils"
import { useAuth } from "@/hooks/use-auth"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Define setup step interface
interface SetupStep {
  id: string
  title: string
  description: string
  completed: boolean
  icon?: React.ReactNode
  action?: {
    label: string
    href: string
  }
}

// Persona type
export type Persona = "business" | "api"

// Props interface for floating widget
interface GettingStartedGuideFloatingProps {
  industry?: string
  channels?: string[]
  goals?: string[]
  persona?: Persona
  onDismiss?: () => void
}

export function GettingStartedGuideFloating({ 
  industry = "ecommerce",
  channels = [],
  goals = [],
  persona: initialPersona = "business",
  onDismiss
}: GettingStartedGuideFloatingProps) {
  const { user } = useAuth()
  
  // Persona state with localStorage persistence
  const STORAGE_KEY_PERSONA = 'cequens-setup-guide-persona'
  const [persona, setPersona] = useState<Persona>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PERSONA)
      return (saved === "business" || saved === "api") ? saved : initialPersona
    } catch {
      return initialPersona
    }
  })

  // Save persona to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PERSONA, persona)
    } catch (error) {
      console.error('Failed to save persona:', error)
    }
  }, [persona])

  // Sync persona from localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_PERSONA)
        if (saved === "business" || saved === "api") {
          setPersona(saved)
        }
      } catch {
        // Ignore errors
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    // Also check on interval to catch local changes
    const interval = setInterval(handleStorageChange, 500)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Get user's first name
  const userName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Demo'

  // LocalStorage keys - persona-specific
  const STORAGE_KEY_MINIMIZED = `cequens-setup-guide-minimized-${persona}`
  const STORAGE_KEY_COMPLETED = `cequens-setup-guide-completed-steps-${persona}`
  const STORAGE_KEY_EXPANDED = `cequens-setup-guide-expanded-steps-${persona}`

  const [isMinimized, setIsMinimized] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MINIMIZED)
      return saved === 'true'
    } catch {
      return false
    }
  })

  const [completedSteps, setCompletedSteps] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLETED)
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const savedSteps = new Set<string>(parsed)
        // Automatically mark step-1 as completed if any channel is active (only for business persona)
        if (persona === "business" && hasActiveChannels()) {
          savedSteps.add("step-1")
        }
        return savedSteps
      } else {
        const steps = new Set<string>()
        // Automatically mark step-1 as completed if any channel is active (only for business persona)
        if (persona === "business" && hasActiveChannels()) {
          steps.add("step-1")
        }
        return steps
      }
    } catch {
      const steps = new Set<string>()
      // Automatically mark step-1 as completed if any channel is active (only for business persona)
      if (persona === "business" && hasActiveChannels()) {
        steps.add("step-1")
      }
      return steps
    }
  })

  // Initialize expanded steps - always start fresh, don't load from localStorage
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(() => {
    return new Set()
  })

  // Calculate progress
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)

  // Calculate total steps based on persona and industry
  useEffect(() => {
    // Business persona: 5 steps for ecommerce (3 + 0 + 2), 8 steps for others (3 + 3 + 2)
    // API persona: 9 steps (3 + 3 + 3)
    const total = persona === "business" 
      ? (industry === "ecommerce" ? 5 : 8)
      : 9
    setTotalSteps(total)
  }, [persona, industry])

  // Save completed steps to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(Array.from(completedSteps)))
    } catch (error) {
      console.error('Failed to save completed steps:', error)
    }
  }, [completedSteps, persona])

  // Listen for active channels changes and update step-1 completion (only for business persona)
  useEffect(() => {
    if (persona !== "business") return

    const handleActiveChannelsChange = () => {
      const hasActive = hasActiveChannels()
      setCompletedSteps(prev => {
        const newSet = new Set(prev)
        if (hasActive) {
          newSet.add("step-1")
        } else {
          newSet.delete("step-1")
        }
        return newSet
      })
    }

    window.addEventListener('activeChannelsChanged', handleActiveChannelsChange)
    // Check on mount as well
    handleActiveChannelsChange()
    
    return () => {
      window.removeEventListener('activeChannelsChanged', handleActiveChannelsChange)
    }
  }, [persona])

  // Reset completed steps when persona changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLETED)
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const savedSteps = new Set<string>(parsed)
        // Only auto-mark step-1 for business persona
        if (persona === "business" && hasActiveChannels()) {
          savedSteps.add("step-1")
        }
        setCompletedSteps(savedSteps)
      } else {
        const steps = new Set<string>()
        if (persona === "business" && hasActiveChannels()) {
          steps.add("step-1")
        }
        setCompletedSteps(steps)
      }
    } catch {
      const steps = new Set<string>()
      if (persona === "business" && hasActiveChannels()) {
        steps.add("step-1")
      }
      setCompletedSteps(steps)
    }
  }, [persona])

  // Update progress from localStorage
  useEffect(() => {
    const updateProgress = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_COMPLETED)
        if (saved) {
          const parsed = JSON.parse(saved) as string[]
          const completed = parsed.length
          setCompletedCount(completed)
          const percentage = totalSteps > 0 ? Math.round((completed / totalSteps) * 100) : 0
          setProgressPercentage(percentage)
        } else {
          setCompletedCount(0)
          setProgressPercentage(0)
        }
      } catch {
        setCompletedCount(0)
        setProgressPercentage(0)
      }
    }

    updateProgress()
    
    // Listen for storage changes
    const handleStorageChange = () => {
      updateProgress()
    }
    
    window.addEventListener('storage', handleStorageChange)
    // Also check on interval to catch local changes
    const interval = setInterval(updateProgress, 500)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [totalSteps, STORAGE_KEY_COMPLETED])

  // Save minimized state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MINIMIZED, String(isMinimized))
    } catch (error) {
      console.error('Failed to save minimized state:', error)
    }
  }, [isMinimized, persona])

  // Generate personalized setup steps based on persona, industry and selections
  const setupSteps: SetupStep[] = React.useMemo(() => {
    const steps: SetupStep[] = []

    if (persona === "business") {
      // BUSINESS PERSONA (MARKETEER) STEPS
      
      // Step 1: Configure your channel
      steps.push({
        id: "step-1",
        title: "Configure your channel",
        description: "Set up messaging channels with authentication credentials and API settings for business.",
        icon: <Send className="w-5 h-5" />,
        completed: false,
        action: {
          label: "Configure channels",
          href: "/channels"
        }
      })

      // Step 2: Add your audience
      steps.push({
        id: "step-2",
        title: "Add your audience",
        description: "Import contacts from CSV or CRM, or add manually to create segments.",
        icon: <Users className="w-5 h-5" />,
        completed: false,
        action: {
          label: "Add contacts",
          href: "/contacts"
        }
      })

      // Step 3: Send your campaign
      steps.push({
        id: "step-3",
        title: "Send your first campaign",
        description: "Create personalized campaigns with dynamic content, schedule delivery, and track metrics.",
        icon: <Send className="w-5 h-5" />,
        completed: false,
        action: {
          label: "Create campaign",
          href: "/campaigns/create"
        }
      })

      // Industry-specific steps for Business persona
      if (industry === "ecommerce") {
        // Removed: Connect your store, Set up abandoned cart recovery, Create order notification templates
        // Keeping only the 5 most important steps
      } else if (industry === "healthcare") {
        steps.push({
          id: "step-4",
          title: "Set up appointment reminders",
          description: "Send automated appointment reminders 24 hours and 2 hours before appointments with confirmation.",
          icon: <Settings className="w-5 h-5" />,
          completed: false,
          action: {
            label: "Configure automation",
            href: "/automation"
          }
        })
        steps.push({
          id: "step-5",
          title: "Create notification templates",
          description: "Create HIPAA-compliant templates for test results, prescriptions, medication reminders, and alerts.",
          icon: <Settings className="w-5 h-5" />,
          completed: false,
          action: {
            label: "Create templates",
            href: "/campaigns/templates"
          }
        })
        steps.push({
          id: "step-6",
          title: "Configure HIPAA compliance",
          description: "Configure HIPAA-compliant settings with encryption, access controls, audit logging, and authentication.",
          icon: <Settings className="w-5 h-5" />,
          completed: false,
          action: {
            label: "Security settings",
            href: "/settings/organization"
          }
        })
      } else if (industry === "finance") {
        steps.push({
          id: "step-4",
          title: "Set up transaction alerts",
          description: "Send real-time transaction alerts for deposits, withdrawals, transfers, and payments with details.",
          icon: <Settings className="w-5 h-5" />,
          completed: false,
          action: {
            label: "Configure automation",
            href: "/automation"
          }
        })
        steps.push({
          id: "step-5",
          title: "Enable two-factor authentication",
          description: "Implement two-factor authentication using OTP via SMS or WhatsApp for login verification.",
          icon: <Settings className="w-5 h-5" />,
          completed: false,
          action: {
            label: "Configure OTP",
            href: "/developer/apis/otp"
          }
        })
        steps.push({
          id: "step-6",
          title: "Create security notification templates",
          description: "Create security notification templates for suspicious activities, password changes, and fraud.",
          icon: <Settings className="w-5 h-5" />,
          completed: false,
          action: {
            label: "Create templates",
            href: "/campaigns/templates"
          }
        })
      } else {
        // Generic setup for other industries
        steps.push({
          id: "step-4",
          title: "Set up automation workflows",
          description: "Create automation workflows that trigger messages based on customer actions or events.",
          icon: <Settings className="w-5 h-5" />,
          completed: false,
          action: {
            label: "Configure automation",
            href: "/automation"
          }
        })
        steps.push({
          id: "step-5",
          title: "Create message templates",
          description: "Create reusable message templates with dynamic variables and media attachments for campaigns.",
          icon: <Settings className="w-5 h-5" />,
          completed: false,
          action: {
            label: "Create templates",
            href: "/campaigns/templates"
          }
        })
        steps.push({
          id: "step-6",
          title: "Configure integrations",
          description: "Connect CRM, help desk, analytics, and e-commerce platforms with webhooks and API.",
          icon: <Settings className="w-5 h-5" />,
          completed: false,
          action: {
            label: "Browse integrations",
            href: "/settings/plugins"
          }
        })
      }

      // Team collaboration steps
      steps.push({
        id: "step-7",
        title: "Add team members",
        description: "Invite team members to collaborate on campaigns and manage contacts with role-based access.",
        icon: <Users className="w-5 h-5" />,
        completed: false,
        action: {
          label: "Manage team",
          href: "/settings/organization"
        }
      })
      steps.push({
        id: "step-8",
        title: "Set up roles and permissions",
        description: "Configure role-based permissions for campaigns, contacts, templates, and analytics with roles.",
        icon: <Users className="w-5 h-5" />,
        completed: false,
        action: {
          label: "Configure roles",
          href: "/settings/organization"
        }
      })
    } else {
      // API PERSONA (DEVELOPER) STEPS
      
      // Step 1: Generate API Key
      steps.push({
        id: "step-1",
        title: "Generate API Key",
        description: "Generate API keys for authentication with separate keys for development and production.",
        icon: <Key className="w-5 h-5" />,
        completed: false,
        action: {
          label: "Get API Key",
          href: "/developer-apis"
        }
      })

      // Step 2: Review API Documentation
      steps.push({
        id: "step-2",
        title: "Review API Documentation",
        description: "Review API documentation for endpoints, request formats, authentication, and error handling.",
        icon: <BookOpen className="w-5 h-5" />,
        completed: false,
        action: {
          label: "View API Docs",
          href: "/developer-apis/docs"
        }
      })

      // Step 3: Test API Connection
      steps.push({
        id: "step-3",
        title: "Test API Connection",
        description: "Test API credentials and connection using testing tools, curl, or Postman to verify.",
        icon: <Terminal className="w-5 h-5" />,
        completed: false,
        action: {
          label: "Test Connection",
          href: "/developer-apis"
        }
      })

      // Step 4: Choose your API
      steps.push({
        id: "step-4",
        title: "Choose your API",
        description: "Choose from SMS, WhatsApp, Email, Voice, or Messenger APIs based on your use case.",
        icon: <Code className="w-5 h-5" />,
        completed: false,
        action: {
          label: "Browse APIs",
          href: "/developer-apis/listing"
        }
      })

      // Step 5: Set up webhooks
      steps.push({
        id: "step-5",
        title: "Set up webhooks",
        description: "Configure webhooks to receive real-time notifications for delivery status and receipts.",
        icon: <Webhook className="w-5 h-5" />,
        completed: false,
        action: {
          label: "Configure Webhooks",
          href: "/developer-apis/docs"
        }
      })

      // Step 6: Send your first API request
      steps.push({
        id: "step-6",
        title: "Send your first API request",
        description: "Send your first test message using API sandbox or production endpoints with handling.",
        icon: <Send className="w-5 h-5" />,
        completed: false,
        action: {
          label: "Try SMS API",
          href: "/developer-apis/sms"
        }
      })

      // Step 7: Explore SDKs and Libraries
      steps.push({
        id: "step-7",
        title: "Explore SDKs and Libraries",
        description: "Use official SDKs for JavaScript, Python, PHP, Java, Ruby, and Go with functions.",
        icon: <FileCode className="w-5 h-5" />,
        completed: false,
        action: {
          label: "View SDKs",
          href: "/developer-apis/docs"
        }
      })

      // Step 8: Set up OTP verification
      steps.push({
        id: "step-8",
        title: "Set up OTP verification",
        description: "Implement OTP verification for user authentication and 2FA with generation and validation.",
        icon: <Key className="w-5 h-5" />,
        completed: false,
        action: {
          label: "OTP API",
          href: "/developer-apis/otp"
        }
      })

      // Step 9: Configure rate limits
      steps.push({
        id: "step-9",
        title: "Configure rate limits",
        description: "Review rate limit policies for endpoints and implement handling with exponential backoff.",
        icon: <Settings className="w-5 h-5" />,
        completed: false,
        action: {
          label: "Rate Limits",
          href: "/developer-apis/docs"
        }
      })
    }

    return steps
  }, [industry, channels, persona])

  // Helper function to get step image name from step title
  function getStepImageName(stepTitle: string): string {
    // Convert title to filename: lowercase, replace spaces with hyphens, remove special chars
    const filename = stepTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
    return `${filename}.png`
  }

  // Helper function to check if a step is a goal step
  function isGoalStep(stepTitle: string): boolean {
    if (persona !== "business" || goals.length === 0) return false
    
    // Map goal IDs to step titles that should be tagged
    const goalStepMapping: Record<string, string[]> = {
      "goal-2": ["Send your first campaign"], // Marketing campaigns
      "goal-1": ["Add your audience", "Send your first campaign"], // Customer engagement
      "goal-3": ["Add your audience"], // Support automation
      "goal-4": ["Add your audience", "Send your first campaign"], // Lead generation
      "goal-6": ["Send your first campaign"], // Sales automation
      "goal-7": ["Add your audience", "Send your first campaign"], // Customer retention
      "goal-9": ["Configure your channel"], // Multi-channel messaging
    }
    
    // Check if any selected goal maps to this step title
    return goals.some(goalId => {
      const mappedSteps = goalStepMapping[goalId] || []
      return mappedSteps.includes(stepTitle)
    })
  }

  // Track if we've initialized expanded steps on this mount/persona
  const hasInitializedExpanded = React.useRef(false)
  
  // Reset initialization flag when persona changes
  useEffect(() => {
    hasInitializedExpanded.current = false
  }, [persona])
  
  // Initialize expanded steps - always expand first incomplete step on mount/refresh
  useEffect(() => {
    if (!hasInitializedExpanded.current && setupSteps.length > 0) {
      hasInitializedExpanded.current = true
      const firstIncomplete = setupSteps.find(step => !completedSteps.has(step.id))
      if (firstIncomplete) {
        setExpandedSteps(new Set([firstIncomplete.id]))
      } else {
        // If all steps are completed, expand the first one
        setExpandedSteps(new Set([setupSteps[0].id]))
      }
    }
  }, [setupSteps.length, completedSteps.size, persona])

  // Auto-expand next incomplete step when a step is completed (if the completed step was expanded)
  useEffect(() => {
    // Find any completed step that is currently expanded
    const expandedCompletedStep = setupSteps.find(step => 
      completedSteps.has(step.id) && expandedSteps.has(step.id)
    )
    
    if (expandedCompletedStep) {
      const currentIndex = setupSteps.findIndex(step => step.id === expandedCompletedStep.id)
      const nextIncomplete = setupSteps.slice(currentIndex + 1).find(step => !completedSteps.has(step.id))
      
      if (nextIncomplete) {
        setExpandedSteps(prev => {
          const newExpanded = new Set(prev)
          newExpanded.delete(expandedCompletedStep.id) // Collapse the completed step
          newExpanded.add(nextIncomplete.id) // Expand the next incomplete step
          return newExpanded
        })
      } else {
        // If no next incomplete step, just collapse the completed one
        setExpandedSteps(prev => {
          const newExpanded = new Set(prev)
          newExpanded.delete(expandedCompletedStep.id)
          return newExpanded
        })
      }
    }
  }, [completedSteps, setupSteps])

  // Save expanded steps to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify(Array.from(expandedSteps)))
    } catch (error) {
      console.error('Failed to save expanded steps:', error)
    }
  }, [expandedSteps, persona])

  // Toggle step expansion
  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  // Toggle step completion
  const toggleStepCompletion = (stepId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev)
      const wasCompleted = newSet.has(stepId)
      
      if (wasCompleted) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
        
        // If step was just completed and was expanded, expand the next incomplete step
        if (expandedSteps.has(stepId)) {
          const currentIndex = setupSteps.findIndex(step => step.id === stepId)
          const nextIncomplete = setupSteps.slice(currentIndex + 1).find(step => !newSet.has(step.id))
          
          if (nextIncomplete) {
            setExpandedSteps(prev => {
              const newExpanded = new Set(prev)
              newExpanded.delete(stepId) // Collapse the completed step
              newExpanded.add(nextIncomplete.id) // Expand the next incomplete step
              return newExpanded
            })
          } else {
            // If no next incomplete step, just collapse the completed one
            setExpandedSteps(prev => {
              const newExpanded = new Set(prev)
              newExpanded.delete(stepId)
              return newExpanded
            })
          }
        }
      }
      
      return newSet
    })
  }

  // Helper function to render a step item
  const renderStepItem = (
    step: SetupStep,
    isCompleted: boolean,
    isExpanded: boolean,
    isLocked: boolean,
    variant: "inline" | "compact"
  ) => {
    const isInline = variant === "inline"
    const padding = isInline ? "p-4" : "p-3"
    const gap = isInline ? "gap-3" : "gap-2"
    const titleSize = isInline ? "font-semibold text-sm" : "font-medium text-xs"
    const descriptionSize = isInline ? "text-sm" : "text-xs"
    const checkboxSize = isInline ? "w-5 h-5" : "w-4 h-4"
    const checkIconSize = isInline ? "w-2.5 h-2.5" : "w-2 h-2"
    const lockIconSize = isInline ? "w-4 h-4" : "w-3 h-3"
    const chevronSize = isInline ? "w-4 h-4" : "w-3 h-3"
    const buttonVariant = isInline ? "default" : "link"
    const buttonSize = isInline ? "sm" : "sm"
    const buttonClassName = isInline ? "" : "h-auto p-0 text-xs"
    const buttonMargin = isInline ? "mt-8" : "mt-2"
    const contentPadding = isInline ? "pt-4" : "pt-1"
    const contentGap = isInline ? "gap-3" : "gap-2"

    return (
      <Card
        key={step.id}
        className="group overflow-hidden py-0"
      >
        {/* Step Header - Clickable to toggle expansion */}
        <div
          onClick={() => toggleStepExpansion(step.id)}
          className={cn("w-full flex items-start cursor-pointer text-left", padding, gap)}
        >
          {/* Column 1: Completion checkbox */}
          <div className="flex-shrink-0 flex items-start">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (!isLocked) {
                  toggleStepCompletion(step.id)
                }
              }}
              disabled={isLocked}
              className={cn(
                `${checkboxSize} rounded-full border-2 flex items-center justify-center`,
                isCompleted
                  ? "border-green-700 bg-green-700"
                  : isLocked
                    ? "border-muted-foreground/30 bg-muted cursor-not-allowed"
                    : "border-border"
              )}
            >
              {isCompleted && (
                <Check className={`${checkIconSize} text-white`} />
              )}
            </button>
          </div>

          {/* Column 2: Content (title, description, button) */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <h4 className={cn(
                titleSize,
                isCompleted && "line-through text-muted-foreground/60"
              )}>
                {step.title}
              </h4>
              {isGoalStep(step.title) && (
                <Badge variant="secondary" className="text-xs">
                  Goal
                </Badge>
              )}
              {isLocked && (
                <Lock className={`${lockIconSize} text-muted-foreground flex-shrink-0`} />
              )}
            </div>

            {/* Step Content - Collapsible with animation */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={cn("flex items-start", contentGap, "pt-2")}>
                    {/* Image on the left */}
                    <div className="w-[35%] flex-shrink-0 flex items-start pt-3 hidden md:block">
                      <img 
                        src={`/steps/${getStepImageName(step.title)}`}
                        alt={step.title}
                        className="w-full aspect-square rounded-lg object-cover"
                      />
                    </div>

                    {/* Copy content on the right */}
                    <div className={cn("flex-1 space-y-6", contentPadding, "pt-3")}>
                      <p className={cn(
                        descriptionSize,
                        isCompleted ? "text-muted-foreground/60" : "text-muted-foreground"
                      )}>
                        {step.description}
                      </p>
                      {/* Button below description in copy div */}
                      {step.action && !isCompleted && (
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block">
                                  <Button
                                    variant={buttonVariant}
                                    size={buttonSize}
                                    className={buttonClassName}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (!isLocked) {
                                        window.location.href = step.action!.href
                                      }
                                    }}
                                    disabled={isLocked}
                                  >
                                    {step.action.label}
                                    <ChevronRight className={`${chevronSize} ml-0.5`} />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {isLocked && (
                                <TooltipContent>
                                  <p>You must configure a channel first</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Column 4: Expand/Collapse icon */}
          <div className="flex-shrink-0 flex items-start pt-0.5">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className={`${chevronSize} text-muted-foreground`} />
            </motion.div>
          </div>
        </div>
      </Card>
    )
  }

  // Render card content (extracted to avoid duplication)
  const cardContent = (
    <>
      <CardHeader className="pb-3 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">Setup guide</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {completedCount} of {totalSteps} tasks complete
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden border border-border">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            {isMinimized && (
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {progressPercentage}% complete
              </p>
            )}
          </div>
        </div>

          {/* Greeting message with persona dropdown - only show when not minimized */}
          {!isMinimized && (
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm">
                  👋 Hello, {userName}! Let's get started as a
                </span>
                {/* Persona Switcher */}
                <Select value={persona} onValueChange={(value) => setPersona(value as Persona)}>
                  <SelectTrigger className="w-auto h-auto bg-card py-1 px-2 border border-border shadow-none [&_[data-slot=select-value]]:hidden hover:bg-muted/50">
                    <SelectValue />
                    <span className="text-sm font-semibold">
                      {persona === "business" ? "Marketeer" : "Developer"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business" className="text-sm">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span>Marketeer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="api" className="text-sm">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        <span>Developer</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
      </CardHeader>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
              <div className="space-y-3">
                {setupSteps.map((step) => {
                  const isCompleted = completedSteps.has(step.id)
                  const isExpanded = expandedSteps.has(step.id)
                  const isSendCampaignStep = step.id === "step-3"
                  const isChannelConfigured = completedSteps.has("step-1")
                  const isLocked = isSendCampaignStep && !isChannelConfigured
                  
                  return renderStepItem(step, isCompleted, isExpanded, isLocked, "inline")
                })}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const floatingCard = (
    <motion.div
      initial={{ opacity: 0, y: 200 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 200 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed bottom-6 right-6 z-50 w-full max-w-md"
      style={{ width: 'calc(35vw - 1.5rem)', minWidth: '560px', maxWidth: '800px' }}
    >
      <Card className="shadow-2xl border-2 border-border overflow-hidden">
        {cardContent}
      </Card>
    </motion.div>
  )

  // Render using portal to body to avoid any parent animations
  return createPortal(floatingCard, document.body)
}
