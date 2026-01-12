import * as React from "react"
import { motion } from "framer-motion"
import { PageHeader } from "@/components/page-header"
import { PageWrapper } from "@/components/page-wrapper"
import { pageVariants } from "@/lib/transitions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  Phone,
  Building2,
  Key,
  Webhook,
  MessageSquare,
  Shield,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  Lightbulb,
  GraduationCap,
  Code,
  PlayCircle,
  ChevronDown,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import { CircleFlag } from "react-circle-flags"
import { 
  addActiveChannel,
  addActiveChannelWithSync, 
  removeActiveChannel,
  removeActiveChannelWithSync, 
  saveWhatsAppConfig, 
  loadWhatsAppConfig, 
  clearWhatsAppConfig,
  type WhatsAppConfig 
} from "@/lib/channel-utils"
import { useAuth } from "@/hooks/use-auth"

interface ResourceLink {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  url: string
  category: "documentation" | "tutorials" | "tools" | "support"
}

interface PhoneNumber {
  id: string
  phoneNumber: string
  phoneNumberId: string
  displayName: string
  countryISO: string
  qualityRating: number
  messageLimit: number
  status: "verified" | "pending" | "restricted"
  messagesSent24h: number
  messagesReceived24h: number
  deliveryRate: number
}

export default function ChannelsWhatsAppPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = React.useState(true)
  const [showAccessToken, setShowAccessToken] = React.useState(false)
  const [showWebhookToken, setShowWebhookToken] = React.useState(false)
  const [showApiToken, setShowApiToken] = React.useState(false)
  const [isAuthenticating, setIsAuthenticating] = React.useState(false)
  const [expandedNumbers, setExpandedNumbers] = React.useState<Set<string>>(new Set())
  const [showRevokeDialog, setShowRevokeDialog] = React.useState(false)
  const [revokeConfirmation, setRevokeConfirmation] = React.useState("")
  const [showDisconnectDialog, setShowDisconnectDialog] = React.useState(false)
  const [disconnectConfirmation, setDisconnectConfirmation] = React.useState("")
  const [copiedButtonId, setCopiedButtonId] = React.useState<string | null>(null)
  
  // Track if we're in initial load to prevent saving during restore
  const isInitialLoad = React.useRef(true)
  
  // Form state
  const [formData, setFormData] = React.useState({
    businessAccountId: "",
    accessToken: "",
    apiToken: "",
    webhookUrl: "",
    webhookVerifyToken: "",
    about: "",
  })

  const [phoneNumbers, setPhoneNumbers] = React.useState<PhoneNumber[]>([])

  // Helper function to generate phone number in format: [Flag - Country code+2 - 10 number digits starting with 10]
  const generatePhoneNumber = (countryCode: string = "+20", countryISO: string = "eg") => {
    // Generate 10 digits starting with 10, format: 10 000 000 00 (10 followed by 8 more digits)
    const last8Digits = Math.floor(Math.random() * 100000000) // 0-99999999
    const digits = `10${last8Digits.toString().padStart(8, '0')}` // Always starts with 10, then 8 digits (total 10 digits)
    // Format as: 10 000 000 00
    const formattedDigits = `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)}`
    return { phoneNumber: `${countryCode} ${formattedDigits}`, countryISO }
  }

  const resources: ResourceLink[] = [
    {
      id: "api-docs",
      title: "API Documentation",
      description: "Complete reference guide for WhatsApp API",
      icon: <BookOpen className="w-5 h-5" />,
      url: "https://developers.facebook.com/docs/whatsapp",
      category: "documentation",
    },
    {
      id: "webhook-guide",
      title: "Webhook Setup Guide",
      description: "Learn how to configure and verify webhooks",
      icon: <Webhook className="w-5 h-5" />,
      url: "https://developers.facebook.com/docs/whatsapp/api/webhooks",
      category: "documentation",
    },
    {
      id: "quickstart",
      title: "Quick Start Tutorial",
      description: "Get started with WhatsApp Business API in minutes",
      icon: <PlayCircle className="w-5 h-5" />,
      url: "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started",
      category: "tutorials",
    },
    {
      id: "best-practices",
      title: "Best Practices",
      description: "Guidelines for messaging quality and compliance",
      icon: <Lightbulb className="w-5 h-5" />,
      url: "https://developers.facebook.com/docs/whatsapp/messaging-limits",
      category: "documentation",
    },
    {
      id: "api-console",
      title: "API Console",
      description: "Test and explore API endpoints interactively",
      icon: <Code className="w-5 h-5" />,
      url: "https://developers.facebook.com/tools/explorer",
      category: "tools",
    },
    {
      id: "support",
      title: "Support Center",
      description: "Get help from our support team",
      icon: <HelpCircle className="w-5 h-5" />,
      url: "#",
      category: "support",
    },
  ]

  // Load saved configuration on mount - check if channel is active first
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Check if WhatsApp channel is active (has been successfully configured)
      const savedConfig = loadWhatsAppConfig()
      if (savedConfig && savedConfig.formData.businessAccountId) {
        // Restore the full configuration
        setFormData(savedConfig.formData)
        setPhoneNumbers(savedConfig.phoneNumbers || [])
      }
      setIsLoading(false)
      // Mark initial load as complete after a short delay to allow state to settle
      setTimeout(() => {
        isInitialLoad.current = false
      }, 100)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  // Save configuration to localStorage whenever it changes
  // This ensures the configuration persists across browser sessions
  React.useEffect(() => {
    // Skip saving during initial load (when restoring from cache)
    if (isInitialLoad.current) {
      return
    }
    
    // Only save if we have a businessAccountId (indicates successful integration)
    // This will persist the configuration for future sessions
    if (formData.businessAccountId) {
      saveWhatsAppConfig({
        formData,
        phoneNumbers
      })
    }
    // Note: We don't clear config here - only on explicit disconnect
  }, [formData, phoneNumbers])

  // Mark channel as active when configuration is complete and sync with database
  React.useEffect(() => {
    // Channel is successfully configured when:
    // 1. Meta Business Account is authenticated (businessAccountId exists)
    // 2. At least one phone number is added
    if (formData.businessAccountId && phoneNumbers.length > 0) {
      if (user?.id) {
        addActiveChannelWithSync("whatsapp", user.id)
      } else {
        // Fallback to localStorage only if user not available
        addActiveChannel("whatsapp")
      }
    } else {
      // Remove channel if configuration is incomplete
      if (user?.id) {
        removeActiveChannelWithSync("whatsapp", user.id)
      } else {
        // Fallback to localStorage only if user not available
        removeActiveChannel("whatsapp")
      }
    }
  }, [formData.businessAccountId, phoneNumbers.length, user?.id])


  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCopy = (text: string, label: string, buttonId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedButtonId(buttonId)
    // Auto-hide after 2 seconds
    setTimeout(() => {
      setCopiedButtonId(null)
    }, 2000)
  }

  const handleResourceClick = (resource: ResourceLink) => {
    if (resource.url === "#") {
      toast.info("Support center coming soon")
    } else {
      window.open(resource.url, "_blank")
    }
  }

  return (
    <PageWrapper isLoading={isLoading}>
      <PageHeader
        title="WhatsApp Business API Configuration"
        description="Connect your WhatsApp Business Account to start messaging customers"
        isLoading={isLoading}
      />

      {!isLoading && (
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex gap-4"
        >
          {/* Left Panel - 2/3 width - New Sections */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Section 1: Meta Business OAuth */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 156 104" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                  >
                    <path d="M16.7750211,68.0290295 C16.7750211,73.9591561 18.0766245,78.5120675 19.7778903,81.2664979 C22.0084388,84.8742616 25.3353586,86.4027004 28.7270886,86.4027004 C33.1017722,86.4027004 37.1037975,85.3171308 44.8162025,74.6504641 C50.9947679,66.1009283 58.2751055,54.1002532 63.1736709,46.5768776 L71.4693671,33.8308861 C77.2320675,24.978903 83.9021097,15.1385654 91.5497046,8.46852321 C97.7930802,3.02447257 104.527932,0 111.305992,0 C122.68557,0 133.525063,6.59443038 141.820759,18.9623629 C150.899578,32.5076793 155.306667,49.5689451 155.306667,67.1756962 C155.306667,77.6425316 153.243544,85.3333333 149.732996,91.4092827 C146.341266,97.2854008 139.730633,103.156118 128.610295,103.156118 L128.610295,86.4027004 C138.131983,86.4027004 140.508354,77.6533333 140.508354,67.6401688 C140.508354,53.3711392 137.181435,37.535865 129.852489,26.221097 C124.651477,18.195443 117.911224,13.2914768 110.495865,13.2914768 C102.475612,13.2914768 96.0216034,19.3404219 88.76827,30.1259072 C84.9120675,35.8562025 80.9532489,42.8394937 76.5083544,50.7193249 L71.6151899,59.3876793 C61.785654,76.8162025 59.295865,80.7858228 54.381097,87.3370464 C45.7667511,98.8084388 38.4108017,103.156118 28.7270886,103.156118 C17.2394937,103.156118 9.97535865,98.1819409 5.4764557,90.6855696 C1.80388186,84.5772152 0,76.5623629 0,67.4295359 L16.7750211,68.0290295 Z" fill="#0081FB"/>
                    <path d="M13.2266667,20.1451477 C20.9174684,8.29029536 32.0162025,0 44.7459916,0 C52.1181435,0 59.4470886,2.18194093 67.1000844,8.4307173 C75.4713924,15.2627848 84.3935865,26.5127426 95.5247257,45.0538397 L99.5159494,51.7076793 C109.151055,67.7589873 114.632911,76.0168776 117.841013,79.9108861 C121.967257,84.9120675 124.856709,86.4027004 128.610295,86.4027004 C138.131983,86.4027004 140.508354,77.6533333 140.508354,67.6401688 L155.306667,67.1756962 C155.306667,77.6425316 153.243544,85.3333333 149.732996,91.4092827 C146.341266,97.2854008 139.730633,103.156118 128.610295,103.156118 C121.697215,103.156118 115.572658,101.654684 108.8,95.2654852 C103.593586,90.361519 97.5068354,81.6499578 92.8243038,73.8187342 L78.8955274,50.5518987 C71.9068354,38.8752743 65.4960338,30.1691139 61.785654,26.2264979 C57.7944304,21.9868354 52.6636287,16.8668354 44.4759494,16.8668354 C37.8491139,16.8668354 32.2214346,21.516962 27.5118987,28.6298734 L13.2266667,20.1451477 Z" fill="url(#meta-gradient-1)"/>
                    <path d="M44.4759494,16.8668354 C37.8491139,16.8668354 32.2214346,21.516962 27.5118987,28.6298734 C20.8526582,38.6808439 16.7750211,53.6519831 16.7750211,68.0290295 C16.7750211,73.9591561 18.0766245,78.5120675 19.7778903,81.2664979 L5.4764557,90.6855696 C1.80388186,84.5772152 0,76.5623629 0,67.4295359 C0,50.8219409 4.55831224,33.5122363 13.2266667,20.1451477 C20.9174684,8.29029536 32.0162025,0 44.7459916,0 L44.4759494,16.8668354 Z" fill="url(#meta-gradient-2)"/>
                    <defs>
                      <linearGradient x1="13.8784354%" y1="55.9337491%" x2="89.143574%" y2="58.6936324%" id="meta-gradient-1">
                        <stop stopColor="#0064E1" offset="0%"/>
                        <stop stopColor="#0064E1" offset="40%"/>
                        <stop stopColor="#0073EE" offset="83%"/>
                        <stop stopColor="#0082FB" offset="100%"/>
                      </linearGradient>
                      <linearGradient x1="54.3150272%" y1="82.782443%" x2="54.3150272%" y2="39.3067715%" id="meta-gradient-2">
                        <stop stopColor="#0082FB" offset="0%"/>
                        <stop stopColor="#0064E0" offset="100%"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <CardTitle>Meta Business Account</CardTitle>
                </div>
                <CardDescription>
                  Connect your Meta Business Account to access WhatsApp Business API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Not authenticated state */}
                {!formData.businessAccountId && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            Authentication Required
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Connect your Meta Business Account to enable WhatsApp Business API integration. You'll be redirected to Meta's secure authentication page.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <svg 
                          width="32" 
                          height="32" 
                          viewBox="0 0 156 104" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                    
                        >
                          <path d="M16.7750211,68.0290295 C16.7750211,73.9591561 18.0766245,78.5120675 19.7778903,81.2664979 C22.0084388,84.8742616 25.3353586,86.4027004 28.7270886,86.4027004 C33.1017722,86.4027004 37.1037975,85.3171308 44.8162025,74.6504641 C50.9947679,66.1009283 58.2751055,54.1002532 63.1736709,46.5768776 L71.4693671,33.8308861 C77.2320675,24.978903 83.9021097,15.1385654 91.5497046,8.46852321 C97.7930802,3.02447257 104.527932,0 111.305992,0 C122.68557,0 133.525063,6.59443038 141.820759,18.9623629 C150.899578,32.5076793 155.306667,49.5689451 155.306667,67.1756962 C155.306667,77.6425316 153.243544,85.3333333 149.732996,91.4092827 C146.341266,97.2854008 139.730633,103.156118 128.610295,103.156118 L128.610295,86.4027004 C138.131983,86.4027004 140.508354,77.6533333 140.508354,67.6401688 C140.508354,53.3711392 137.181435,37.535865 129.852489,26.221097 C124.651477,18.195443 117.911224,13.2914768 110.495865,13.2914768 C102.475612,13.2914768 96.0216034,19.3404219 88.76827,30.1259072 C84.9120675,35.8562025 80.9532489,42.8394937 76.5083544,50.7193249 L71.6151899,59.3876793 C61.785654,76.8162025 59.295865,80.7858228 54.381097,87.3370464 C45.7667511,98.8084388 38.4108017,103.156118 28.7270886,103.156118 C17.2394937,103.156118 9.97535865,98.1819409 5.4764557,90.6855696 C1.80388186,84.5772152 0,76.5623629 0,67.4295359 L16.7750211,68.0290295 Z" fill="#0081FB"/>
                          <path d="M13.2266667,20.1451477 C20.9174684,8.29029536 32.0162025,0 44.7459916,0 C52.1181435,0 59.4470886,2.18194093 67.1000844,8.4307173 C75.4713924,15.2627848 84.3935865,26.5127426 95.5247257,45.0538397 L99.5159494,51.7076793 C109.151055,67.7589873 114.632911,76.0168776 117.841013,79.9108861 C121.967257,84.9120675 124.856709,86.4027004 128.610295,86.4027004 C138.131983,86.4027004 140.508354,77.6533333 140.508354,67.6401688 L155.306667,67.1756962 C155.306667,77.6425316 153.243544,85.3333333 149.732996,91.4092827 C146.341266,97.2854008 139.730633,103.156118 128.610295,103.156118 C121.697215,103.156118 115.572658,101.654684 108.8,95.2654852 C103.593586,90.361519 97.5068354,81.6499578 92.8243038,73.8187342 L78.8955274,50.5518987 C71.9068354,38.8752743 65.4960338,30.1691139 61.785654,26.2264979 C57.7944304,21.9868354 52.6636287,16.8668354 44.4759494,16.8668354 C37.8491139,16.8668354 32.2214346,21.516962 27.5118987,28.6298734 L13.2266667,20.1451477 Z" fill="url(#meta-gradient-3)"/>
                          <path d="M44.4759494,16.8668354 C37.8491139,16.8668354 32.2214346,21.516962 27.5118987,28.6298734 C20.8526582,38.6808439 16.7750211,53.6519831 16.7750211,68.0290295 C16.7750211,73.9591561 18.0766245,78.5120675 19.7778903,81.2664979 L5.4764557,90.6855696 C1.80388186,84.5772152 0,76.5623629 0,67.4295359 C0,50.8219409 4.55831224,33.5122363 13.2266667,20.1451477 C20.9174684,8.29029536 32.0162025,0 44.7459916,0 L44.4759494,16.8668354 Z" fill="url(#meta-gradient-4)"/>
                          <defs>
                            <linearGradient x1="13.8784354%" y1="55.9337491%" x2="89.143574%" y2="58.6936324%" id="meta-gradient-3">
                              <stop stopColor="#0064E1" offset="0%"/>
                              <stop stopColor="#0064E1" offset="40%"/>
                              <stop stopColor="#0073EE" offset="83%"/>
                              <stop stopColor="#0082FB" offset="100%"/>
                            </linearGradient>
                            <linearGradient x1="54.3150272%" y1="82.782443%" x2="54.3150272%" y2="39.3067715%" id="meta-gradient-4">
                              <stop stopColor="#0082FB" offset="0%"/>
                              <stop stopColor="#0064E0" offset="100%"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="font-semibold text-lg">Connect to Meta</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                          Authorize Cequens to access your Meta Business Account and manage WhatsApp Business API
                        </p>
                      </div>
                      <Button 
                        size="lg" 
                        className="mt-4"
                        disabled={isAuthenticating}
                        onClick={() => {
                          setIsAuthenticating(true)
                          // Simulate OAuth flow - in real app this would redirect to Meta
                          setTimeout(() => {
                            setFormData(prev => ({ 
                              ...prev, 
                              businessAccountId: "123456789012345",
                              apiToken: `ceq_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
                            }))
                            // Add initial phone number
                            const phoneData = generatePhoneNumber("+20", "eg")
                            const initialPhoneNumber: PhoneNumber = {
                              id: `phone-${Date.now()}`,
                              phoneNumber: phoneData.phoneNumber,
                              phoneNumberId: "987654321",
                              displayName: "Vodafone Support",
                              countryISO: phoneData.countryISO,
                              qualityRating: 95,
                              messageLimit: 1000,
                              status: "verified",
                              messagesSent24h: 247,
                              messagesReceived24h: 189,
                              deliveryRate: 98.5
                            }
                            const newFormData = {
                              businessAccountId: "123456789012345",
                              accessToken: "",
                              apiToken: `ceq_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
                              webhookUrl: "",
                              webhookVerifyToken: "",
                              about: "",
                            }
                            setFormData(prev => ({ ...prev, ...newFormData }))
                            setPhoneNumbers([initialPhoneNumber])
                            setIsAuthenticating(false)
                            // Save configuration immediately to persist across sessions
                            saveWhatsAppConfig({
                              formData: { ...formData, ...newFormData },
                              phoneNumbers: [initialPhoneNumber]
                            })
                            // Mark WhatsApp channel as active since configuration is complete
                            if (user?.id) {
                              addActiveChannelWithSync("whatsapp", user.id)
                            } else {
                              addActiveChannel("whatsapp")
                            }
                            toast.success("Successfully connected to Meta Business Account")
                          }, 2000) // Simulate 2 second OAuth redirect delay
                        }}
                      >
                        {isAuthenticating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Redirecting to Meta...
                          </>
                        ) : (
                          "Authenticate with Meta"
                        )}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Secure OAuth 2.0 authentication via Meta
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <p className="text-sm font-medium">What you'll need:</p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-foreground flex-shrink-0 mt-0.5" />
                          <span>A verified Meta Business Account</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-foreground flex-shrink-0 mt-0.5" />
                          <span>Admin access to the Business Manager</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-foreground flex-shrink-0 mt-0.5" />
                          <span>WhatsApp Business Account created in Meta</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Authenticated state */}
                {formData.businessAccountId && (
                  <div className="space-y-4">
                    <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Account Name</p>
                          <p className="text-sm font-bold">
                            Vodafone Business Account
                          </p>
                        </div>
                        <Badge className="bg-success">
                          <div className="w-1.5 h-1.5 rounded-full bg-success-foreground mr-1.5" />
                          Active
                        </Badge>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Business Account ID</p>
                          <p className="font-mono text-xs break-all">
                            {formData.businessAccountId}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Connected Since</p>
                          <p className="font-medium">
                            {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => window.open('https://business.facebook.com', '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Manage in Meta
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowDisconnectDialog(true)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 2: Channel Health & Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src="/icons/WhatsApp.svg" 
                      alt="WhatsApp" 
                      className="w-5 h-5" 
                    />
                    <CardTitle>WhatsApp Channel Status</CardTitle>
                  </div>
                  {formData.businessAccountId && phoneNumbers.length > 0 && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // Determine which number to add based on current count
                        // First number (index 0): Vodafone Support (already added on auth)
                        // Second number (index 1): Vodafone Red
                        // Third number (index 2): VF-Cash
                        const currentCount = phoneNumbers.length
                        let displayName = "Vodafone Red"
                        if (currentCount === 1) {
                          displayName = "Vodafone Red"
                        } else if (currentCount === 2) {
                          displayName = "VF-Cash"
                        } else {
                          displayName = `Vodafone ${currentCount + 1}`
                        }
                        
                        const phoneData = generatePhoneNumber("+20", "eg")
                        const newNumber: PhoneNumber = {
                          id: `phone-${Date.now()}`,
                          phoneNumber: phoneData.phoneNumber,
                          phoneNumberId: `${Math.floor(Math.random() * 900000000) + 100000000}`,
                          displayName: displayName,
                          countryISO: phoneData.countryISO,
                          qualityRating: Math.floor(Math.random() * 20) + 80,
                          messageLimit: Math.floor(Math.random() * 2000) + 500,
                          status: "verified", // All numbers should be verified
                          messagesSent24h: Math.floor(Math.random() * 500),
                          messagesReceived24h: Math.floor(Math.random() * 400),
                          deliveryRate: Math.random() * 5 + 95
                        }
                        const updatedPhoneNumbers = [...phoneNumbers, newNumber]
                        setPhoneNumbers(updatedPhoneNumbers)
                        // Save configuration immediately to persist across sessions
                        saveWhatsAppConfig({
                          formData,
                          phoneNumbers: updatedPhoneNumbers
                        })
                        // Mark WhatsApp channel as active since configuration is complete
                        if (user?.id) {
                          addActiveChannelWithSync("whatsapp", user.id)
                        } else {
                          addActiveChannel("whatsapp")
                        }
                        toast.success("Phone number added successfully")
                      }}
                    >
                      <Plus/>
                      Add new number
                    </Button>
                  )}
                </div>
                <CardDescription>
                  Monitor and manage your WhatsApp Business channel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* No phone numbers */}
                {phoneNumbers.length === 0 && (
                  <div className="rounded-lg border border-border bg-card p-8 text-center">
                    <Phone className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      No Phone Numbers Configured
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {!formData.businessAccountId 
                        ? "Connect your Meta Business Account to add WhatsApp phone numbers"
                        : "Add a phone number from your Meta Business Account to get started"}
                    </p>
                    {!formData.businessAccountId && (
                      <p className="text-xs text-muted-foreground">
                        Start by authenticating with Meta above
                      </p>
                    )}
                    {formData.businessAccountId && (
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          const phoneData = generatePhoneNumber("+20", "eg")
                          const newNumber: PhoneNumber = {
                            id: `phone-${Date.now()}`,
                            phoneNumber: phoneData.phoneNumber,
                            phoneNumberId: "987654321",
                            displayName: "Vodafone Support",
                            countryISO: phoneData.countryISO,
                            qualityRating: 95,
                            messageLimit: 1000,
                            status: "verified",
                            messagesSent24h: 247,
                            messagesReceived24h: 189,
                            deliveryRate: 98.5
                          }
                          const updatedPhoneNumbers = [newNumber]
                          setPhoneNumbers(updatedPhoneNumbers)
                          // Save configuration immediately to persist across sessions
                          saveWhatsAppConfig({
                            formData,
                            phoneNumbers: updatedPhoneNumbers
                          })
                          // Mark WhatsApp channel as active since configuration is complete
                          if (user?.id) {
                            addActiveChannelWithSync("whatsapp", user.id)
                          } else {
                            addActiveChannel("whatsapp")
                          }
                          toast.success("Phone number added successfully")
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Phone Number
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Phone numbers list */}
                {phoneNumbers.length > 0 && (
                  <div className="space-y-3">
                    {phoneNumbers.map((phoneNumber) => {
                      const isExpanded = expandedNumbers.has(phoneNumber.id)
                      const statusColors = {
                        verified: "bg-success",
                        pending: "bg-warning",
                        restricted: "bg-destructive"
                      }
                      const statusLabels = {
                        verified: "Verified",
                        pending: "Pending",
                        restricted: "Restricted"
                      }

                      return (
                        <div 
                          key={phoneNumber.id}
                          className="rounded-lg border border-border overflow-hidden"
                        >
                          <button
                            onClick={() => {
                              setExpandedNumbers(prev => {
                                const newSet = new Set(prev)
                                if (newSet.has(phoneNumber.id)) {
                                  newSet.delete(phoneNumber.id)
                                } else {
                                  newSet.add(phoneNumber.id)
                                }
                                return newSet
                              })
                            }}
                            className="w-full p-4 flex items-center justify-between bg-muted hover:bg-accent transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="grid grid-cols-2 gap-4 flex-1 min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                  <p className="text-sm font-bold truncate">
                                    {phoneNumber.displayName}
                                  </p>
                                  {phoneNumber.status === "verified" && (
                                    <svg 
                                      width="16" 
                                      height="16" 
                                      viewBox="0 0 100 100" 
                                      fill="none" 
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="flex-shrink-0"
                                    >
                                      <g clipPath={`url(#clip0_meta_${phoneNumber.id})`}>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M93.9979 49.9999L99.4459 39.9939C100.604 37.8669 99.8909 35.2049 97.8239 33.9419L88.1029 28.0009L87.8189 16.6119C87.7579 14.1899 85.8099 12.2419 83.3879 12.1809L71.9989 11.8969L66.0579 2.17593C64.7949 0.10893 62.1329 -0.60407 60.0059 0.55393L49.9999 6.00193L39.9939 0.55393C37.8669 -0.60407 35.2049 0.10893 33.9419 2.17593L28.0009 11.8969L16.6119 12.1809C14.1899 12.2419 12.2419 14.1899 12.1819 16.6119L11.8969 28.0009L2.17593 33.9419C0.10893 35.2049 -0.60407 37.8669 0.55393 39.9939L6.00193 49.9999L0.55393 60.0059C-0.60407 62.1329 0.10893 64.7949 2.17593 66.0579L11.8969 71.9989L12.1809 83.3879C12.2419 85.8089 14.1899 87.7579 16.6119 87.8179L28.0009 88.1029L33.9419 97.8239C35.2049 99.8909 37.8669 100.604 39.9939 99.4459L49.9999 93.9979L60.0059 99.4459C62.1329 100.604 64.7949 99.8909 66.0579 97.8239L71.9989 88.1029L83.3879 87.8179C85.8099 87.7579 87.7579 85.8089 87.8189 83.3879L88.1029 71.9989L97.8239 66.0579C99.8909 64.7949 100.604 62.1329 99.4459 60.0059L93.9979 49.9999ZM71.0919 42.1279L70.7879 42.3809C62.1289 49.5969 54.1429 57.5839 46.9269 66.2419L46.6739 66.5459C45.8569 67.5269 44.6639 68.1189 43.3879 68.1769C42.1119 68.2349 40.8709 67.7529 39.9679 66.8499L28.6039 55.4869C26.8289 53.7119 26.8289 50.8329 28.6039 49.0589C30.3799 47.2839 33.2569 47.2839 35.0329 49.0589L42.9149 56.9409C49.6859 49.1919 57.0589 41.9879 64.9679 35.3979L65.2719 35.1449C67.1999 33.5379 70.0669 33.7979 71.6729 35.7269C73.2809 37.6549 73.0199 40.5209 71.0919 42.1279Z" fill="#3897F0"/>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M71.0919 42.1279L70.7879 42.3809C62.1289 49.5969 54.1429 57.5839 46.9269 66.2419L46.6739 66.5459C45.8569 67.5269 44.6639 68.1189 43.3879 68.1769C42.1119 68.2349 40.8709 67.7529 39.9679 66.8499L28.6039 55.4869C26.8289 53.7119 26.8289 50.8329 28.6039 49.0589C30.3799 47.2839 33.2569 47.2839 35.0329 49.0589L42.9149 56.9409C49.6859 49.1919 57.0589 41.9879 64.9679 35.3979L65.2719 35.1449C67.1999 33.5379 70.0669 33.7979 71.6729 35.7269C73.2809 37.6549 73.0199 40.5209 71.0919 42.1279Z" fill="white"/>
                                      </g>
                                      <defs>
                                        <clipPath id={`clip0_meta_${phoneNumber.id}`}>
                                          <rect width="100" height="100" fill="white"/>
                                        </clipPath>
                                      </defs>
                                    </svg>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 min-w-0">
                                  <CircleFlag 
                                    countryCode={phoneNumber.countryISO} 
                                    className="w-4 h-4 flex-shrink-0"
                                  />
                                  <p className="text-sm font-medium truncate">
                                    {phoneNumber.phoneNumber}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <ChevronDown 
                              className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="p-4 bg-card border-t border-border">
                              {/* Channel Health */}
                              <div className="space-y-4 mb-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-semibold text-foreground">Channel Health</h4>
                                  <Badge className="bg-success text-success-foreground px-2.5 py-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success-foreground mr-1.5" />
                                    Healthy
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                  {/* Quality Rating */}
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-2">Quality Rating</p>
                                    <div className="flex items-center gap-2">
                                      <p className="text-base font-bold text-foreground">{phoneNumber.qualityRating}%</p>
                                      <Badge 
                                        variant="secondary"
                                        className={`text-xs px-1.5 py-0 h-4 ${
                                          phoneNumber.qualityRating >= 90 ? 'bg-success/10 text-success' :
                                          phoneNumber.qualityRating >= 70 ? 'bg-warning/10 text-warning-foreground' : 'bg-destructive/10 text-destructive'
                                        }`}
                                      >
                                        {phoneNumber.qualityRating >= 90 ? 'High' :
                                         phoneNumber.qualityRating >= 70 ? 'Medium' : 'Low'}
                                      </Badge>
                                      <div className="w-12 bg-muted rounded-full h-1">
                                        <div 
                                          className={`h-1 rounded-full ${
                                            phoneNumber.qualityRating >= 90 ? 'bg-success' :
                                            phoneNumber.qualityRating >= 70 ? 'bg-warning' : 'bg-destructive'
                                          }`}
                                          style={{ width: `${phoneNumber.qualityRating}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Message Limit */}
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-2">Message Limit</p>
                                    <div className="flex items-baseline gap-1.5">
                                      <p className="text-base font-bold text-foreground">
                                        {phoneNumber.messageLimit >= 1000 
                                          ? `${(phoneNumber.messageLimit / 1000).toFixed(1)}K`
                                          : phoneNumber.messageLimit}
                                      </p>
                                      <p className="text-xs text-muted-foreground">per day</p>
                                    </div>
                                  </div>

                                  {/* Status */}
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-2">Status</p>
                                    <div className="flex items-center gap-1.5">
                                      <CheckCircle2 className={`w-4 h-4 ${
                                        phoneNumber.status === 'verified' ? 'text-success' :
                                        phoneNumber.status === 'pending' ? 'text-warning-foreground' : 'text-destructive'
                                      }`} />
                                      <span className="text-sm font-medium text-foreground">
                                        {statusLabels[phoneNumber.status]}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Recent Activity */}
                              <div className="space-y-3 pt-4 border-t border-border">
                                <h4 className="font-medium text-sm text-foreground">Recent Activity</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Messages Sent (24h)</span>
                                    <span className="font-semibold text-foreground">{phoneNumber.messagesSent24h}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Messages Received (24h)</span>
                                    <span className="font-semibold text-foreground">{phoneNumber.messagesReceived24h}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery Rate</span>
                                    <span className={`font-semibold ${
                                      phoneNumber.deliveryRate >= 95 ? 'text-success' :
                                      phoneNumber.deliveryRate >= 90 ? 'text-warning-foreground' : 'text-destructive'
                                    }`}>
                                      {phoneNumber.deliveryRate.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>

                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 3: API Configuration & Testing */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-foreground" />
                  <CardTitle>API Configuration & Testing</CardTitle>
                </div>
                <CardDescription>
                  Manage your Cequens API token and test WhatsApp messaging integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(!formData.businessAccountId || phoneNumbers.length === 0) && (
                  <div className="rounded-lg border border-border bg-card p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      Configuration Required
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Complete the Meta authentication and add a phone number to access API configuration
                    </p>
                  </div>
                )}

                {formData.businessAccountId && phoneNumbers.length > 0 && (
                  <div className="space-y-4">
                    {/* API Token Section */}
                    <div className="rounded-lg border border-border p-4 space-y-3 bg-card">
                      <div>
                        <Label htmlFor="apiToken" className="text-sm font-medium">
                          API Token
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Your Cequens API token for WhatsApp Business API integration
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input
                            id="apiToken"
                            type={showApiToken ? "text" : "password"}
                            value={formData.apiToken}
                            readOnly
                            placeholder="Enter your Cequens API token"
                            className="pr-20 font-mono text-xs"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {formData.apiToken && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => setShowApiToken(!showApiToken)}
                                >
                                  {showApiToken ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </Button>
                                <div className="relative">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={() => handleCopy(formData.apiToken, "API Token", "api-token-copy")}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  {copiedButtonId === "api-token-copy" && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground border border-border rounded-md text-xs shadow-md whitespace-nowrap z-50 animate-in fade-in-0 zoom-in-95">
                                      Copied
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-popover border-r border-b border-border rotate-45"></div>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        {formData.apiToken && (
                          <Button
                            variant="outline"
                            size="default"
                            onClick={() => setShowRevokeDialog(true)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Revoke
                          </Button>
                        )}
                      </div>
                      {!formData.apiToken && (
                        <p className="text-xs text-muted-foreground">
                          Generate your API token from the Developers section in Cequens platform
                        </p>
                      )}
                    </div>

                    <Separator />
                    {/* API Code Snippet */}
                    <div className="rounded-lg border border-border p-4 space-y-3 bg-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">API Code Example</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Example code to send messages via WhatsApp API
                          </p>
                        </div>
                      </div>
                      
                      <Tabs defaultValue="curl">
                        <TabsList className="w-fit">
                          <TabsTrigger value="curl" className="flex-none">cURL</TabsTrigger>
                          <TabsTrigger value="javascript" className="flex-none">JavaScript</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="curl" className="mt-3 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:duration-200">
                          <div className="relative rounded-lg border border-border bg-muted/50 overflow-hidden">
                            <div className="absolute top-2 right-2 z-10">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-7 bg-background/80 backdrop-blur-sm hover:bg-background border-border relative"
                                onClick={() => {
                                  const codeSnippet = `curl -X POST "https://apis.cequens.com/conversation/wab/v1/messages/" \\
  -H "Authorization: ${formData.apiToken || 'YOUR_API_TOKEN'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "${phoneNumbers[0]?.phoneNumber || 'RECIPIENT_PHONE_NUMBER'}",
    "type": "text",
    "text": {
      "body": "Hello from Cequens!"
    }
  }'`
                                  handleCopy(codeSnippet, "cURL code snippet", "curl-copy")
                                }}
                              >
                                <Copy className="w-3 h-3 mr-1.5" />
                                Copy
                              </Button>
                              {copiedButtonId === "curl-copy" && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground border border-border rounded-md text-xs shadow-md whitespace-nowrap z-50 animate-in fade-in-0 zoom-in-95">
                                  Copied
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-popover border-r border-b border-border rotate-45"></div>
                                </div>
                              )}
                            </div>
                            <pre className="p-4 overflow-x-auto text-xs font-mono text-foreground">
                              <code>{`curl -X POST "https://apis.cequens.com/conversation/wab/v1/messages/" \\
  -H "Authorization: ${formData.apiToken || 'YOUR_API_TOKEN'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "${phoneNumbers[0]?.phoneNumber || 'RECIPIENT_PHONE_NUMBER'}",
    "type": "text",
    "text": {
      "body": "Hello from Cequens!"
    }
  }'`}</code>
                            </pre>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="javascript" className="mt-3 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:duration-200">
                          <div className="relative rounded-lg border border-border bg-muted/50 overflow-hidden">
                            <div className="absolute top-2 right-2 z-10">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-7 bg-background/80 backdrop-blur-sm hover:bg-background border-border relative"
                                onClick={() => {
                                  const codeSnippet = `const sendWhatsAppMessage = async () => {
  const apiToken = "${formData.apiToken || 'YOUR_API_TOKEN'}";
  const recipient = "${phoneNumbers[0]?.phoneNumber || 'RECIPIENT_PHONE_NUMBER'}";
  
  const response = await fetch(
    'https://apis.cequens.com/conversation/wab/v1/messages/',
    {
      method: 'POST',
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: recipient,
        type: 'text',
        text: {
          body: 'Hello from Cequens!'
        }
      })
    }
  );
  
  const data = await response.json();
  return data;
};`
                                  handleCopy(codeSnippet, "JavaScript code snippet", "javascript-copy")
                                }}
                              >
                                <Copy className="w-3 h-3 mr-1.5" />
                                Copy
                              </Button>
                              {copiedButtonId === "javascript-copy" && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground border border-border rounded-md text-xs shadow-md whitespace-nowrap z-50 animate-in fade-in-0 zoom-in-95">
                                  Copied
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-popover border-r border-b border-border rotate-45"></div>
                                </div>
                              )}
                            </div>
                            <pre className="p-4 overflow-x-auto text-xs font-mono text-foreground">
                              <code>{`const sendWhatsAppMessage = async () => {
  const apiToken = "${formData.apiToken || 'YOUR_API_TOKEN'}";
  const recipient = "${phoneNumbers[0]?.phoneNumber || 'RECIPIENT_PHONE_NUMBER'}";
  
  const response = await fetch(
    'https://apis.cequens.com/conversation/wab/v1/messages/',
    {
      method: 'POST',
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: recipient,
        type: 'text',
        text: {
          body: 'Hello from Cequens!'
        }
      })
    }
  );
  
  const data = await response.json();
  return data;
};`}</code>
                            </pre>
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      <div className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-border">
                        <p className="font-medium text-foreground">Required Fields:</p>
                        <ul className="space-y-1 ml-4 list-disc">
                          <li><code className="bg-muted px-1 py-0.5 rounded">YOUR_API_TOKEN</code> - Your Cequens API token (get it from the Developers section)</li>
                          <li><code className="bg-muted px-1 py-0.5 rounded">to</code> - Recipient's phone number in E.164 format (e.g., +201234567890)</li>
                          <li><code className="bg-muted px-1 py-0.5 rounded">type</code> - Message type (e.g., "text")</li>
                          <li><code className="bg-muted px-1 py-0.5 rounded">body</code> - Message content (max 4096 characters)</li>
                        </ul>
                        <Alert className="mt-3 border-warning/30 bg-warning/10">
                          <AlertTriangle className="h-4 w-4 text-warning-foreground" />
                          <AlertTitle className="text-warning-foreground">Important Notes</AlertTitle>
                          <AlertDescription className="text-warning-foreground">
                            <ul className="space-y-1.5 mt-2 ml-4 list-disc">
                              <li>Text messages can only be sent within 24 hours of the customer's last message</li>
                              <li>Use message templates to reach customers outside the 24-hour window</li>
                              <li>API endpoint: <code className="bg-warning/20 px-1 py-0.5 rounded font-mono text-xs">https://apis.cequens.com/conversation/wab/v1/messages/</code></li>
                            </ul>
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - 1/3 width - Additional Resources */}
          <div className="w-1/3 min-w-[320px] max-w-[400px]">
            <div className="sticky top-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Resources</CardTitle>
                  <CardDescription>
                    Helpful links and documentation to get the most out of WhatsApp Business API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {resources.map((resource) => (
                    <button
                      key={resource.id}
                      onClick={() => handleResourceClick(resource)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-all group cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-md border border-border bg-muted flex items-center justify-center text-muted-foreground transition-colors flex-shrink-0">
                          {resource.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm transition-colors">
                              {resource.title}
                            </h4>
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      )}

      {/* Disconnect Alert Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Disconnect Meta Business Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect your Meta Business Account? 
              This will remove all WhatsApp channel configurations and you'll need to reconnect to use WhatsApp Business API again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning-foreground flex-shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm text-warning-foreground font-semibold">Warning</p>
                  <p className="text-sm text-warning-foreground leading-relaxed">
                    Disconnecting will immediately stop all WhatsApp messaging capabilities. 
                    All configured phone numbers and API tokens will be removed.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="disconnectConfirm" className="text-sm font-medium">
                Type <code className="bg-muted px-2 py-1 rounded font-mono text-xs">disconnect</code> to confirm:
              </Label>
              <Input
                id="disconnectConfirm"
                value={disconnectConfirmation}
                onChange={(e) => setDisconnectConfirmation(e.target.value)}
                placeholder="Type 'disconnect' to confirm"
                className="font-mono"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDisconnectConfirmation("")
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (disconnectConfirmation.toLowerCase() === "disconnect") {
                  setFormData(prev => ({ ...prev, businessAccountId: "", apiToken: "" }))
                  setPhoneNumbers([])
                  // Remove WhatsApp channel from active channels and sync with database
                  if (user?.id) {
                    await removeActiveChannelWithSync("whatsapp", user.id)
                  } else {
                    removeActiveChannel("whatsapp")
                  }
                  // Clear saved configuration
                  clearWhatsAppConfig()
                  setShowDisconnectDialog(false)
                  setDisconnectConfirmation("")
                  toast.info("Disconnected from Meta Business Account")
                } else {
                  toast.error("Please type 'disconnect' to confirm")
                }
              }}
              disabled={disconnectConfirmation.toLowerCase() !== "disconnect"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke API Token Alert Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Revoke API Token
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will revoke your current API token and generate a new one. 
              Any applications using the current token will stop working until you update them with the new token.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning-foreground flex-shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm text-warning-foreground font-semibold">Warning</p>
                  <p className="text-sm text-warning-foreground leading-relaxed">
                    Revoking your API token will immediately invalidate the current token. 
                    Make sure to update all integrations using this token before proceeding.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="revokeConfirm" className="text-sm font-medium">
                Type <code className="bg-muted px-2 py-1 rounded font-mono text-xs">revoke</code> to confirm:
              </Label>
              <Input
                id="revokeConfirm"
                value={revokeConfirmation}
                onChange={(e) => setRevokeConfirmation(e.target.value)}
                placeholder="Type 'revoke' to confirm"
                className="font-mono"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRevokeConfirmation("")
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (revokeConfirmation.toLowerCase() === "revoke") {
                  // Generate new token
                  const newToken = `ceq_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
                  const updatedFormData = { ...formData, apiToken: newToken }
                  setFormData(updatedFormData)
                  // Save updated configuration immediately to persist across sessions
                  saveWhatsAppConfig({
                    formData: updatedFormData,
                    phoneNumbers
                  })
                  setShowRevokeDialog(false)
                  setRevokeConfirmation("")
                  toast.success("API Token revoked and regenerated successfully")
                } else {
                  toast.error("Please type 'revoke' to confirm")
                }
              }}
              disabled={revokeConfirmation.toLowerCase() !== "revoke"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Revoke & Regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  )
}