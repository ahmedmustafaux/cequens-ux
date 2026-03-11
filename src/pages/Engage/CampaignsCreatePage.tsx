import * as React from "react"
import { format } from "date-fns"
import { useNavigate, useLocation } from "react-router-dom"
import { usePageTitle } from "@/hooks/use-dynamic-title"
import { PageWrapper } from "@/components/page-wrapper"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError
} from "@/components/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as SelectPrimitive from "@radix-ui/react-select"
import { PageHeader } from "@/components/page-header"
import { CardSkeleton } from "@/components/ui/card"
import { Save, X, Users, Clock, Eye, Send, Calendar, ChevronLeft, ChevronRight, Check, CheckCircle2, AlertCircle, Upload, FileUp, Play, Pause, FileAudio, UploadCloud, Square } from "lucide-react"
import { EnvelopeSimple, ChatText, Phone } from "phosphor-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { pageVariants, smoothTransition } from "@/lib/transitions"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MentionsTextarea } from "@/components/ui/mentions-textarea"
import { useCreateCampaign } from "@/hooks/use-campaigns"
import { useSegments } from "@/hooks/use-segments"
import { useContacts } from "@/hooks/use-contacts"
import { useAuth } from "@/hooks/use-auth"
import { getUserConnectedChannels } from "@/lib/supabase/users"
import { loadWhatsAppConfig, loadSMSConfig } from "@/lib/channel-utils"
import { cn } from "@/lib/utils"
import type { Campaign } from "@/lib/supabase/types"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IPhoneMockup } from "react-device-mockup"
import { mockWhatsAppTemplates, mockSmsTemplates, type WhatsAppTemplate, type WhatsAppTemplateVariable, type WhatsAppTemplateCategory, type SmsTemplate } from "@/data/mock-data"
import { FileText, Image, Video, File, Link2, Phone as PhoneIcon, MessageSquare as MessageSquareIcon, X as XIcon, CheckCircle2 as CheckCircle2Icon, Search, Filter, ShoppingCart, User, Zap, Gift, AlertTriangle, CreditCard, Activity, Sparkles } from "lucide-react"

import { ContactsCsvImportDrawer } from "@/components/contacts-csv-import-drawer"

interface CampaignFormData {
  name: string
  type: "Email" | "SMS" | "Whatsapp" | "Voice" | ""
  campaignType: "broadcast" | "condition"
  status: "Draft" | "Active" | "Completed"
  senderId: string
  recipientSource: "segments" | "upload" | "manual"
  manualNumbers: string
  selectedSegmentId: string
  recipients: number
  description: string
  subject: string
  message: string
  scheduleType: "now" | "scheduled" | "recurring"
  scheduledDate: string
  scheduledTime: string
  // Recurring schedule
  recurringStartDate?: string
  recurringEndDate?: string
  recurringSchedule?: Record<string, number[]> // day -> [hours]
  selectedTemplateId: string
  templateVariables: Record<string, string>
  // Condition specific
  selectedFlowId?: string
  triggerCategory: string
  trigger: string
  triggerConfig: Record<string, any>
  entryPoint?: string
  isPersonalizationEnabled?: boolean
  includeCtaLink?: boolean
  ctaLinkUrl?: string
  includeGoogleAnalytics?: boolean
  gaSource?: string
  gaMedium?: string
  gaCampaignName?: string
  voiceType?: "tts" | "upload"
  voiceContent?: string
  voiceFileUrl?: string
  voiceVoiceId?: string
  voiceSpeed?: string
  voiceDelay?: string
}

// Helper to strip react-mentions markup for length and display
const getPlainTextMessage = (msg: string) => {
  if (!msg) return "";
  return msg.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1');
};

// Helper to simulate variables with dummy data for mockup
const getMockupMessage = (msg: string) => {
  if (!msg) return "";
  const dummyData: Record<string, string> = {
    firstName: "Ahmed",
    lastName: "Mustafa",
    phoneNumber: "+201234567890",
    email: "ahmed.mustafa@example.com",
    companyName: "Cequens"
  };

  return msg.replace(/@\[([^\]]+)\]\(([^)]+)\)/g, (match, display, id) => {
    return dummyData[id] || `@${display}`;
  });
};

export default function CampaignsCreatePage() {
  console.log("CampaignsCreatePage: Loading state and test button logic applied");
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const createCampaignMutation = useCreateCampaign()
  const { data: segments = [], isLoading: segmentsLoading } = useSegments()
  const { data: allContacts = [] } = useContacts(undefined, true) // Get all contacts for "All contacts" option

  const [isDirty, setIsDirty] = React.useState(false)
  const [isInitialLoading, setIsInitialLoading] = React.useState(true)
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = React.useState(0)
  const [connectedChannels, setConnectedChannels] = React.useState<string[]>([])
  const [senderIds, setSenderIds] = React.useState<Array<{ id: string; label: string; channel: string; status?: "verified" | "pending" | "restricted" }>>([])
  const [showDiscardDialog, setShowDiscardDialog] = React.useState(false)
  const [pendingNavigation, setPendingNavigation] = React.useState<string | null>(null)
  const [shouldBlockNavigation, setShouldBlockNavigation] = React.useState(false)
  const [templateSearchQuery, setTemplateSearchQuery] = React.useState("")
  const [selectedTemplateCategory, setSelectedTemplateCategory] = React.useState<WhatsAppTemplateCategory | "ALL">("ALL")
  const [hoveredTemplateId, setHoveredTemplateId] = React.useState<string | null>(null)
  const [isCsvImportDrawerOpen, setIsCsvImportDrawerOpen] = React.useState(false)
  const [isSmsTemplateDialogOpen, setIsSmsTemplateDialogOpen] = React.useState(false)
  const [smsTemplateSearch, setSmsTemplateSearch] = React.useState("")
  const [selectedRecentFileId, setSelectedRecentFileId] = React.useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isSendingTest, setIsSendingTest] = React.useState(false)

  const handleSendTest = () => {
    setIsSendingTest(true)
    setTimeout(() => {
      toast.success(`${formData.type === "Email" ? "Test email" : "Test message"} sent successfully!`)
      setIsSendingTest(false)
    }, 1500)
  }


  const recentFiles = [
    { id: "rf1", name: "Summer_Promotion_Contacts.csv", date: "2024-03-01", count: 1250 },
    { id: "rf2", name: "February_Newsletter_Active.xlsx", date: "2024-02-15", count: 850 },
    { id: "rf3", name: "High_Value_Customers.csv", date: "2024-02-10", count: 320 },
  ]

  interface TriggerInput {
    name: string
    label: string
    type: "text" | "number" | "select"
    placeholder?: string
    required?: boolean
    options?: { label: string; value: string }[]
  }

  interface Trigger {
    value: string
    label: string
    description: string
    inputs?: TriggerInput[]
  }

  interface TriggerCategory {
    id: string
    label: string
    description?: string
    icon?: React.ReactNode
    triggers: Trigger[]
  }

  // Trigger Data Structure
  const triggerCategories = React.useMemo<TriggerCategory[]>(() => [
    {
      id: "shopify",
      label: "Shopify",
      description: "Triggers from your connected Shopify store",
      icon: <img src="/assets/shopify.png" alt="Shopify" className="h-5 w-5 object-contain" />,
      triggers: [
        { value: "abandoned_cart", label: "Abandoned Cart", description: "Customer adds items but doesn't checkout after 1 hour" },
        { value: "order_placed", label: "Order Placed", description: "New order is successfully created" },
        { value: "order_fulfilled", label: "Order Fulfilled", description: "Order status changes to fulfilled/shipped" },
        { value: "payment_failed", label: "Payment Failed", description: "Customer transaction is declined" },
        {
          value: "high_value_order",
          label: "High Value Order",
          description: "Order value exceeds configured threshold",
          inputs: [
            { name: "minAmount", label: "Minimum Order Amount", type: "number", placeholder: "e.g., 500", required: true }
          ]
        }
      ]
    },
    {
      id: "crm",
      label: "CRM & User Lifecycle",
      description: "Events related to user account and journey",
      icon: <User className="h-5 w-5" />,
      triggers: [
        { value: "signup", label: "User Signs Up", description: "New user account created" },
        { value: "profile_updated", label: "Profile Updated", description: "User updates their personal information" },
        { value: "churn_risk", label: "Churn Risk Detected", description: "AI prediction indicates high risk of user leaving" },
        { value: "subscription_renewed", label: "Subscription Renewed", description: "Recurring subscription payment successful" }
      ]
    },
    {
      id: "support",
      label: "Support & Ticketing",
      description: "Customer service interactions and updates",
      icon: <MessageSquareIcon className="h-5 w-5" />,
      triggers: [
        { value: "ticket_created", label: "Ticket Created", description: "New support ticket opened by customer" },
        { value: "ticket_resolved", label: "Ticket Resolved", description: "Support ticket marked as resolved" },
        { value: "csat_feedback", label: "CSAT Feedback Request", description: "Trigger after ticket closure to gather feedback" }
      ]
    },
    {
      id: "custom",
      label: "Custom Events",
      description: "Define your own business specific events",
      icon: <Zap className="h-5 w-5" />,
      triggers: [
        {
          value: "custom_event",
          label: "Custom API Event",
          description: "Trigger via REST API webhook",
          inputs: [
            { name: "eventName", label: "Event Name", type: "text", placeholder: "e.g., user.login", required: true }
          ]
        },
        {
          value: "webhook_received",
          label: "Webhook Received",
          description: "Generic webhook payload received",
          inputs: [
            { name: "webhookName", label: "Webhook Source/Name", type: "text", placeholder: "e.g., payment_gateway", required: true }
          ]
        }
      ]
    }
  ], [])


  const steps = [
    { id: 0, label: "Details", description: "Campaign information" },
    { id: 1, label: (location.state as any)?.type === "Condition based" ? "Targeting" : "Recipients", description: (location.state as any)?.type === "Condition based" ? "Choose trigger" : "Select audience" },
    { id: 2, label: "Content", description: "Message content" },
    { id: 3, label: "Review and Send", description: "Send timing & review" }
  ]

  const isEditMode = location.state && (location.state as any).campaign
  const editCampaignName = isEditMode ? (location.state as any).campaign.name : ""

  usePageTitle(isEditMode ? `Edit ${editCampaignName}` : "Create Campaign")

  // Handle page refresh/close
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
        return ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isDirty])

  // Intercept navigation attempts using popstate
  React.useEffect(() => {
    if (!isDirty) return

    const handlePopState = (e: PopStateEvent) => {
      if (isDirty && !shouldBlockNavigation) {
        // Prevent navigation and show dialog
        setPendingNavigation(window.location.pathname)
        setShowDiscardDialog(true)
        // Push current state back to prevent navigation
        window.history.pushState(null, "", "/engage/campaigns/create")
      }
    }

    // Push a state to track navigation
    window.history.pushState(null, "", window.location.pathname)
    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [isDirty, shouldBlockNavigation])

  // Watch for location changes (programmatic navigation)
  const prevLocationRef = React.useRef(location.pathname)
  React.useEffect(() => {
    // Only intercept if we're trying to navigate away from this page
    if (location.pathname !== "/engage/campaigns/create" && prevLocationRef.current === "/engage/campaigns/create") {
      if (isDirty && !shouldBlockNavigation) {
        // Prevent navigation and show dialog
        setPendingNavigation(location.pathname)
        setShowDiscardDialog(true)
        // Navigate back to prevent the navigation
        window.history.pushState(null, "", "/engage/campaigns/create")
        return
      }
    }
    prevLocationRef.current = location.pathname
  }, [location.pathname, isDirty, shouldBlockNavigation])

  // Get current date/time for scheduling
  const now = new Date()
  const defaultDate = now.toISOString().split('T')[0]
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // Ensure mock segment and templates exist for prefilling
  const firstSegmentId = segments.length > 0 ? segments[0].id : "all-contacts"
  const firstTemplateId = mockWhatsAppTemplates.find(t => t.status === "APPROVED")?.id || ""

  // Initialize form data
  const [formData, setFormData] = React.useState<CampaignFormData>(() => {
    const state = location.state as any;
    const campaign = state?.campaign;

    // If editing an existing campaign, map its fields
    if (campaign) {
      const isScheduled = campaign.schedule_type === "scheduled";
      const isRecurring = campaign.schedule_type === "recurring";

      let scheduledDate = defaultDate;
      let scheduledTime = defaultTime;

      if (isScheduled && campaign.sent_date) {
        const dateObj = new Date(campaign.sent_date);
        scheduledDate = dateObj.toISOString().split('T')[0];
        scheduledTime = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
      }

      // Hack for visual Edit Mode: 
      // Because deep template/segment info isn't on the DB object yet, 
      // we attach fallbacks so the 'Review & Send' step and wizard are fully populated.
      const mappedChannel = campaign.channel || "";
      const isWhatsApp = mappedChannel === "Whatsapp";

      return {
        name: campaign.name || "",
        campaignType: campaign.type === "Condition based" ? "condition" : "broadcast",
        entryPoint: "direct",
        type: mappedChannel,
        status: campaign.status || "Draft",
        senderId: "", // Will be auto-selected below
        recipientSource: "segments" as const,
        manualNumbers: "",
        selectedSegmentId: firstSegmentId, // Mock selected segment
        recipients: campaign.recipients || 0,
        description: "",
        subject: mappedChannel === "Email" ? `Edit: ${campaign.name}` : "",
        message: isWhatsApp ? "" : `Resuming draft for ${campaign.name}...`, // Mock message
        scheduleType: campaign.schedule_type || "now",
        scheduledDate,
        scheduledTime,
        recurringStartDate: defaultDate,
        recurringEndDate: format(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // +1 week
        recurringSchedule: campaign.recurring_schedule || {
          "Monday": [9, 10, 11, 12, 13, 14, 15, 16, 17],
          "Tuesday": [9, 10, 11, 12, 13, 14, 15, 16, 17],
          "Wednesday": [9, 10, 11, 12, 13, 14, 15, 16, 17],
          "Thursday": [9, 10, 11, 12, 13, 14, 15, 16, 17],
          "Friday": [9, 10, 11, 12, 13, 14, 15, 16, 17],
          "Saturday": [],
          "Sunday": []
        },
        selectedTemplateId: isWhatsApp ? firstTemplateId : "", // Mock template
        templateVariables: {},
        selectedFlowId: "",
        triggerCategory: "",
        trigger: "",
        triggerConfig: {},
        includeCtaLink: false,
        ctaLinkUrl: "",
        isPersonalizationEnabled: false,
        includeGoogleAnalytics: false,
        gaSource: "",
        gaMedium: "",
        gaCampaignName: "",
        voiceType: "tts",
        voiceContent: "",
        voiceFileUrl: "",
        voiceVoiceId: "danielle_f_us",
        voiceSpeed: "1 (Normal)",
        voiceDelay: "No Delay"
      }
    }

    // Default initialization when creating new
    return {
      name: state?.name || "",
      campaignType: state?.type === "Condition based" ? "condition" : "broadcast",
      entryPoint: state?.entryPoint || "direct",
      type: "",
      status: "Draft",
      senderId: "",
      recipientSource: "segments",
      manualNumbers: "",
      selectedSegmentId: "",
      recipients: 0,
      description: "",
      subject: "",
      message: "",
      scheduleType: "now",
      scheduledDate: defaultDate,
      scheduledTime: defaultTime,
      recurringStartDate: defaultDate,
      recurringEndDate: format(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // +1 week
      recurringSchedule: {
        "Monday": [9, 10, 11, 12, 13, 14, 15, 16, 17],
        "Tuesday": [9, 10, 11, 12, 13, 14, 15, 16, 17],
        "Wednesday": [9, 10, 11, 12, 13, 14, 15, 16, 17],
        "Thursday": [9, 10, 11, 12, 13, 14, 15, 16, 17],
        "Friday": [9, 10, 11, 12, 13, 14, 15, 16, 17],
        "Saturday": [],
        "Sunday": []
      },
      selectedTemplateId: "",
      templateVariables: {},
      selectedFlowId: "",
      triggerCategory: "",
      trigger: "",
      triggerConfig: {},
      includeCtaLink: false,
      ctaLinkUrl: "",
      isPersonalizationEnabled: false,
      includeGoogleAnalytics: false,
      gaSource: "",
      gaMedium: "",
      gaCampaignName: "",
      voiceType: "tts",
      voiceContent: "",
      voiceFileUrl: "",
      voiceVoiceId: "danielle_f_us",
      voiceSpeed: "1 (Normal)",
      voiceDelay: "No Delay"
    }
  })

  // Get selected segment to calculate recipients
  const selectedSegment = React.useMemo(() => {
    if (!formData.selectedSegmentId) return null
    if (formData.selectedSegmentId === "all-contacts") return { id: "all-contacts", name: "All Contacts", contact_ids: allContacts.map(c => c.id) }
    // Handle temporary selection from contacts page
    if (formData.selectedSegmentId === "temp-selection") {
      return {
        id: "temp-selection",
        name: "Selected Contacts",
        contact_ids: (location.state as any)?.selectedContactIds || []
      }
    }
    return segments.find(s => s.id === formData.selectedSegmentId) || null
  }, [segments, formData.selectedSegmentId, allContacts, location.state])

  // Calculate recipients from selected segment or manual input
  React.useEffect(() => {
    if (formData.recipientSource === "segments") {
      if (selectedSegment) {
        setFormData(prev => ({
          ...prev,
          recipients: selectedSegment.contact_ids?.length || 0
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          recipients: 0
        }))
      }
    } else if (formData.recipientSource === "manual") {
      const numbers = formData.manualNumbers.split(',').map(n => n.trim()).filter(n => n !== "")
      setFormData(prev => ({
        ...prev,
        recipients: numbers.length
      }))
    }
  }, [selectedSegment, formData.recipientSource, formData.manualNumbers])

  // Check if we have selected contacts from navigation state OR a saved campaign with recipients
  React.useEffect(() => {
    const state = location.state as { selectedContactIds?: string[], campaign?: any } | null
    if (state?.selectedContactIds && state.selectedContactIds.length > 0) {
      setFormData(prev => ({
        ...prev,
        selectedSegmentId: "temp-selection",
        recipients: state.selectedContactIds!.length
      }))
    } else if (state?.campaign && state.campaign.recipients > 0 && !formData.selectedSegmentId) {
      // Just prefill the visually-friendly "temp-selection" badge if we loaded from DB and have recipient counts
      setFormData(prev => ({
        ...prev,
        selectedSegmentId: "temp-selection",
        recipients: state.campaign.recipients
      }))
    }
  }, [location.state])

  // Load user's connected channels and sender IDs
  React.useEffect(() => {
    const loadChannelsAndSenderIds = async () => {
      if (!user?.id) {
        setIsInitialLoading(false)
        return
      }

      try {
        // Get connected channels from database
        const channels = await getUserConnectedChannels(user.id)
        if (!channels.includes("voice")) {
          channels.push("voice")
        }
        setConnectedChannels(channels)

        // Load sender IDs from configured channels
        const allSenderIds: Array<{ id: string; label: string; channel: string; status?: "verified" | "pending" | "restricted" }> = []

        // Load WhatsApp sender IDs (phone numbers)
        if (channels.includes("whatsapp")) {
          const whatsappConfig = loadWhatsAppConfig()
          if (whatsappConfig?.phoneNumbers) {
            whatsappConfig.phoneNumbers.forEach((phone) => {
              allSenderIds.push({
                id: phone.phoneNumber,
                label: phone.displayName || phone.phoneNumber,
                channel: "whatsapp",
                status: phone.status as "verified" | "pending" | "restricted" | undefined
              })
            })
          }
        }

        // Load SMS sender IDs
        if (channels.includes("sms")) {
          const smsConfig = loadSMSConfig()
          if (smsConfig && smsConfig.senderIds && smsConfig.senderIds.length > 0) {
            smsConfig.senderIds.forEach((sender) => {
              allSenderIds.push({
                id: sender.id,
                label: `${sender.name} (${sender.senderId})`,
                channel: "sms",
                status: (sender.status === "active" ? "verified" : sender.status) as "verified" | "pending" | "restricted"
              })
            })
          } else {
            // Fallback to default if not saved in localStorage yet
            allSenderIds.push({
              id: "pre-reg-1",
              label: "Vodafone (+1234567890)",
              channel: "sms",
              status: "verified"
            })
          }
        }

        // Load Email sender IDs
        if (channels.includes("email")) {
          allSenderIds.push({
            id: "marketing@company.com",
            label: "marketing@company.com",
            channel: "email",
            status: "verified"
          })
          allSenderIds.push({
            id: "support@company.com",
            label: "support@company.com",
            channel: "email",
            status: "verified"
          })
        }

        // Load Voice sender IDs
        if (channels.includes("voice")) {
          allSenderIds.push({
            id: "voice-main",
            label: "Main Voice Line (+1234567890)",
            channel: "voice",
            status: "verified"
          })
        }

        setSenderIds(allSenderIds)
      } catch (error) {
        console.error("Error loading channels and sender IDs:", error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadChannelsAndSenderIds()
  }, [user?.id])

  // Filter sender IDs based on selected campaign type
  const availableSenderIds = React.useMemo(() => {
    if (!formData.type) return []
    return senderIds.filter(sender => sender.channel.toLowerCase() === formData.type.toLowerCase())
  }, [senderIds, formData.type])

  // Clear sender ID if it's not valid for the selected type, or auto-select first if none selected
  React.useEffect(() => {
    if (formData.type && availableSenderIds.length > 0) {
      const currentSenderId = formData.senderId
      if (currentSenderId) {
        const isValidSender = availableSenderIds.some(sender => sender.id === currentSenderId)
        if (!isValidSender) {
          // Auto-select first sender ID if current one is invalid
          setFormData(prev => ({ ...prev, senderId: availableSenderIds[0].id }))
        }
      } else {
        // Auto-select first sender ID if none selected
        setFormData(prev => ({ ...prev, senderId: availableSenderIds[0].id }))
      }
    } else if (formData.type && availableSenderIds.length === 0 && formData.senderId) {
      // Clear sender ID if no available sender IDs for the type
      setFormData(prev => ({ ...prev, senderId: "" }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.type, availableSenderIds])

  // Get verification icon based on status
  const getVerificationIcon = (status?: "verified" | "pending" | "restricted", senderId?: string) => {
    switch (status) {
      case "verified":
        // Meta blue verification checkmark badge
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <g clipPath={`url(#clip0_meta_${senderId || 'default'})`}>
              <path fillRule="evenodd" clipRule="evenodd" d="M93.9979 49.9999L99.4459 39.9939C100.604 37.8669 99.8909 35.2049 97.8239 33.9419L88.1029 28.0009L87.8189 16.6119C87.7579 14.1899 85.8099 12.2419 83.3879 12.1809L71.9989 11.8969L66.0579 2.17593C64.7949 0.10893 62.1329 -0.60407 60.0059 0.55393L49.9999 6.00193L39.9939 0.55393C37.8669 -0.60407 35.2049 0.10893 33.9419 2.17593L28.0009 11.8969L16.6119 12.1809C14.1899 12.2419 12.2419 14.1899 12.1819 16.6119L11.8969 28.0009L2.17593 33.9419C0.10893 35.2049 -0.60407 37.8669 0.55393 39.9939L6.00193 49.9999L0.55393 60.0059C-0.60407 62.1329 0.10893 64.7949 2.17593 66.0579L11.8969 71.9989L12.1809 83.3879C12.2419 85.8089 14.1899 87.7579 16.6119 87.8179L28.0009 88.1029L33.9419 97.8239C35.2049 99.8909 37.8669 100.604 39.9939 99.4459L49.9999 93.9979L60.0059 99.4459C62.1329 100.604 64.7949 99.8909 66.0579 97.8239L71.9989 88.1029L83.3879 87.8179C85.8099 87.7579 87.7579 85.8089 87.8189 83.3879L88.1029 71.9989L97.8239 66.0579C99.8909 64.7949 100.604 62.1329 99.4459 60.0059L93.9979 49.9999ZM71.0919 42.1279L70.7879 42.3809C62.1289 49.5969 54.1429 57.5839 46.9269 66.2419L46.6739 66.5459C45.8569 67.5269 44.6639 68.1189 43.3879 68.1769C42.1119 68.2349 40.8709 67.7529 39.9679 66.8499L28.6039 55.4869C26.8289 53.7119 26.8289 50.8329 28.6039 49.0589C30.3799 47.2839 33.2569 47.2839 35.0329 49.0589L42.9149 56.9409C49.6859 49.1919 57.0589 41.9879 64.9679 35.3979L65.2719 35.1449C67.1999 33.5379 70.0669 33.7979 71.6729 35.7269C73.2809 37.6549 73.0199 40.5209 71.0919 42.1279Z" fill="#3897F0" />
              <path fillRule="evenodd" clipRule="evenodd" d="M71.0919 42.1279L70.7879 42.3809C62.1289 49.5969 54.1429 57.5839 46.9269 66.2419L46.6739 66.5459C45.8569 67.5269 44.6639 68.1189 43.3879 68.1769C42.1119 68.2349 40.8709 67.7529 39.9679 66.8499L28.6039 55.4869C26.8289 53.7119 26.8289 50.8329 28.6039 49.0589C30.3799 47.2839 33.2569 47.2839 35.0329 49.0589L42.9149 56.9409C49.6859 49.1919 57.0589 41.9879 64.9679 35.3979L65.2719 35.1449C67.1999 33.5379 70.0669 33.7979 71.6729 35.7269C73.2809 37.6549 73.0199 40.5209 71.0919 42.1279Z" fill="white" />
            </g>
            <defs>
              <clipPath id={`clip0_meta_${senderId || 'default'}`}>
                <rect width="100" height="100" fill="white" />
              </clipPath>
            </defs>
          </svg>
        )
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case "restricted":
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return null
    }
  }

  // Get selected sender for display
  const selectedSender = React.useMemo(() => {
    return availableSenderIds.find(sender => sender.id === formData.senderId)
  }, [availableSenderIds, formData.senderId])

  // Helper functions for Recipients step
  const formatSegmentName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  const getContactCount = (segmentId: string | null): number => {
    if (!segmentId) return 0
    if (segmentId === "all-contacts") return allContacts.length
    const segment = segments.find(s => s.id === segmentId)
    return segment?.contact_ids?.length || 0
  }

  const renderSegmentItem = (segment: { id: string; name: string; contact_ids?: string[] }) => {
    const segmentName = formatSegmentName(segment.name)
    const contactCount = segment.contact_ids?.length || 0

    return (
      <SelectItem
        key={segment.id}
        value={segment.id}
        className="pr-2 pl-2 [&>span:first-child]:hidden"
      >
        <div className="flex items-center gap-2 w-full">
          <div className="w-[120px] truncate">{segmentName}</div>
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <Badge variant="secondary">
              {contactCount} contacts
            </Badge>
            <SelectPrimitive.ItemIndicator>
              <Check className="h-4 w-4" />
            </SelectPrimitive.ItemIndicator>
          </div>
        </div>
      </SelectItem>
    )
  }

  const renderRecipientsDescription = () => {
    if (formData.recipientSource === "segments" && !selectedSegment) {
      return "Select a segment to target your campaign"
    }

    if (formData.recipientSource === "upload") {
      return "Upload a CSV file containing your contacts"
    }

    if (formData.recipientSource === "manual" && formData.recipients === 0) {
      return "Enter mobile numbers to target"
    }

    const recipientCount = formData.recipients.toLocaleString()
    const plural = formData.recipients !== 1 ? 's' : ''

    return (
      <span className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        {recipientCount} contact{plural} will receive this campaign
      </span>
    )
  }

  // Render selected segment value for SelectValue
  const renderSelectedSegmentValue = () => {
    if (!formData.selectedSegmentId) return null

    if (formData.selectedSegmentId === "all-contacts") {
      return (
        <div className="flex items-center gap-2">
          <span>All Contacts</span>
          <Badge variant="secondary" className="flex-shrink-0">
            {allContacts.length} contacts
          </Badge>
        </div>
      )
    }

    if (formData.selectedSegmentId === "temp-selection") {
      const state = location.state as { selectedContactIds?: string[] } | null
      const count = state?.selectedContactIds?.length || 0
      return (
        <div className="flex items-center gap-2">
          <span>Selected Contacts</span>
          <Badge variant="secondary" className="flex-shrink-0">
            {count} contacts
          </Badge>
        </div>
      )
    }

    const segment = segments.find(s => s.id === formData.selectedSegmentId)
    if (!segment) return null

    const segmentName = formatSegmentName(segment.name)
    const contactCount = segment.contact_ids?.length || 0

    return (
      <div className="flex items-center gap-2">
        <span>{segmentName}</span>
        <Badge variant="secondary" className="flex-shrink-0">
          {contactCount} contacts
        </Badge>
      </div>
    )
  }

  const handleInputChange = (field: keyof CampaignFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setIsDirty(true)
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Character limits based on type
  const getCharacterLimit = () => {
    switch (formData.type) {
      case "SMS":
        return 160
      case "Whatsapp":
        return 4096
      case "Email":
        return 10000
      case "Voice":
        return 5000
      default:
        return 10000
    }
  }

  const getMessageLength = (() => {
    if (formData.type === "Voice") {
      return formData.voiceType === "tts" ? (formData.voiceContent?.length || 0) : 0
    }
    let len = getPlainTextMessage(formData.message).length
    if (formData.type === "SMS" && formData.includeCtaLink && formData.ctaLinkUrl) {
      len += 26 // \n\nhttps://cqns.lk/y7Xx9p (26 chars)
    }
    return len
  })()
  const characterLimit = getCharacterLimit()
  const isOverLimit = getMessageLength > characterLimit

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Campaign name is required"
    }

    if (!formData.type) {
      errors.type = "Campaign type is required"
    }

    if (!formData.senderId.trim() && formData.type !== "Voice") {
      errors.senderId = "Sender ID is required"
    }

    if (formData.campaignType === "condition") {
      if (!formData.selectedFlowId) {
        errors.selectedFlowId = "Please select a flow"
      }
    } else {
      if (formData.recipientSource === "segments") {
        if (!formData.selectedSegmentId) {
          errors.selectedSegmentId = "Please select an audience"
        } else if (formData.selectedSegmentId && formData.selectedSegmentId !== "all-contacts" && formData.selectedSegmentId !== "temp-selection" && formData.recipients === 0) {
          errors.selectedSegmentId = "Selected segment has no contacts"
        } else if (formData.selectedSegmentId === "all-contacts" && allContacts.length === 0) {
          errors.selectedSegmentId = "No contacts available"
        }
      } else if (formData.recipientSource === "manual") {
        if (!formData.manualNumbers.trim()) {
          errors.manualNumbers = "Please enter at least one number"
        } else if (formData.recipients === 0) {
          errors.manualNumbers = "Format is invalid, please use comma-separated numbers"
        }
      } else if (formData.recipientSource === "upload") {
        // Validation could be added here if file upload state tracked
        if (formData.recipients === 0 && !isCsvImportDrawerOpen) {
          errors.upload = "Please select/upload a list"
        }
      }
    }

    if (formData.type === "Email" && !formData.subject.trim()) {
      errors.subject = "Subject line is required for email campaigns"
    }

    // WhatsApp template validation
    if (formData.type === "Whatsapp") {
      if (!formData.selectedTemplateId) {
        errors.selectedTemplateId = "Please select a template"
      } else if (selectedTemplate) {
        // Validate template variables
        templateVariables.forEach(variable => {
          if (variable.required && !formData.templateVariables[variable.name]?.trim()) {
            errors[`templateVar_${variable.name}`] = `${variable.name} is required`
          }
        })
      }
    } else if (formData.type === "Voice") {
      if (formData.voiceType === "tts" && !(formData.voiceContent || "").trim()) {
        errors.message = "Speech text is required"
      } else if (formData.voiceType === "upload" && !formData.voiceFileUrl) {
        errors.message = "Voice record is required"
      } else if (formData.voiceType === "tts" && isOverLimit) {
        errors.message = `Speech text exceeds ${characterLimit} character limit`
      }
    } else {
      // Message validation for non-WhatsApp campaigns
      if (!formData.message.trim()) {
        errors.message = "Message content is required"
      } else if (isOverLimit) {
        errors.message = `Message exceeds ${characterLimit} character limit`
      }
    }

    if (formData.scheduleType === "scheduled") {
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
      if (scheduledDateTime < now) {
        errors.scheduledDate = "Scheduled date must be in the future"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    if (step === 0) {
      // Validate Details step
      if (!formData.name.trim()) {
        errors.name = "Campaign name is required"
      }
      if (!formData.type) {
        errors.type = "Campaign type is required"
      }
      if (!formData.senderId.trim() && formData.type !== "Voice") {
        errors.senderId = "Sender ID is required"
      }
    } else if (step === 1) {
      // Validate Recipients/Targeting step
      if (formData.campaignType === "condition") {
        if (!formData.selectedFlowId) {
          errors.selectedFlowId = "Please select a flow"
        }
      } else {
        // Broadcast validation
        if (formData.recipientSource === "segments") {
          if (formData.selectedSegmentId && formData.selectedSegmentId !== "all-contacts" && formData.selectedSegmentId !== "temp-selection" && formData.recipients === 0) {
            errors.selectedSegmentId = "Selected segment has no contacts"
          }
          if (formData.selectedSegmentId === "all-contacts" && allContacts.length === 0) {
            errors.selectedSegmentId = "No contacts available"
          }
          if (!formData.selectedSegmentId) {
            errors.selectedSegmentId = "Please select an audience"
          }
        } else if (formData.recipientSource === "manual") {
          if (!formData.manualNumbers.trim()) {
            errors.manualNumbers = "Please enter at least one number"
          } else if (formData.recipients === 0) {
            errors.manualNumbers = "Format is invalid, please use comma-separated numbers"
          }
        } else if (formData.recipientSource === "upload") {
          if (formData.recipients === 0) {
            errors.upload = "Please upload a sheet or select a recent file"
          }
        }
      }
    } else if (step === 2) {
      // Validate Content step
      if (formData.type === "Email" && !formData.subject.trim()) {
        errors.subject = "Subject line is required for email campaigns"
      }

      // WhatsApp template validation
      if (formData.type === "Whatsapp") {
        if (!formData.selectedTemplateId) {
          errors.selectedTemplateId = "Please select a template"
        } else if (selectedTemplate) {
          // Validate template variables
          templateVariables.forEach(variable => {
            if (variable.required && !formData.templateVariables[variable.name]?.trim()) {
              errors[`templateVar_${variable.name}`] = `${variable.name} is required`
            }
          })
        }
      } else if (formData.type === "Voice") {
        if (formData.voiceType === "tts" && !(formData.voiceContent || "").trim()) {
          errors.message = "Speech text is required"
        } else if (formData.voiceType === "upload" && !formData.voiceFileUrl) {
          errors.message = "Voice record is required"
        } else if (formData.voiceType === "tts" && isOverLimit) {
          errors.message = `Speech text exceeds ${characterLimit} character limit`
        }
      } else {
        // Message validation for non-WhatsApp campaigns
        if (!formData.message.trim()) {
          errors.message = "Message content is required"
        } else if (isOverLimit) {
          errors.message = `Message exceeds ${characterLimit} character limit`
        }

        // SMS specifically - CTA and GA validation
        if (formData.type === "SMS") {
          if (formData.includeCtaLink && !formData.ctaLinkUrl?.trim()) {
            errors.message = "Please enter a valid URL for your Call-to-Action link"
          }
          if (formData.includeGoogleAnalytics) {
            if (!formData.gaSource?.trim()) {
              errors.message = "Google Analytics Source is required"
            } else if (!formData.gaMedium?.trim()) {
              errors.message = "Google Analytics Medium is required"
            } else if (!formData.gaCampaignName?.trim()) {
              errors.message = "Google Analytics Campaign Name is required"
            }
          }
        }
      }
    } else if (step === 3) {
      // Validate Schedule step
      if (formData.scheduleType === "scheduled") {
        const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
        if (scheduledDateTime < now) {
          errors.scheduledDate = "Scheduled date must be in the future"
        }
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    } else {
      toast.error("Please fix the errors before continuing")
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleDiscardClick = () => {
    if (isDirty) {
      setShowDiscardDialog(true)
    } else {
      navigate("/engage/campaigns")
    }
  }

  const handleDiscard = () => {
    setShowDiscardDialog(false)
    const targetPath = pendingNavigation || "/engage/campaigns"
    setPendingNavigation(null)
    setIsDirty(false) // Reset dirty state before navigation
    setShouldBlockNavigation(true) // Allow navigation
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      navigate(targetPath)
    }, 0)
  }

  const handleDiscardCancel = () => {
    setShowDiscardDialog(false)
    setPendingNavigation(null)
  }

  const handleSave = async (isDraft = false) => {
    // Only require name for drafts
    if (isDraft) {
      if (!formData.name.trim()) {
        setFormErrors({ name: "Campaign name is required to save a draft" })
        toast.error("Please enter a campaign name")
        setCurrentStep(0)
        return
      }
    } else if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      // Go to first step with errors
      if (!formData.name.trim() || !formData.type || !formData.senderId.trim()) {
        setCurrentStep(0)
      } else if (!formData.selectedSegmentId) {
        setCurrentStep(1)
      } else if (formData.type === "Email" && !formData.subject.trim() || !formData.message.trim()) {
        setCurrentStep(2)
      } else {
        setCurrentStep(3)
      }
      return
    }

    try {
      const scheduledDateTime = formData.scheduleType === "scheduled"
        ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
        : null

      const sentDate = formData.scheduleType === "now"
        ? new Date().toISOString()
        : formData.scheduleType === "recurring"
          ? (formData.recurringStartDate ? new Date(`${formData.recurringStartDate}T00:00:00`).toISOString() : new Date().toISOString())
          : scheduledDateTime

      const campaignData: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
        name: formData.name.trim(),
        type: formData.campaignType === "condition" ? "Condition based" : "Broadcast",
        channel: formData.type as "Email" | "SMS" | "Whatsapp",
        status: isDraft ? "Draft" : "Active",
        recipients: formData.recipients,
        sent_date: isDraft ? null : sentDate,
        schedule_type: formData.scheduleType,
        recurring_schedule: formData.recurringSchedule,
        open_rate: 0,
        click_rate: 0,
        delivery_rate: 0,
        read_rate: 0,
      }

      await createCampaignMutation.mutateAsync(campaignData)
      setIsDirty(false) // Reset dirty state after successful save
      toast.success(
        isDraft
          ? "Draft saved successfully!"
          : formData.scheduleType === "now"
            ? "Campaign created successfully!"
            : formData.scheduleType === "recurring"
              ? "Recurring campaign scheduled successfully!"
              : "Campaign scheduled successfully!"
      )
      navigate("/engage/campaigns")
    } catch (error) {
      console.error("Error creating campaign:", error)
      toast.error("Failed to create campaign. Please try again.")
    }
  }


  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Email":
        return <EnvelopeSimple className="h-4 w-4" weight="fill" />
      case "SMS":
        return <ChatText className="h-4 w-4" weight="fill" />
      case "Whatsapp":
        return <img src="/icons/WhatsApp.svg" alt="WhatsApp" className="h-4 w-4" />
      case "Voice":
        return <PhoneIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      default:
        return null
    }
  }

  // Get selected template
  const selectedTemplate = React.useMemo(() => {
    if (!formData.selectedTemplateId) return null
    return mockWhatsAppTemplates.find(t => t.id === formData.selectedTemplateId) || null
  }, [formData.selectedTemplateId])

  // Get all variables from selected template
  const templateVariables = React.useMemo(() => {
    if (!selectedTemplate) return []
    const bodyComponent = selectedTemplate.components.find(c => c.type === "BODY")
    return bodyComponent?.variables || []
  }, [selectedTemplate])

  // Check if current step is valid (for disabling Next button) - without setting errors
  const isCurrentStepValid = React.useMemo(() => {
    if (currentStep === 0) {
      // Validate Details step
      const hasName = formData.name.trim() !== ""
      const hasType = formData.type !== ""
      // Sender ID is required if type is selected
      // If sender IDs are available in dropdown, one must be selected
      // If no sender IDs available, manual entry is required
      const hasSenderId = formData.type === "Voice" ? true : (formData.type ? formData.senderId.trim() !== "" : true)
      return hasName && hasType && hasSenderId
    } else if (currentStep === 1) {
      // Validate Recipients step
      if (formData.campaignType === "condition") {
        if (!formData.selectedFlowId) return false
        return true
      }

      if (formData.recipientSource === "segments") {
        if (!formData.selectedSegmentId) return false
        if (formData.selectedSegmentId === "all-contacts") {
          return allContacts.length > 0
        }
        const segment = segments.find(s => s.id === formData.selectedSegmentId)
        return segment ? (segment.contact_ids?.length || 0) > 0 : false
      }

      // For manual and upload, we just need recipients > 0
      return formData.recipients > 0
    } else if (currentStep === 2) {
      // Validate Content step
      const hasSubject = formData.type !== "Email" || formData.subject.trim() !== ""

      // WhatsApp template validation
      if (formData.type === "Whatsapp") {
        if (!formData.selectedTemplateId) return false
        if (selectedTemplate && templateVariables.length > 0) {
          // Check if all required variables are filled
          const allRequiredFilled = templateVariables.every(variable =>
            !variable.required || formData.templateVariables[variable.name]?.trim()
          )
          return allRequiredFilled
        }
        return true
      }

      // Message validation for Voice
      if (formData.type === "Voice") {
        if (formData.voiceType === "tts") {
          return (formData.voiceContent || "").trim() !== "" && !isOverLimit
        } else {
          return !!formData.voiceFileUrl
        }
      }

      // Message validation for non-WhatsApp/Voice
      const hasMessage = formData.message.trim() !== "" && !isOverLimit
      return hasSubject && hasMessage
    } else if (currentStep === 3) {
      // Validate Schedule step
      if (formData.scheduleType === "scheduled") {
        const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
        return scheduledDateTime >= now
      }
      return true
    }
    return true
  }, [currentStep, formData, availableSenderIds, allContacts, segments, isOverLimit, now, selectedTemplate, templateVariables])

  // Generate message from template
  const generateMessageFromTemplate = React.useCallback((template: WhatsAppTemplate | null, variables: Record<string, string>): string => {
    if (!template) return ""

    let message = ""
    const bodyComponent = template.components.find(c => c.type === "BODY")
    const footerComponent = template.components.find(c => c.type === "FOOTER")

    if (bodyComponent?.text) {
      message = bodyComponent.text
      // Replace variables {{1}}, {{2}}, etc. with actual values
      Object.keys(variables).forEach(key => {
        const value = variables[key] || `{{${key}}}`
        message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
      })
    }

    if (footerComponent?.text) {
      message += `\n\n${footerComponent.text}`
    }

    return message
  }, [])

  // Filter templates based on search and category
  const filteredTemplates = React.useMemo(() => {
    let filtered = mockWhatsAppTemplates.filter(t => t.status === "APPROVED")

    // Filter by category
    if (selectedTemplateCategory !== "ALL") {
      filtered = filtered.filter(t => t.category === selectedTemplateCategory)
    }

    // Filter by search query
    if (templateSearchQuery.trim()) {
      const query = templateSearchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.components.some(c => c.text?.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [selectedTemplateCategory, templateSearchQuery])

  // Reset template selection when switching away from WhatsApp
  React.useEffect(() => {
    if (formData.type !== "Whatsapp") {
      setFormData(prev => ({
        ...prev,
        selectedTemplateId: "",
        templateVariables: {}
      }))
    }
  }, [formData.type])

  // Generate preview message for hover
  const getHoverPreview = React.useCallback((template: WhatsAppTemplate): string => {
    const bodyComponent = template.components.find(c => c.type === "BODY")
    if (!bodyComponent?.text) return ""

    let preview = bodyComponent.text
    // Replace variables with example values or placeholders
    if (bodyComponent.variables) {
      bodyComponent.variables.forEach((variable, index) => {
        preview = preview.replace(
          new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g'),
          variable.example || `{{${variable.name}}}`
        )
      })
    }

    const footerComponent = template.components.find(c => c.type === "FOOTER")
    if (footerComponent?.text) {
      preview += `\n\n${footerComponent.text}`
    }

    return preview
  }, [])

  // Update message when template or variables change
  React.useEffect(() => {
    if (formData.type === "Whatsapp" && selectedTemplate) {
      const generatedMessage = generateMessageFromTemplate(selectedTemplate, formData.templateVariables)
      if (generatedMessage !== formData.message) {
        setFormData(prev => ({ ...prev, message: generatedMessage }))
      }
    }
  }, [selectedTemplate, formData.templateVariables, formData.type, generateMessageFromTemplate, formData.message])

  // Preview message
  const previewMessage = React.useMemo(() => {
    if (formData.type === "Whatsapp" && selectedTemplate) {
      return generateMessageFromTemplate(selectedTemplate, formData.templateVariables)
    }
    let msg = getPlainTextMessage(formData.message)
    if (formData.type === "SMS" && formData.includeCtaLink && formData.ctaLinkUrl) {
      msg += "\n\nhttps://cqns.lk/y7Xx9p"
    }
    return msg
  }, [formData.message, formData.type, selectedTemplate, formData.templateVariables, generateMessageFromTemplate, formData.includeCtaLink, formData.ctaLinkUrl])

  // Simulated message with dummy data for mockup
  const simulatedMessage = React.useMemo(() => {
    if (formData.type === "Whatsapp" && selectedTemplate) {
      return generateMessageFromTemplate(selectedTemplate, formData.templateVariables)
    }
    let msg = getMockupMessage(formData.message)
    if (formData.type === "SMS" && formData.includeCtaLink && formData.ctaLinkUrl) {
      msg += "\n\nhttps://cqns.lk/y7Xx9p"
    }
    return msg
  }, [formData.message, formData.type, selectedTemplate, formData.templateVariables, generateMessageFromTemplate, formData.includeCtaLink, formData.ctaLinkUrl])

  const canSave = React.useMemo(() => {
    const hasBasicFields = formData.name.trim() !== "" && formData.type !== "" && formData.senderId.trim() !== ""

    if (formData.type === "Whatsapp") {
      const hasTemplate = formData.selectedTemplateId !== ""
      const allRequiredVarsFilled = templateVariables.every(v =>
        !v.required || formData.templateVariables[v.name]?.trim()
      )
      return hasBasicFields && hasTemplate && allRequiredVarsFilled && !createCampaignMutation.isPending
    }

    if (formData.type === "Voice") {
      const isVoiceValid = formData.voiceType === "tts"
        ? (formData.voiceContent || "").trim() !== "" && !isOverLimit
        : !!formData.voiceFileUrl
      return hasBasicFields && isVoiceValid && !createCampaignMutation.isPending
    }

    return hasBasicFields && getPlainTextMessage(formData.message).trim() !== "" && !isOverLimit && !createCampaignMutation.isPending
  }, [formData, templateVariables, isOverLimit, createCampaignMutation.isPending])

  // Get template category badge color
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "MARKETING":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
      case "UTILITY":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "AUTHENTICATION":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // Get template status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      case "REJECTED":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // Get component icon
  const getComponentIcon = (format?: string) => {
    switch (format) {
      case "IMAGE":
        return <Image className="h-4 w-4" />
      case "VIDEO":
        return <Video className="h-4 w-4" />
      case "DOCUMENT":
        return <File className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <PageWrapper isLoading={isInitialLoading}>
      <PageHeader
        title={location.state && (location.state as any).campaign ? `Edit ${(location.state as any).campaign.name}` : "Create Campaign"}
        description={location.state && (location.state as any).campaign ? "Update your campaign configuration and recipients" : "Set up your campaign details, recipients, and message configuration"}
        isLoading={isInitialLoading}
      />

      <div className="flex flex-col gap-4">
        {isInitialLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 grid gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="grid gap-4 auto-rows-min">
              <CardSkeleton />
            </div>
          </div>
        ) : (
          <motion.div
            className="w-full"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            transition={smoothTransition}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              {/* Main Content */}
              <div className="lg:col-span-2 grid grid-cols-1 gap-4 items-start">
                {/* Step Indicator */}
                <div className="relative py-4 px-4 sm:px-4">
                  {/* Steps container */}
                  <div className="relative flex items-start gap-12">
                    {/* Progress line background - from center of first to center of last circle */}
                    <div
                      className="absolute top-4 h-0.5 border-b border-muted-foreground/15"
                      style={{
                        left: '1rem', // Half of w-8 (2rem)
                        right: '1rem', // Half of w-8 (2rem)
                        width: 'calc(80% - 1rem)'
                      }}
                    />

                    {/* Progress fill - calculated based on fixed step width (from start of step to start of next step) */}
                    <div
                      className="absolute top-4 h-0.5 bg-primary transition-all duration-300 ease-out"
                      style={{
                        left: '1rem',
                        // Fixed step segment width = step width + gap = (100% + 3rem) / steps.length
                        // Progress = currentStep segments from center of first circle to center of current circle
                        width: currentStep > 0
                          ? `calc(((100% + 3rem) / ${steps.length}) * ${currentStep})`
                          : '0'
                      }}
                    />

                    {/* Steps */}
                    {steps.map((step, index) => {
                      const isActive = currentStep === step.id
                      const isCompleted = currentStep > step.id

                      return (
                        <div key={step.id} className="flex flex-col items-start flex-1 relative z-10">
                          <div className="flex flex-col items-start gap-2 w-full">
                            {/* Step circle */}
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors flex-shrink-0 bg-background ${isActive || isCompleted
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/30 text-muted-foreground"
                                }`}
                            >
                              {isCompleted ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <span className="text-xs font-semibold">{step.id + 1}</span>
                              )}
                            </div>
                            {/* Step labels */}
                            <div className="flex flex-col items-start min-w-0 mt-1">
                              <span
                                className={`text-sm font-medium text-left ${isActive || isCompleted
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                                  }`}
                              >
                                {step.label}
                              </span>
                              <span className="text-xs text-muted-foreground text-left mt-0.5">
                                {step.description}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Step Content */}
                <div className="space-y-4">
                  {/* Step 1: Details */}
                  {currentStep === 0 && (
                    <Card className="py-5 gap-5">
                      <CardHeader>
                        <CardTitle>Campaign Details</CardTitle>
                        <CardDescription>Enter the basic information for your campaign</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-6 py-2">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Campaign Name</Label>
                              {formData.entryPoint === 'contacts_bulk' && (
                                <Badge variant="secondary" className="text-[10px] h-4 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                                  From Bulk Contacts
                                </Badge>
                              )}
                              {formData.entryPoint === 'segments_bulk' && (
                                <Badge variant="secondary" className="text-[10px] h-4 bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">
                                  From Bulk Segments
                                </Badge>
                              )}
                            </div>
                            <div className="font-medium text-base">
                              {formData.name || "Untitled Campaign"}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Campaign Goal</Label>
                            <div className="flex items-center gap-2">
                              {formData.campaignType === "broadcast" ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant="default">Broadcast</Badge>
                                  <span className="text-sm text-muted-foreground">Standard campaign</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">Condition-based</Badge>
                                  <span className="text-sm text-muted-foreground">Automated triggers</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <Field>
                          <FieldLabel>Channel *</FieldLabel>
                          <FieldContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {connectedChannels.includes("whatsapp") ? (
                                <Card
                                  className={`cursor-pointer shadow-none ${formData.type === "Whatsapp"
                                    ? "border-primary border-2"
                                    : formErrors.type
                                      ? "border-destructive border-2"
                                      : ""
                                    }`}
                                  onClick={() => {
                                    handleInputChange("type", "Whatsapp")
                                    // Reset message and sender ID when type changes
                                    if (formData.message) {
                                      handleInputChange("message", "")
                                    }
                                    handleInputChange("senderId", "")
                                  }}
                                >
                                  <CardContent className="p-4 flex flex-col items-left gap-4 text-left">
                                    <img
                                      src="/icons/WhatsApp.svg"
                                      alt="WhatsApp"
                                      className="h-6 w-6"
                                    />
                                    <div className="flex flex-col items-left gap-1">
                                      <span className="text-sm font-semibold text-foreground">
                                        WhatsApp
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        Interactive
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div>
                                        <Card className="shadow-none cursor-not-allowed opacity-50">
                                          <CardContent className="p-4 flex flex-col items-left gap-4 text-left">
                                            <img
                                              src="/icons/WhatsApp.svg"
                                              alt="WhatsApp"
                                              className="h-6 w-6"
                                            />
                                            <div className="flex flex-col items-left gap-1">
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-foreground">
                                                  WhatsApp
                                                </span>
                                                <Badge variant="secondary" className="text-xs">
                                                  Not configured
                                                </Badge>
                                              </div>
                                              <span className="text-xs text-muted-foreground">
                                                Interactive
                                              </span>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="p-3">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm">WhatsApp channel needs to be configured</p>
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="h-auto p-0 text-primary underline"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            navigate("/channels/whatsapp")
                                          }}
                                        >
                                          Configure
                                        </Button>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {connectedChannels.includes("sms") ? (
                                <Card
                                  className={`cursor-pointer shadow-none ${formData.type === "SMS"
                                    ? "border-primary border-2"
                                    : formErrors.type
                                      ? "border-destructive border-2"
                                      : ""
                                    }`}
                                  onClick={() => {
                                    handleInputChange("type", "SMS")
                                    // Reset message and sender ID when type changes
                                    if (formData.message) {
                                      handleInputChange("message", "")
                                    }
                                    handleInputChange("senderId", "")
                                  }}
                                >
                                  <CardContent className="p-4 flex flex-col items-left gap-4 text-left">
                                    <ChatText
                                      className="h-6 w-6 text-primary"
                                      weight="fill"
                                    />
                                    <div className="flex flex-col items-left gap-1">
                                      <span className="text-sm font-semibold text-foreground">
                                        SMS
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        Quick messages
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div>
                                        <Card className="shadow-none cursor-not-allowed opacity-50">
                                          <CardContent className="p-4 flex flex-col items-left gap-4 text-left">
                                            <ChatText
                                              className="h-6 w-6 text-primary opacity-50"
                                              weight="fill"
                                            />
                                            <div className="flex flex-col items-left gap-1">
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-foreground">
                                                  SMS
                                                </span>
                                                <Badge variant="secondary" className="text-xs">
                                                  Not configured
                                                </Badge>
                                              </div>
                                              <span className="text-xs text-muted-foreground">
                                                Quick messages
                                              </span>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="p-3">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm">SMS channel needs to be configured</p>
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="h-auto p-0 text-primary underline"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            navigate("/channels/sms")
                                          }}
                                        >
                                          Configure
                                        </Button>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {connectedChannels.includes("email") ? (
                                <Card
                                  className={`cursor-pointer shadow-none ${formData.type === "Email"
                                    ? "border-primary border-2"
                                    : formErrors.type
                                      ? "border-destructive border-2"
                                      : ""
                                    }`}
                                  onClick={() => {
                                    handleInputChange("type", "Email")
                                    // Reset message and sender ID when type changes
                                    if (formData.message) {
                                      handleInputChange("message", "")
                                    }
                                    handleInputChange("senderId", "")
                                  }}
                                >
                                  <CardContent className="p-4 flex flex-col items-left gap-4 text-left">
                                    <EnvelopeSimple
                                      className="h-6 w-6 text-blue-600 dark:text-blue-400"
                                      weight="fill"
                                    />
                                    <div className="flex flex-col items-left gap-1">
                                      <span className="text-sm font-semibold text-foreground">
                                        Email
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        Rich content
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div>
                                        <Card className="shadow-none cursor-not-allowed opacity-50">
                                          <CardContent className="p-4 flex flex-col items-left gap-4 text-left">
                                            <EnvelopeSimple
                                              className="h-6 w-6 text-blue-600 dark:text-blue-400 opacity-50"
                                              weight="fill"
                                            />
                                            <div className="flex flex-col items-left gap-1">
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-foreground opacity-50">
                                                  Email
                                                </span>
                                                <Badge variant="secondary" className="text-xs">
                                                  Not configured
                                                </Badge>
                                              </div>
                                              <span className="text-xs text-muted-foreground opacity-50">
                                                Rich content
                                              </span>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="p-3">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm">Email channel needs to be configured</p>
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="h-auto p-0 text-primary underline"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            navigate("/channels/email")
                                          }}
                                        >
                                          Configure
                                        </Button>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {connectedChannels.includes("voice") ? (
                                <Card
                                  className={`cursor-pointer shadow-none ${formData.type === "Voice"
                                    ? "border-primary border-2"
                                    : formErrors.type
                                      ? "border-destructive border-2"
                                      : ""
                                    }`}
                                  onClick={() => {
                                    handleInputChange("type", "Voice")
                                    // Reset message and sender ID when type changes
                                    if (formData.message) {
                                      handleInputChange("message", "")
                                    }
                                    handleInputChange("senderId", "")
                                  }}
                                >
                                    <CardContent className="p-4 flex flex-col items-left gap-4 text-left">
                                      <Phone
                                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                                        weight="fill"
                                      />
                                      <div className="flex flex-col items-left gap-1">
                                      <span className="text-sm font-semibold text-foreground">
                                        Voice
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        TTS or Audio Voice
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div>
                                        <Card className="shadow-none cursor-not-allowed opacity-50">
                                          <CardContent className="p-4 flex flex-col items-left gap-4 text-left">
                                            <Phone
                                              className="h-6 w-6 text-blue-600 dark:text-blue-400 opacity-50"
                                              weight="fill"
                                            />
                                            <div className="flex flex-col items-left gap-1">
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-foreground opacity-50">
                                                  Voice
                                                </span>
                                                <Badge variant="secondary" className="text-xs">
                                                  Not configured
                                                </Badge>
                                              </div>
                                              <span className="text-xs text-muted-foreground opacity-50">
                                                TTS or Audio Voice
                                              </span>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="p-3">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm">Voice channel needs to be configured</p>
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="h-auto p-0 text-primary underline"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            navigate("/channels/voice")
                                          }}
                                        >
                                          Configure
                                        </Button>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                            </div>
                          </FieldContent>
                          {formErrors.type && <FieldError>{formErrors.type}</FieldError>}
                        </Field>

                        <Field>
                          <FieldLabel>Sender ID {formData.type !== "Voice" && "*"}</FieldLabel>
                          <FieldContent>
                            <div className={formData.type === "Voice" ? "w-fit" : "w-[30%]"}>
                              {formData.type === "Voice" ? (
                                <div className="text-sm font-medium text-muted-foreground p-3 bg-muted/30 rounded-md border border-border/50 whitespace-nowrap">
                                  Use Random numbers instead of Caller IDs
                                </div>
                              ) : formData.type && availableSenderIds.length > 0 ? (
                                <Select
                                  value={formData.senderId}
                                  onValueChange={(value) => handleInputChange("senderId", value)}
                                >
                                  <SelectTrigger className={formErrors.senderId ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select a sender ID" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableSenderIds.map((sender) => (
                                      <SelectItem key={sender.id} value={sender.id}>
                                        <div className="flex items-center gap-2">
                                          {getVerificationIcon(sender.status, sender.id)}
                                          <span>{sender.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : formData.type ? (
                                <div className="space-y-2">
                                  <Input
                                    id="senderId"
                                    value={formData.senderId}
                                    onChange={(e) => handleInputChange("senderId", e.target.value)}
                                    placeholder="Enter sender ID"
                                    className={formErrors.senderId ? "border-destructive" : ""}
                                    disabled={!formData.type}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    No sender IDs configured for {formData.type}. Configure sender IDs in channel settings.
                                  </p>
                                </div>
                              ) : (
                                <Input
                                  id="senderId"
                                  value={formData.senderId}
                                  onChange={(e) => handleInputChange("senderId", e.target.value)}
                                  placeholder="Select campaign type first"
                                  className={formErrors.senderId ? "border-destructive" : ""}
                                  disabled
                                />
                              )}
                            </div>
                          </FieldContent>
                          {formErrors.senderId && <FieldError>{formErrors.senderId}</FieldError>}
                          <FieldDescription>
                            {formData.type && availableSenderIds.length > 0
                              ? "Select the sender identifier that recipients will see"
                              : formData.type
                                ? "Configure sender IDs in your channel settings"
                                : "Select a campaign type to choose a sender ID"}
                          </FieldDescription>
                        </Field>
                      </CardContent>
                      {/* Footer */}
                      <div className="border-t pt-4 px-4 sm:px-4">
                        <div className="flex items-center justify-between gap-4">
                          <Button
                            variant="outline"
                            onClick={handleDiscardClick}
                            className="flex-shrink-0"
                          >
                            <span className="hidden sm:inline">Discard</span>
                          </Button>
                          <Button
                            onClick={handleNext}
                            disabled={!isCurrentStepValid || isInitialLoading}
                            className="flex-shrink-0"
                          >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="h-4 w-4 sm:ml-2" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Step 2: Recipients */}
                  {currentStep === 1 && (
                    <Card className="py-5 gap-5">
                      <CardHeader>
                        <CardTitle>{formData.campaignType === "condition" ? "Campaign Trigger" : "Select Recipients"}</CardTitle>
                        <CardDescription>
                          {formData.campaignType === "condition"
                            ? "Select the event that will trigger this campaign"
                            : "Choose the audience for your campaign"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {formData.campaignType === "condition" ? (
                          <Field>
                            <FieldLabel>Select Flow *</FieldLabel>
                            <FieldContent>
                              <Select
                                value={formData.selectedFlowId || ""}
                                onValueChange={(value) => handleInputChange("selectedFlowId", value)}
                              >
                                <SelectTrigger className={formErrors.selectedFlowId ? "border-destructive" : ""}>
                                  <SelectValue placeholder="Select a flow" />
                                </SelectTrigger>
                                <SelectContent>
                                  <div className="text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                                    <p className="px-2 py-4">No flows available.</p>
                                    <Button
                                      variant="ghost"
                                      className="mt-2 text-primary hover:text-primary/90 hover:bg-primary/10"
                                      onClick={() => window.open("/engage/journey", "_blank", "noopener,noreferrer")}
                                    >
                                      Create in Journey Builder
                                    </Button>
                                  </div>
                                </SelectContent>
                              </Select>
                            </FieldContent>
                            {formErrors.selectedFlowId && (
                              <FieldError>{formErrors.selectedFlowId}</FieldError>
                            )}
                            <FieldDescription>
                              Choose a Journey Builder flow to condition this campaign upon.
                            </FieldDescription>
                          </Field>
                        ) : (
                          <div className="space-y-6">
                            <Field>
                              <FieldLabel>Select Audience Method *</FieldLabel>
                              <FieldContent>
                                <RadioGroup
                                  value={formData.recipientSource}
                                  onValueChange={(value: "segments" | "upload" | "manual") => handleInputChange("recipientSource", value)}
                                  className="flex flex-col sm:flex-row gap-6"
                                >
                                  <Field orientation="horizontal" className="w-auto">
                                    <RadioGroupItem value="segments" id="source-segments" />
                                    <FieldLabel htmlFor="source-segments" className="font-normal cursor-pointer">Segments</FieldLabel>
                                  </Field>
                                  <Field orientation="horizontal" className="w-auto">
                                    <RadioGroupItem value="upload" id="source-upload" />
                                    <FieldLabel htmlFor="source-upload" className="font-normal cursor-pointer">Upload sheet</FieldLabel>
                                  </Field>
                                  <Field orientation="horizontal" className="w-auto">
                                    <RadioGroupItem value="manual" id="source-manual" />
                                    <FieldLabel htmlFor="source-manual" className="font-normal cursor-pointer">Manually enter numbers</FieldLabel>
                                  </Field>
                                </RadioGroup>
                              </FieldContent>
                            </Field>

                            {formData.recipientSource === "segments" && (
                              <Field>
                                <FieldLabel>Select Segment *</FieldLabel>
                                <FieldContent>
                                  <Select
                                    value={formData.selectedSegmentId}
                                    onValueChange={(value) => handleInputChange("selectedSegmentId", value)}
                                    disabled={segmentsLoading}
                                  >
                                    <SelectTrigger className={formErrors.selectedSegmentId ? "border-destructive" : ""}>
                                      <SelectValue placeholder={segmentsLoading ? "Loading segments..." : "Select a segment"}>
                                        {renderSelectedSegmentValue()}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {/* All Contacts Option */}
                                      <SelectItem value="all-contacts" className="pr-2 pl-2 [&>span:first-child]:hidden">
                                        <div className="flex items-center gap-2 w-full">
                                          <div className="w-[120px] truncate">All Contacts</div>
                                          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                                            <Badge variant="secondary">
                                              {allContacts.length} contacts
                                            </Badge>
                                            <SelectPrimitive.ItemIndicator>
                                              <Check className="h-4 w-4" />
                                            </SelectPrimitive.ItemIndicator>
                                          </div>
                                        </div>
                                      </SelectItem>

                                      {/* Segments List */}
                                      {segmentsLoading ? (
                                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                          Loading segments...
                                        </div>
                                      ) : segments.length === 0 ? (
                                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                          No segments available. <br />
                                          <Button
                                            variant="link"
                                            className="mt-2 h-auto p-0"
                                            onClick={() => navigate("/contacts/segments")}
                                          >
                                            Create a segment first
                                          </Button>
                                        </div>
                                      ) : (
                                        segments.map(renderSegmentItem)
                                      )}
                                    </SelectContent>
                                  </Select>
                                </FieldContent>
                                {formErrors.selectedSegmentId && (
                                  <FieldError>{formErrors.selectedSegmentId}</FieldError>
                                )}
                              </Field>
                            )}

                            {formData.recipientSource === "upload" && (
                              <Field>
                                <FieldLabel>Upload sheet *</FieldLabel>
                                <FieldContent>
                                  <div className="flex flex-col gap-6 items-start w-full">
                                    <div className="flex flex-col gap-4 items-start w-full">
                                      {/* Recipient Count Summary - Matches other sources */}
                                      {formData.recipients > 0 && (uploadedFileName || selectedRecentFileId) && (
                                        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg w-full">
                                          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Users className="h-4 w-4" />
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-sm font-semibold text-primary">
                                              {formData.recipients.toLocaleString()} contacts found
                                            </p>
                                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                              <FileText className="h-3 w-3" />
                                              {uploadedFileName || recentFiles.find(f => f.id === selectedRecentFileId)?.name}
                                            </p>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => {
                                              handleInputChange("recipients", 0)
                                              setUploadedFileName(null)
                                              setSelectedRecentFileId(null)
                                            }}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )}

                                      {/* Drag and Drop Zone */}
                                      <div
                                        className={cn(
                                          "w-full border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group",
                                          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30",
                                          formData.recipients > 0 && (uploadedFileName || selectedRecentFileId) ? "hidden" : "flex"
                                        )}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={(e) => {
                                          e.preventDefault()
                                          setIsDragging(false)
                                          const file = e.dataTransfer.files[0]
                                          if (file) {
                                            setUploadedFileName(file.name)
                                            handleInputChange("recipients", Math.floor(Math.random() * 5000) + 100) // Mock count
                                            toast.success(`File "${file.name}" uploaded successfully`)
                                          }
                                        }}
                                        onClick={() => setIsCsvImportDrawerOpen(true)}
                                      >
                                        <div className="size-12 rounded-full bg-muted flex items-center justify-center border group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                          <Upload className="h-6 w-6" />
                                        </div>
                                        <div className="text-center">
                                          <p className="text-sm font-semibold font-clash">Click or drag and drop to upload</p>
                                          <p className="text-xs text-muted-foreground mt-1">CSV or XLSX files only (Max 10MB)</p>
                                        </div>
                                      </div>

                                      {formErrors.upload && !formData.recipients && (
                                        <FieldError>{formErrors.upload}</FieldError>
                                      )}
                                      <p className="text-sm text-muted-foreground">
                                        Upload a CSV file to create a segment. You can then select it using the Segments option.
                                      </p>
                                    </div>

                                    <div className="w-full space-y-3">
                                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        Recently used
                                      </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {recentFiles.map((file) => {
                                          const isSelected = selectedRecentFileId === file.id
                                          return (
                                            <button
                                              key={file.id}
                                              type="button"
                                              onClick={() => {
                                                const newSelectedId = isSelected ? null : file.id
                                                setSelectedRecentFileId(newSelectedId)
                                                setUploadedFileName(null) // Clear manual upload if recent is picked
                                                handleInputChange("recipients", isSelected ? 0 : file.count)
                                                if (!isSelected) {
                                                  toast.success(`Selected ${file.name} with ${file.count} contacts`)
                                                }
                                              }}
                                              className={cn(
                                                "flex flex-col items-start p-3 text-left border rounded-lg transition-all group relative",
                                                isSelected ? "border-primary bg-primary/5 shadow-sm" : "hover:border-primary hover:bg-primary/5"
                                              )}
                                            >
                                              <div className="flex items-center gap-2 w-full mb-1">
                                                <div className={cn(
                                                  "size-4 rounded-full border flex items-center justify-center transition-colors",
                                                  isSelected ? "bg-primary border-primary" : "border-muted-foreground/30 group-hover:border-primary/50"
                                                )}>
                                                  {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                                                </div>
                                                <span className={cn("text-sm font-medium truncate flex-1", isSelected && "text-primary")}>{file.name}</span>
                                              </div>
                                              <div className="flex items-center justify-between w-full text-[11px] text-muted-foreground pl-6">
                                                <span>{file.date}</span>
                                                <Badge
                                                  variant="outline"
                                                  className={cn(
                                                    "text-[10px] py-0 h-4 transition-colors",
                                                    isSelected ? "border-primary/30 bg-primary/10 text-primary" : "group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary"
                                                  )}
                                                >
                                                  {file.count.toLocaleString()} contacts
                                                </Badge>
                                              </div>
                                            </button>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </FieldContent>
                              </Field>
                            )}

                            {formData.recipientSource === "manual" && (
                              <Field>
                                <FieldLabel>Manual numbers *</FieldLabel>
                                <FieldContent>
                                  <Textarea
                                    placeholder="Add a phone number + country code, Comma separated."
                                    value={formData.manualNumbers}
                                    onChange={(e) => handleInputChange("manualNumbers", e.target.value)}
                                    className={cn(
                                      "min-h-[120px]",
                                      formErrors.manualNumbers && "border-destructive"
                                    )}
                                  />
                                </FieldContent>
                                {formErrors.manualNumbers ? (
                                  <FieldError>{formErrors.manualNumbers}</FieldError>
                                ) : (
                                  <FieldDescription>
                                    (e.g. +201012345678, +201012345678)
                                  </FieldDescription>
                                )}
                              </Field>
                            )}

                            <FieldDescription className="p-3 border rounded-md bg-muted/50 mt-2">
                              {renderRecipientsDescription()}
                            </FieldDescription>
                          </div>
                        )}
                      </CardContent>
                      {/* Footer */}
                      <div className="border-t pt-4 px-4 sm:px-4">
                        <div className="flex items-center justify-between gap-4">
                          <Button
                            variant="outline"
                            onClick={handlePrevious}
                            className="flex-shrink-0"
                          >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Back</span>
                          </Button>
                          <Button
                            onClick={handleNext}
                            disabled={!isCurrentStepValid || isInitialLoading}
                            className="flex-shrink-0"
                          >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="h-4 w-4 sm:ml-2" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Step 3: Content */}
                  {currentStep === 2 && (
                    <Card className="py-5 gap-5">
                      <CardHeader>
                        <CardTitle>Message Content</CardTitle>
                        <CardDescription>
                          {formData.type === "Whatsapp"
                            ? "Choose a template from your library"
                            : "Write your campaign message"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {formData.type === "Email" && (
                          <Field>
                            <FieldLabel>Subject Line *</FieldLabel>
                            <FieldContent>
                              <Input
                                id="subject"
                                value={formData.subject}
                                onChange={(e) => handleInputChange("subject", e.target.value)}
                                placeholder="Enter email subject line"
                                className={formErrors.subject ? "border-destructive" : ""}
                                maxLength={100}
                              />
                            </FieldContent>
                            {formErrors.subject && <FieldError>{formErrors.subject}</FieldError>}
                            <FieldDescription>
                              {formData.subject.length}/100 characters
                            </FieldDescription>
                          </Field>
                        )}

                        {/* WhatsApp Template Selection */}
                        {formData.type === "Whatsapp" && (
                          <div className="space-y-4">
                            <Field>
                              <FieldLabel>Select Template *</FieldLabel>
                              <FieldContent>
                                <Select
                                  value={formData.selectedTemplateId}
                                  onValueChange={(value) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      selectedTemplateId: value,
                                      templateVariables: {}
                                    }))
                                    setIsDirty(true)
                                  }}
                                >
                                  <SelectTrigger className={formErrors.selectedTemplateId ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select a template">
                                      {selectedTemplate ? (
                                        <div className="flex items-center gap-2">
                                          <span>{selectedTemplate.name}</span>
                                          <Badge className={getCategoryBadgeColor(selectedTemplate.category)}>
                                            {selectedTemplate.category}
                                          </Badge>
                                        </div>
                                      ) : (
                                        "Select a template"
                                      )}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[500px] min-w-[500px] w-[max(500px,var(--radix-select-trigger-width))]">
                                    {/* Search Input inside dropdown */}
                                    <div className="p-2 border-b sticky top-0 bg-background z-10">
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                          placeholder="Search templates..."
                                          value={templateSearchQuery}
                                          onChange={(e) => {
                                            e.stopPropagation()
                                            setTemplateSearchQuery(e.target.value)
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          onKeyDown={(e) => e.stopPropagation()}
                                          className="pl-9 pr-8 h-9"
                                        />
                                        {templateSearchQuery && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                            onClick={(e) => {
                                              e.preventDefault()
                                              e.stopPropagation()
                                              setTemplateSearchQuery("")
                                            }}
                                          >
                                            <XIcon className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Category Filter inside dropdown */}
                                    <div className="p-2 border-b bg-muted/30">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <Filter className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                        <span className="text-xs font-medium text-muted-foreground mr-1">Category:</span>
                                        {(["ALL", "MARKETING", "UTILITY", "AUTHENTICATION"] as const).map((category) => (
                                          <Button
                                            key={category}
                                            variant={selectedTemplateCategory === category ? "default" : "outline"}
                                            size="sm"
                                            onClick={(e) => {
                                              e.preventDefault()
                                              e.stopPropagation()
                                              setSelectedTemplateCategory(category)
                                            }}
                                            className="flex items-center gap-1.5 h-7 text-xs px-2"
                                          >

                                            {category === "ALL" ? "All" : category}
                                          </Button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Show active filters info */}
                                    {(templateSearchQuery || selectedTemplateCategory !== "ALL") && filteredTemplates.length > 0 && (
                                      <div className="px-3 py-2 border-b bg-muted/20">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                          <span>
                                            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 px-2 text-xs"
                                            onClick={(e) => {
                                              e.preventDefault()
                                              e.stopPropagation()
                                              setTemplateSearchQuery("")
                                              setSelectedTemplateCategory("ALL")
                                            }}
                                          >
                                            Clear
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                    {/* Template List */}
                                    <div className="max-h-[300px] overflow-y-auto">
                                      {filteredTemplates.length === 0 ? (
                                        <div className="px-3 py-6 text-center text-sm text-muted-foreground space-y-2">
                                          <p>No templates found.</p>
                                          {(templateSearchQuery || selectedTemplateCategory !== "ALL") && (
                                            <Button
                                              variant="link"
                                              size="sm"
                                              className="h-auto p-0 text-xs"
                                              onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setTemplateSearchQuery("")
                                                setSelectedTemplateCategory("ALL")
                                              }}
                                            >
                                              Clear filters
                                            </Button>
                                          )}
                                        </div>
                                      ) : (
                                        filteredTemplates.map((template) => {
                                          const headerComponent = template.components.find(c => c.type === "HEADER")
                                          const bodyComponent = template.components.find(c => c.type === "BODY")
                                          const hasButtons = template.components.some(c => c.type === "BUTTONS")
                                          const hoverPreview = getHoverPreview(template)

                                          return (
                                            <TooltipProvider key={template.id}>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <div>
                                                    <SelectItem
                                                      value={template.id}
                                                      onMouseEnter={() => setHoveredTemplateId(template.id)}
                                                      onMouseLeave={() => setHoveredTemplateId(null)}
                                                      className="cursor-pointer"
                                                    >
                                                      <div className="flex-1 items-center justify-between w-full">
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                          <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                              <span className=" font-medium text-sm truncate">{template.name}</span>
                                                              <Badge className={getCategoryBadgeColor(template.category)}>
                                                                {template.category}
                                                              </Badge>
                                                            </div>
                                                            {template.description && (
                                                              <p className="text-xs text-muted-foreground truncate">
                                                                {template.description}
                                                              </p>
                                                            )}
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </SelectItem>
                                                  </div>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                  side="right"
                                                  className="max-w-sm p-4"
                                                  onMouseEnter={() => setHoveredTemplateId(template.id)}
                                                  onMouseLeave={() => setHoveredTemplateId(null)}
                                                >
                                                  <div className="space-y-2">
                                                    <div className="flex items-center gap-2 mb-2">
                                                      <span className="font-semibold text-sm">{template.name}</span>
                                                      <Badge className={getCategoryBadgeColor(template.category)}>
                                                        {template.category}
                                                      </Badge>
                                                    </div>
                                                    {template.description && (
                                                      <p className="text-xs text-muted-foreground mb-2">
                                                        {template.description}
                                                      </p>
                                                    )}
                                                    {headerComponent && (
                                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                                        {getComponentIcon(headerComponent.format)}
                                                        <span className="capitalize">
                                                          {headerComponent.format || "Header"} Media
                                                        </span>
                                                      </div>
                                                    )}
                                                    {hoverPreview && (
                                                      <div className="mt-2 pt-2 border-t">
                                                        <p className="text-xs font-medium mb-1">Preview:</p>
                                                        <p className="text-xs whitespace-pre-wrap text-muted-foreground line-clamp-6">
                                                          {hoverPreview}
                                                        </p>
                                                      </div>
                                                    )}
                                                    {hasButtons && (
                                                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                                        <Link2 className="h-3 w-3" />
                                                        <span>Interactive buttons</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          )
                                        })
                                      )}
                                    </div>
                                  </SelectContent>
                                </Select>
                              </FieldContent>
                              {formErrors.selectedTemplateId && (
                                <FieldError>{formErrors.selectedTemplateId}</FieldError>
                              )}
                              <FieldDescription>
                                Click to open template library. Search and filter templates inside the dropdown. Hover over templates to preview.
                              </FieldDescription>
                            </Field>

                            {/* Template Variables Input */}
                            {selectedTemplate && templateVariables.length > 0 && (
                              <>
                                <Separator />
                                <div className="space-y-3">
                                  <FieldLabel>Template Variables</FieldLabel>
                                  <div className="space-y-3">
                                    {templateVariables.map((variable) => (
                                      <Field key={variable.name}>
                                        <FieldLabel>
                                          {variable.name}
                                          {variable.required && <span className="text-destructive ml-1">*</span>}
                                          <span className="ml-2 text-xs text-muted-foreground font-normal">
                                            (e.g., {variable.example})
                                          </span>
                                        </FieldLabel>
                                        <FieldContent>
                                          <Input
                                            value={formData.templateVariables[variable.name] || ""}
                                            onChange={(e) => {
                                              setFormData(prev => ({
                                                ...prev,
                                                templateVariables: {
                                                  ...prev.templateVariables,
                                                  [variable.name]: e.target.value
                                                }
                                              }))
                                              setIsDirty(true)
                                            }}
                                            placeholder={`Enter ${variable.name}...`}
                                            className={formErrors[`templateVar_${variable.name}`] ? "border-destructive" : ""}
                                          />
                                        </FieldContent>
                                        {formErrors[`templateVar_${variable.name}`] && (
                                          <FieldError>{formErrors[`templateVar_${variable.name}`]}</FieldError>
                                        )}
                                      </Field>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {formData.type !== "Whatsapp" && (
                          <Field>
                            <FieldLabel>
                              {formData.type === "Voice" ? "Voice Content *" : "Message Content *"}
                              {formData.type && formData.type !== "Voice" && (
                                <span className="ml-2 text-muted-foreground font-normal">
                                  (Max {characterLimit.toLocaleString()} characters)
                                </span>
                              )}
                            </FieldLabel>
                            <FieldContent>
                              {formData.type === "Voice" ? (
                                <div className="space-y-6">
                                  <RadioGroup
                                    value={formData.voiceType}
                                    onValueChange={(val: "tts" | "upload") => {
                                      setFormData(prev => ({ ...prev, voiceType: val }))
                                      setIsDirty(true)
                                    }}
                                    className="flex items-center gap-6"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="tts" id="r-tts" />
                                      <Label htmlFor="r-tts">Text-to-Speech</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="upload" id="r-upload" />
                                      <Label htmlFor="r-upload">Upload Record</Label>
                                    </div>
                                  </RadioGroup>

                                  {formData.voiceType === "tts" ? (
                                    <div className="space-y-4">
                                      <Textarea
                                        value={formData.voiceContent}
                                        onChange={(e) => {
                                          setFormData(prev => ({ ...prev, voiceContent: e.target.value }))
                                          setIsDirty(true)
                                        }}
                                        placeholder="Type the message to be converted to speech..."
                                        className={`min-h-[150px] ${formErrors.message ? "border-destructive" : ""} ${isOverLimit ? "border-destructive" : ""}`}
                                        maxLength={characterLimit + 100}
                                      />
                                      
                                      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-lg border">
                                        <div className="flex items-center gap-2">
                                          <Label className="text-sm font-medium whitespace-nowrap min-w-[50px]">Speed</Label>
                                          <Select
                                            value={formData.voiceSpeed}
                                            onValueChange={(val) => {
                                              setFormData(prev => ({ ...prev, voiceSpeed: val }))
                                              setIsDirty(true)
                                            }}
                                          >
                                            <SelectTrigger className="w-[140px] h-9">
                                              <SelectValue placeholder="Speed" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="0.5 (Slow)">0.5 (Slow)</SelectItem>
                                              <SelectItem value="1 (Normal)">1 (Normal)</SelectItem>
                                              <SelectItem value="1.5 (Fast)">1.5 (Fast)</SelectItem>
                                              <SelectItem value="2.0 (Very Fast)">2.0 (Very Fast)</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <Label className="text-sm font-medium whitespace-nowrap min-w-[50px]">Speaker</Label>
                                          <Select
                                            value={formData.voiceVoiceId}
                                            onValueChange={(val) => {
                                              setFormData(prev => ({ ...prev, voiceVoiceId: val }))
                                              setIsDirty(true)
                                            }}
                                          >
                                            <SelectTrigger className="w-[200px] h-9">
                                              <SelectValue placeholder="Select Speaker" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="danielle_f_us">Danielle ( Female )</SelectItem>
                                              <SelectItem value="joey_m_us">
                                                <div className="flex items-center justify-between w-full pr-2">
                                                  <span>Joey ( Male )</span>
                                                  <Badge variant="secondary" className="ml-2 font-normal text-[10px] bg-green-100/50 text-green-700 hover:bg-green-100/50">US English</Badge>
                                                </div>
                                              </SelectItem>
                                              <SelectItem value="ivy_f_us">
                                                <div className="flex items-center justify-between w-full pr-2">
                                                  <span>Ivy ( Female )</span>
                                                  <Badge variant="secondary" className="ml-2 font-normal text-[10px] bg-green-100/50 text-green-700 hover:bg-green-100/50">US English</Badge>
                                                </div>
                                              </SelectItem>
                                              <SelectItem value="zeina_f_ar">
                                                <div className="flex items-center justify-between w-full pr-2">
                                                  <span>Zeina ( Female )</span>
                                                  <Badge variant="secondary" className="ml-2 font-normal text-[10px] bg-green-100/50 text-green-700 hover:bg-green-100/50">Arabic</Badge>
                                                </div>
                                              </SelectItem>
                                              <SelectItem value="hala_f_gulf">
                                                <div className="flex items-center justify-between w-full pr-2">
                                                  <span>Hala ( Female )</span>
                                                  <Badge variant="secondary" className="ml-2 font-normal text-[10px] bg-green-100/50 text-green-700 hover:bg-green-100/50">Gulf Arabic</Badge>
                                                </div>
                                              </SelectItem>
                                              <SelectItem value="stephen_m_us">
                                                <div className="flex items-center justify-between w-full pr-2">
                                                  <span>Stephen ( Male )</span>
                                                  <Badge variant="secondary" className="ml-2 font-normal text-[10px] bg-green-100/50 text-green-700 hover:bg-green-100/50">US English</Badge>
                                                </div>
                                              </SelectItem>
                                              <SelectItem value="zayd_m_gulf">
                                                <div className="flex items-center justify-between w-full pr-2">
                                                  <span>Zayd ( Male )</span>
                                                  <Badge variant="secondary" className="ml-2 font-normal text-[10px] bg-green-100/50 text-green-700 hover:bg-green-100/50">Gulf Arabic</Badge>
                                                </div>
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <Label className="text-sm font-medium whitespace-nowrap min-w-[50px]">Delay audio</Label>
                                          <Select
                                            value={formData.voiceDelay}
                                            onValueChange={(val) => {
                                              setFormData(prev => ({ ...prev, voiceDelay: val }))
                                              setIsDirty(true)
                                            }}
                                          >
                                            <SelectTrigger className="w-[140px] h-9">
                                              <SelectValue placeholder="Delay" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="No Delay">No Delay</SelectItem>
                                              <SelectItem value="1 second">1 second</SelectItem>
                                              <SelectItem value="2 seconds">2 seconds</SelectItem>
                                              <SelectItem value="5 seconds">5 seconds</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center bg-muted/10">
                                      {formData.voiceFileUrl ? (
                                        <div className="space-y-4 w-full max-w-sm flex flex-col items-center">
                                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <FileAudio className="h-6 w-6 text-primary" />
                                          </div>
                                          <div>
                                            <p className="font-medium text-sm">Recording attached</p>
                                            <p className="text-xs text-muted-foreground mt-1 text-center truncate max-w-[200px]">
                                              {formData.voiceFileUrl.split('/').pop()}
                                            </p>
                                          </div>
                                          <div className="flex gap-2 mt-2">
                                            <Button
                                              variant="secondary"
                                              size="sm"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                toast.success("Playing recording...");
                                              }}
                                            >
                                              <Play className="h-4 w-4 mr-2" /> Play
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                setFormData(prev => ({ ...prev, voiceFileUrl: "" }));
                                                setIsDirty(true);
                                              }}
                                            >
                                              Remove
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                            <UploadCloud className="h-6 w-6 text-primary" />
                                          </div>
                                          <p className="font-medium">Upload audio file</p>
                                          <p className="text-sm text-muted-foreground mt-1 mb-6">
                                            Supports MP3, WAV, M4A up to 10MB
                                          </p>
                                          <Button onClick={(e) => {
                                            e.preventDefault();
                                            setFormData(prev => ({...prev, voiceFileUrl: "https://example.com/audio_record_2024.mp3"}));
                                            setIsDirty(true);
                                            toast.success("File uploaded successfully");
                                          }}>
                                            <UploadCloud className="h-4 w-4 mr-2" />
                                            Select File
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (formData.type === "Email" || formData.type === "SMS") ? (
                                <div className="space-y-4">

                                  <MentionsTextarea
                                    value={formData.message}
                                    onChange={(val) => handleInputChange("message", val)}
                                    placeholder={
                                      formData.type === "Email"
                                        ? "Write your email message here... (Type @ to insert attributes)"
                                        : formData.isPersonalizationEnabled
                                          ? "Write your SMS message here... (Type @ to insert attributes)"
                                          : "Write your SMS message here..."
                                    }
                                    className={cn(
                                      formErrors.message && "border-destructive",
                                      isOverLimit && "border-destructive"
                                    )}
                                    rightActions={
                                      formData.type === "SMS" && (
                                        <>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="h-7 text-xs px-2.5 text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary transition-colors"
                                                tabIndex={-1}
                                              >
                                                <Sparkles className="mr-1 h-3 w-3" />
                                                AI Actions
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[200px]" onCloseAutoFocus={(e) => e.preventDefault()}>
                                              <DropdownMenuItem onClick={() => { }}>Rephrase</DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => { }}>Summarize</DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => { }}>Expand</DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => { }}>Simplify</DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => { }}>Make it professional</DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => { }}>Make it friendly</DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs px-2.5 text-muted-foreground hover:text-foreground"
                                            onClick={() => setIsSmsTemplateDialogOpen(true)}
                                            tabIndex={-1}
                                          >
                                            <FileText className="mr-1 h-3 w-3" />
                                            Use Template
                                          </Button>
                                        </>
                                      )
                                    }
                                    mentions={
                                      formData.type === "Email" || formData.isPersonalizationEnabled
                                        ? [
                                          { id: 'firstName', display: 'First Name' },
                                          { id: 'lastName', display: 'Last Name' },
                                          { id: 'phoneNumber', display: 'Phone Number' },
                                          { id: 'email', display: 'Email' },
                                          { id: 'companyName', display: 'Company Name' }
                                        ]
                                        : []
                                    }
                                  />
                                  {formData.type === "SMS" && (
                                    <div className="flex flex-col gap-3">
                                      <div className="flex border border-border rounded-md bg-muted/10 p-3 items-start space-x-3">
                                        <Switch
                                          id="enable-personalization"
                                          checked={formData.isPersonalizationEnabled || false}
                                          onCheckedChange={(checked) => {
                                            setFormData(prev => ({ ...prev, isPersonalizationEnabled: checked }))
                                            setIsDirty(true)
                                          }}
                                          className="mt-0.5"
                                        />
                                        <div className="flex flex-col gap-1">
                                          <Label htmlFor="enable-personalization" className="text-sm font-medium cursor-pointer">
                                            Enable Personalization
                                          </Label>
                                          <p className="text-xs text-muted-foreground mr-4">
                                            Use <span className="font-semibold text-foreground">@mention</span> formatting to easily add personalized attributes (e.g. First Name).
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-3 p-3 border border-border rounded-md bg-muted/10">
                                        <div className="flex items-center space-x-2">
                                          <Switch
                                            id="include-cta-link"
                                            checked={formData.includeCtaLink || false}
                                            onCheckedChange={(checked) => {
                                              setFormData(prev => ({ ...prev, includeCtaLink: checked }))
                                              setIsDirty(true)
                                            }}
                                          />
                                          <Label htmlFor="include-cta-link" className="text-sm font-medium cursor-pointer">
                                            Include Link Tracking/CTA
                                          </Label>
                                        </div>
                                        {(formData.includeCtaLink || false) && (
                                          <div className="pl-11 pr-2 pb-1 space-y-4">
                                            <div>
                                              <Input
                                                placeholder="https://example.com/promo"
                                                value={formData.ctaLinkUrl || ""}
                                                onChange={(e) => {
                                                  setFormData(prev => ({ ...prev, ctaLinkUrl: e.target.value }))
                                                  setIsDirty(true)
                                                }}
                                                className="h-9 w-full sm:w-[320px]"
                                              />
                                              <p className="text-xs text-muted-foreground mt-1.5 flex items-center">
                                                <Link2 className="h-3 w-3 mr-1" />
                                                This link will be appended as a shortened URL to your message body.
                                              </p>
                                            </div>

                                            <div className="border-t border-border pt-4">
                                              <div className="flex items-center justify-between mb-3">
                                                <Label className="text-sm font-medium text-foreground">Google Analytics Tracking</Label>
                                                <Switch
                                                  id="include-google-analytics"
                                                  checked={formData.includeGoogleAnalytics || false}
                                                  onCheckedChange={(checked) => {
                                                    setFormData(prev => ({ ...prev, includeGoogleAnalytics: checked }))
                                                    setIsDirty(true)
                                                  }}
                                                />
                                              </div>
                                              {(formData.includeGoogleAnalytics || false) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                  <div className="space-y-1.5">
                                                    <Label htmlFor="gaSource" className="text-xs text-muted-foreground">Source</Label>
                                                    <Input
                                                      id="gaSource"
                                                      placeholder="e.g. cequens"
                                                      value={formData.gaSource || ""}
                                                      onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, gaSource: e.target.value }))
                                                        setIsDirty(true)
                                                      }}
                                                      className="h-8 text-sm"
                                                    />
                                                  </div>
                                                  <div className="space-y-1.5">
                                                    <Label htmlFor="gaMedium" className="text-xs text-muted-foreground">Medium</Label>
                                                    <Input
                                                      id="gaMedium"
                                                      placeholder="e.g. sms"
                                                      value={formData.gaMedium || ""}
                                                      onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, gaMedium: e.target.value }))
                                                        setIsDirty(true)
                                                      }}
                                                      className="h-8 text-sm"
                                                    />
                                                  </div>
                                                  <div className="space-y-1.5 lg:col-span-3">
                                                    <Label htmlFor="gaCampaignName" className="text-xs text-muted-foreground">Campaign Name</Label>
                                                    <Input
                                                      id="gaCampaignName"
                                                      placeholder="e.g. summer_promo_2024"
                                                      value={formData.gaCampaignName || ""}
                                                      onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, gaCampaignName: e.target.value }))
                                                        setIsDirty(true)
                                                      }}
                                                      className="h-8 text-sm"
                                                    />
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                  }
                                </div>
                              ) : (
                                <Textarea
                                  id="message"
                                  value={formData.message}
                                  onChange={(e) => handleInputChange("message", e.target.value)}
                                  placeholder="Write your message here..."
                                  className={`min-h-[200px] ${formErrors.message ? "border-destructive" : ""} ${isOverLimit ? "border-destructive" : ""}`}
                                  maxLength={characterLimit + 100}
                                />
                              )}
                            </FieldContent>
                            {formErrors.message && <FieldError>{formErrors.message}</FieldError>}
                            <FieldDescription>
                              <span className={isOverLimit ? "text-destructive" : ""}>
                                {getMessageLength.toLocaleString()}/{characterLimit.toLocaleString()} characters
                                {formData.type === "SMS" && getMessageLength > 160 && (
                                  <span className="ml-2 text-muted-foreground">
                                    ({Math.ceil(getMessageLength / 160)} SMS)
                                  </span>
                                )}
                              </span>
                            </FieldDescription>
                          </Field>
                        )}


                      </CardContent>
                      {/* Footer */}
                      <div className="border-t pt-4 px-4 sm:px-4">
                        <div className="flex items-center justify-between gap-4">
                          <Button
                            variant="outline"
                            onClick={handlePrevious}
                            className="flex-shrink-0"
                          >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Back</span>
                          </Button>
                          <Button
                            onClick={handleNext}
                            disabled={!isCurrentStepValid || isInitialLoading}
                            className="flex-shrink-0"
                          >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="h-4 w-4 sm:ml-2" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Step 4: Schedule */}
                  {currentStep === 3 && (
                    <Card className="py-5 gap-5">
                      <CardHeader>
                        <CardTitle>Review & Send</CardTitle>
                        <CardDescription>Review campaign details and choose when to send</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Field>
                          <FieldLabel>Send Timing</FieldLabel>
                          <FieldContent>
                            <RadioGroup
                              value={formData.scheduleType}
                              onValueChange={(value) => handleInputChange("scheduleType", value as "now" | "scheduled" | "recurring")}
                              className="grid grid-cols-1 md:grid-cols-3 gap-4"
                            >
                              <Field>
                                <FieldLabel htmlFor="now" className="cursor-pointer">
                                  <div data-slot="field" className="flex items-center justify-between gap-3 w-full">
                                    <div className="flex items-center gap-3">
                                      <div className="size-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted text-muted-foreground group-has-data-[state=checked]/field-label:bg-primary/20 group-has-data-[state=checked]/field-label:text-primary transition-colors">
                                        <Send className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm leading-tight">Send Now</p>
                                        <p className="text-[11px] text-muted-foreground line-clamp-1">Immediate activation</p>
                                      </div>
                                    </div>
                                    <RadioGroupItem value="now" id="now" className="ml-auto" />
                                  </div>
                                </FieldLabel>
                              </Field>

                              <Field>
                                <FieldLabel htmlFor="scheduled" className="cursor-pointer">
                                  <div data-slot="field" className="flex items-center justify-between gap-3 w-full">
                                    <div className="flex items-center gap-3">
                                      <div className="size-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted text-muted-foreground group-has-data-[state=checked]/field-label:bg-primary/20 group-has-data-[state=checked]/field-label:text-primary transition-colors">
                                        <Calendar className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm leading-tight">Schedule</p>
                                        <p className="text-[11px] text-muted-foreground line-clamp-1">Specific date & time</p>
                                      </div>
                                    </div>
                                    <RadioGroupItem value="scheduled" id="scheduled" className="ml-auto" />
                                  </div>
                                </FieldLabel>
                              </Field>

                              <Field>
                                <FieldLabel htmlFor="recurring" className="cursor-pointer">
                                  <div data-slot="field" className="flex items-center justify-between gap-3 w-full">
                                    <div className="flex items-center gap-3">
                                      <div className="size-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted text-muted-foreground group-has-data-[state=checked]/field-label:bg-primary/20 group-has-data-[state=checked]/field-label:text-primary transition-colors">
                                        <Clock className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm leading-tight">Recurring</p>
                                        <p className="text-[11px] text-muted-foreground line-clamp-1">Custom weekly grid</p>
                                      </div>
                                    </div>
                                    <RadioGroupItem value="recurring" id="recurring" className="ml-auto" />
                                  </div>
                                </FieldLabel>
                              </Field>
                            </RadioGroup>
                          </FieldContent>
                        </Field>

                        {formData.scheduleType === "scheduled" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field>
                              <FieldLabel>Date *</FieldLabel>
                              <FieldContent>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !formData.scheduledDate && "text-muted-foreground",
                                        formErrors.scheduledDate && "border-destructive"
                                      )}
                                    >
                                      <Calendar className="mr-2 h-4 w-4" />
                                      {formData.scheduledDate ? format(new Date(formData.scheduledDate), "MMM d, yyyy") : <span>Pick a date</span>}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarUI
                                      mode="single"
                                      selected={formData.scheduledDate ? new Date(formData.scheduledDate) : undefined}
                                      onSelect={(date) => {
                                        if (date) {
                                          handleInputChange("scheduledDate", format(date, "yyyy-MM-dd"))
                                        }
                                      }}
                                      disabled={(date) => {
                                        const now = new Date();
                                        now.setHours(0, 0, 0, 0);
                                        return date < now;
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </FieldContent>
                              {formErrors.scheduledDate && <FieldError>{formErrors.scheduledDate}</FieldError>}
                            </Field>
                            <Field>
                              <FieldLabel>Time *</FieldLabel>
                              <FieldContent>
                                <Input
                                  type="time"
                                  value={formData.scheduledTime}
                                  onChange={(e) => handleInputChange("scheduledTime", e.target.value)}
                                  className={formErrors.scheduledTime ? "border-destructive" : ""}
                                />
                              </FieldContent>
                            </Field>
                          </div>
                        )}

                        {formData.scheduleType === "recurring" && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Field>
                                <FieldLabel>Start Date *</FieldLabel>
                                <FieldContent>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !formData.recurringStartDate && "text-muted-foreground"
                                        )}
                                      >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {formData.recurringStartDate ? format(new Date(formData.recurringStartDate), "MMM d, yyyy") : <span>Pick a start date</span>}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <CalendarUI
                                        mode="single"
                                        selected={formData.recurringStartDate ? new Date(formData.recurringStartDate) : undefined}
                                        onSelect={(date) => {
                                          if (date) {
                                            handleInputChange("recurringStartDate", format(date, "yyyy-MM-dd"))
                                          }
                                        }}
                                        disabled={(date) => {
                                          const now = new Date();
                                          now.setHours(0, 0, 0, 0);
                                          return date < now;
                                        }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel>End Date *</FieldLabel>
                                <FieldContent>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !formData.recurringEndDate && "text-muted-foreground"
                                        )}
                                      >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {formData.recurringEndDate ? format(new Date(formData.recurringEndDate), "MMM d, yyyy") : <span>Pick an end date</span>}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <CalendarUI
                                        mode="single"
                                        selected={formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined}
                                        onSelect={(date) => {
                                          if (date) {
                                            handleInputChange("recurringEndDate", format(date, "yyyy-MM-dd"))
                                          }
                                        }}
                                        disabled={(date) => {
                                          if (!formData.recurringStartDate) return false;
                                          return date < new Date(formData.recurringStartDate);
                                        }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </FieldContent>
                              </Field>
                            </div>

                            <Field>
                              <FieldLabel>Weekly Schedule *</FieldLabel>
                              <CardDescription className="mb-4">
                                Select the hours of the day for each day of the week when you want your campaign to be delivered.
                              </CardDescription>
                              <FieldContent>
                                <div className="border rounded-lg overflow-hidden bg-background">
                                  <div className="p-4 overflow-x-auto">
                                    <div className="min-w-[800px]">
                                      {/* Header with hours */}
                                      <div className="flex border-b pb-2 mb-2">
                                        <div className="w-24 flex-shrink-0 text-xs font-semibold text-muted-foreground">Day / Hour</div>
                                        <div className="flex-1 grid gap-px" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
                                          {Array.from({ length: 24 }).map((_, i) => (
                                            <div
                                              key={i}
                                              onClick={() => {
                                                const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                                                const allSelected = days.every(day => formData.recurringSchedule?.[day]?.includes(i));
                                                const newSchedule = { ...(formData.recurringSchedule || {}) };

                                                days.forEach(day => {
                                                  const currentHours = newSchedule[day] || [];
                                                  if (allSelected) {
                                                    newSchedule[day] = currentHours.filter(h => h !== i);
                                                  } else if (!currentHours.includes(i)) {
                                                    newSchedule[day] = [...currentHours, i].sort((a, b) => a - b);
                                                  }
                                                });

                                                setFormData(prev => ({ ...prev, recurringSchedule: newSchedule }));
                                                setIsDirty(true);
                                              }}
                                              className="text-[10px] text-center text-muted-foreground font-medium hover:text-primary transition-colors cursor-pointer select-none"
                                              title={`Select all/none for ${i === 0 ? "12am" : i === 12 ? "12pm" : i > 12 ? `${i - 12}` : `${i}`}`}
                                            >
                                              {i === 0 ? "12am" : i === 12 ? "12pm" : i > 12 ? `${i - 12}` : `${i}`}
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Days */}
                                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                                        <div key={day} className="flex items-center group h-8 border-b last:border-b-0">
                                          <div className="w-24 flex-shrink-0 text-xs font-medium group-hover:text-primary transition-colors cursor-default">
                                            {day}
                                          </div>
                                          <div className="flex-1 grid gap-px h-full py-1" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
                                            {Array.from({ length: 24 }).map((_, hour) => {
                                              const isSelected = formData.recurringSchedule?.[day]?.includes(hour)
                                              return (
                                                <div
                                                  key={hour}
                                                  onClick={() => {
                                                    const currentHours = formData.recurringSchedule?.[day] || []
                                                    const newHours = isSelected
                                                      ? currentHours.filter(h => h !== hour)
                                                      : [...currentHours, hour].sort((a, b) => a - b)

                                                    setFormData(prev => ({
                                                      ...prev,
                                                      recurringSchedule: {
                                                        ...(prev.recurringSchedule || {}),
                                                        [day]: newHours
                                                      }
                                                    }))
                                                    setIsDirty(true)
                                                  }}
                                                  className={cn(
                                                    "h-full border transition-all cursor-pointer rounded-[2px]",
                                                    isSelected
                                                      ? "bg-primary border-primary hover:bg-primary/90"
                                                      : "bg-muted/70 border-muted-foreground/10 hover:bg-muted/90"
                                                  )}
                                                  title={`${day} at ${hour}:00`}
                                                />
                                              )
                                            })}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  {/* Legend & Quick Select */}
                                  <div className="bg-muted/50 p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 bg-primary rounded-[2px]" />
                                        <span>Scheduled hours</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 bg-muted border rounded-[2px]" style={{ backgroundColor: 'hsl(var(--muted) / 0.7)' }} />
                                        <span>Off</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => {
                                          const allSelected: Record<string, number[]> = {};
                                          ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].forEach((day: string) => {
                                            allSelected[day] = Array.from({ length: 24 }, (_, i) => i)
                                          });
                                          setFormData(prev => ({ ...prev, recurringSchedule: allSelected }))
                                          setIsDirty(true)
                                        }}
                                      >
                                        Select All
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-destructive hover:text-destructive"
                                        onClick={() => {
                                          const noneSelected: Record<string, number[]> = {};
                                          ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].forEach((day: string) => {
                                            noneSelected[day] = []
                                          });
                                          setFormData(prev => ({ ...prev, recurringSchedule: noneSelected }))
                                          setIsDirty(true)
                                        }}
                                      >
                                        Clear
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </FieldContent>
                            </Field>
                          </div>
                        )}

                        {formData.scheduleType === "scheduled" && (
                          <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-3">
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                              <div className="text-sm">
                                <p className="font-medium text-blue-900 dark:text-blue-100">
                                  Scheduled for {new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toLocaleString()}
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                  Campaign will be sent automatically at the scheduled time
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {formData.scheduleType === "recurring" && (
                          <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-3">
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                              <div className="text-sm">
                                <p className="font-medium text-green-900 dark:text-green-100">
                                  Recurring Schedule Active
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                  Campaign will run from {formData.recurringStartDate ? format(new Date(formData.recurringStartDate), "PPP") : "..."} to {formData.recurringEndDate ? format(new Date(formData.recurringEndDate), "PPP") : "..."} during the selected hours.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      {/* Footer */}
                      <div className="border-t pt-4 px-4 sm:px-4">
                        <div className="flex items-center justify-between gap-4">
                          <Button
                            variant="outline"
                            onClick={handlePrevious}
                            className="flex-shrink-0"
                          >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Back</span>
                          </Button>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              onClick={() => handleSave(true)}
                              disabled={isInitialLoading || createCampaignMutation.isPending}
                              className="flex-shrink-0"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">Save as Draft</span>
                              <span className="sm:hidden">Draft</span>
                            </Button>
                            <Button
                              onClick={() => handleSave(false)}
                              disabled={!canSave || isInitialLoading}
                              className="flex-shrink-0"
                            >
                              {formData.scheduleType === "now" ? (
                                <Send className="h-4 w-4 mr-2" />
                              ) : (
                                <Clock className="h-4 w-4 mr-2" />
                              )}
                              <span className="hidden sm:inline">
                                {createCampaignMutation.isPending
                                  ? "Creating..."
                                  : formData.scheduleType === "scheduled" || formData.scheduleType === "recurring"
                                    ? "Schedule Campaign"
                                    : "Send Now"}
                              </span>
                              <span className="sm:hidden">
                                {createCampaignMutation.isPending ? "Creating..." : "Save"}
                              </span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>

              {/* Discard Alert Dialog */}
              <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Discard changes?</DialogTitle>
                  </DialogHeader>
                  <div className="p-4">
                    <DialogDescription>
                      You have unsaved changes. Are you sure you want to leave this page?
                    </DialogDescription>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleDiscardCancel}>Cancel</Button>
                    <Button
                      onClick={handleDiscard}
                      variant="destructive"
                    >
                      Discard
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Sidebar */}
              <div className="grid grid-cols-1 gap-4 items-start">
                {/* Summary */}
                <Card className="py-5 gap-5">
                  <CardHeader>
                    <CardTitle>Campaign Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Type</label>
                        <div className="flex items-center gap-2 mt-1">
                          {formData.type && getTypeIcon(formData.type)}
                          <p className="text-sm">{formData.type || "Not selected"}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Recipients</label>
                        <p className="text-sm mt-1">
                          {formData.recipients > 0 ? (
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {formData.recipients.toLocaleString()} contact{formData.recipients !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            "No recipients selected"
                          )}
                        </p>
                      </div>
                      {formData.type && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Message Length</label>
                          <p className="text-sm mt-1">
                            {getMessageLength.toLocaleString()} / {characterLimit.toLocaleString()} characters
                          </p>
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-4 pt-2">
                          <div className="space-y-2 text-center">
                            <Button
                              variant="outline"
                              className="w-full text-xs font-medium h-9"
                              onClick={handleSendTest}
                              isLoading={isSendingTest}
                              loadingText={formData.type === "Email" ? "Sending email..." : "Sending message..."}
                            >
                              <Send className="mr-2 h-3.5 w-3.5" />
                              {formData.type === "Email" ? "Send test email" : "Send test message"}
                            </Button>
                            <p className="text-[10px] text-muted-foreground">
                              This {formData.type === 'Email' ? 'email' : 'message'} will be sent to {formData.type === 'Email' ? 'ahmed.mustafa@example.com' : '+201011116131'}
                            </p>
                          </div>

                          <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                            <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Estimated Cost</label>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <p className="text-xl font-bold text-primary">
                                ${(formData.recipients * 0.025).toFixed(2)}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                ($0.025 / msg)
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Voice Playback Controls rendered in place of Preview */}
                {(currentStep === 2 || currentStep === 3) && formData.type === "Voice" && (
                  <Card className="pt-5 pb-5 gap-5 flex flex-col">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-muted-foreground" />
                        <CardTitle>Voice Feedback</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 space-y-4">
                      {formData.voiceType === 'tts' && !formData.voiceContent ? (
                        <div className="text-sm text-center text-muted-foreground p-4 bg-muted/20 rounded-md border border-dashed">
                          Please enter text to preview speech.
                        </div>
                      ) : formData.voiceType === 'upload' && !formData.voiceFileUrl ? (
                         <div className="text-sm text-center text-muted-foreground p-4 bg-muted/20 rounded-md border border-dashed">
                          Please upload a recording to preview.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                            <div className="flex items-center gap-4 flex-1">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 shrink-0 rounded-full"
                                onClick={(e) => {
                                  e.preventDefault();
                                  toast.success("Playing audio preview...");
                                }}
                              >
                                <Play className="h-4 w-4 fill-current ml-0.5" />
                              </Button>
                              <div className="flex items-center gap-0.5 h-8 w-full max-w-[200px] px-1">
                                {[...Array(24)].map((_, i) => (
                                  <div 
                                    key={i} 
                                    className="flex-1 bg-primary/40 rounded-full"
                                    style={{ 
                                      height: `${Math.max(20, Math.random() * 100)}%`,
                                      opacity: i < 8 ? 1 : 0.5 
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-background px-3 py-1.5 rounded-md border ml-4">
                              <Clock className="h-4 w-4" />
                              <span>~ 00:15</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Preview - Show on Content step (step 2) and Review step (step 3) */}
                {(currentStep === 2 || currentStep === 3) && (formData.type === "Whatsapp" || formData.type === "SMS" || formData.type === "Email") && (
                  <Card className="pt-5 pb-0 gap-5 flex flex-col" style={{ height: '580px' }}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <CardTitle>Preview</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 overflow-hidden" style={{ height: '580px' }}>
                      {formData.type === "Email" ? (
                        /* Email Preview Mockup */
                        <div className="w-full h-full bg-slate-50 border-t border-x border-slate-200 rounded-t-xl overflow-hidden shadow-sm flex flex-col">
                          {/* Email Browser/App Header */}
                          <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                              </div>
                            </div>
                            <div className="bg-slate-100 rounded-md px-3 py-1 text-[10px] text-slate-500 font-medium truncate max-w-[200px]">
                              {formData.subject || "New Message"}
                            </div>
                            <div className="w-6" /> {/* Spacer */}
                          </div>

                          {/* Email Headers */}
                          <div className="bg-white border-b border-slate-100 px-5 float-animation pt-5 pb-4">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 truncate">
                              {formData.subject || "(No Subject)"}
                            </h2>
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-sm font-semibold text-slate-900 truncate">
                                    {selectedSender?.label || formData.senderId || "Cequens Sender"}
                                  </span>
                                  <span className="text-[10px] text-slate-400">9:41 AM</span>
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                  <span>to me</span>
                                  <ChevronRight className="h-3 w-3 rotate-90" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Email Body */}
                          <div className="flex-1 bg-white p-6 overflow-y-auto">
                            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                              {simulatedMessage || "Your email content will appear here..."}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Mobile Device Mockup - Show only 60% (cropped at bottom) */
                        <div className="relative flex justify-center items-end overflow-hidden w-full h-full">
                          <div className="relative w-full h-full flex justify-center items-start">
                            <div className="w-full h-full flex justify-center items-start">
                              <IPhoneMockup
                                screenWidth={320}
                                screenType="notch"
                                frameColor="#1f2937"
                                hideStatusBar={true}
                              >
                                <div className={`pt-6 w-full h-full relative ${formData.type === "Whatsapp"
                                  ? "bg-[#efeae9] dark:bg-background"
                                  : "bg-[#efeae9] dark:bg-background"
                                  }`}>
                                  {/* WhatsApp Background Pattern */}
                                  {formData.type === "Whatsapp" && (
                                    <div
                                      className="absolute inset-0 opacity-[0.12]"
                                      style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='whatsapp-pattern' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='15' cy='15' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='45' cy='20' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='75' cy='25' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='25' cy='40' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='55' cy='45' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='85' cy='50' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='35' cy='65' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='65' cy='70' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='20' cy='85' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='50' cy='90' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='80' cy='95' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23whatsapp-pattern)'/%3E%3C/svg%3E")`,
                                        backgroundSize: '100px 100px',
                                        backgroundRepeat: 'repeat',
                                      }}
                                    />
                                  )}
                                  <div className="relative z-10 flex flex-col h-full px-4 pt-3 pb-4">
                                    {/* Sender Info (for WhatsApp) - Show name from Sender ID */}
                                    {formData.type === "Whatsapp" && (
                                      <div className="mb-3 pb-3 border-b border-gray-300/50">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                                            <span className="text-white text-sm font-semibold">
                                              {selectedSender?.label ? selectedSender.label.charAt(0).toUpperCase() : "C"}
                                            </span>
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-1.5">
                                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {selectedSender?.label || formData.senderId || "Contact"}
                                              </p>
                                              {selectedSender?.status === "verified" && getVerificationIcon(selectedSender.status, selectedSender.id)}
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">online</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Template Message Content */}
                                    <div className="mt-0 flex flex-col">
                                      <div className="flex justify-end">
                                        <div className="relative max-w-[85%] flex flex-col items-end">
                                          {/* Header Media (Image/Video/Document) */}
                                          {formData.type === "Whatsapp" && selectedTemplate && (() => {
                                            const headerComponent = selectedTemplate.components.find(c => c.type === "HEADER")
                                            if (!headerComponent || !headerComponent.format) return null

                                            const mediaUrl = headerComponent.example?.header_handle?.[0]
                                            const isValidUrl = mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) && mediaUrl !== "image_url_here"
                                            const placeholderUrl = "https://images.unsplash.com/photo-1557683316-973673baf926?w=320&h=200&fit=crop"

                                            return (
                                              <div className="w-full mb-0 rounded-t-lg overflow-hidden">
                                                {headerComponent.format === "IMAGE" && (
                                                  <div className="w-full bg-gray-200 relative" style={{ minHeight: '150px', maxHeight: '200px' }}>
                                                    {isValidUrl ? (
                                                      <img
                                                        src={mediaUrl}
                                                        alt="Template header"
                                                        className="w-full h-full object-cover"
                                                        style={{ minHeight: '150px', maxHeight: '200px' }}
                                                        onError={(e) => {
                                                          const target = e.target as HTMLImageElement
                                                          target.src = placeholderUrl
                                                        }}
                                                      />
                                                    ) : (
                                                      <img
                                                        src={placeholderUrl}
                                                        alt="Template header placeholder"
                                                        className="w-full h-full object-cover"
                                                        style={{ minHeight: '150px', maxHeight: '200px' }}
                                                      />
                                                    )}
                                                  </div>
                                                )}
                                                {headerComponent.format === "VIDEO" && (
                                                  <div className="relative w-full bg-gray-200 aspect-video flex items-center justify-center max-h-[200px]">
                                                    <Video className="w-12 h-12 text-gray-400" />
                                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-gray-700 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                          <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                                {headerComponent.format === "DOCUMENT" && (
                                                  <div className="w-full bg-gray-100 p-4 flex items-center gap-3 border border-gray-200">
                                                    <File className="w-8 h-8 text-gray-500 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                      <p className="text-sm font-medium text-gray-900 truncate">Document.pdf</p>
                                                      <p className="text-xs text-gray-500">Document attachment</p>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          })()}

                                          {/* WhatsApp message bubble with tail */}
                                          {formData.type === "Whatsapp" ? (
                                            <>
                                              <div className={`bg-[#dcf8c6] rounded-lg px-3 py-2 shadow-sm ${selectedTemplate?.components.find(c => c.type === "HEADER" && c.format) ? 'rounded-t-none' : ''}`}>
                                                <p className="text-sm whitespace-pre-wrap text-gray-900 leading-relaxed">
                                                  {simulatedMessage || "Your message will appear here..."}
                                                </p>
                                              </div>
                                              {/* Tail */}
                                              <svg
                                                className="flex-shrink-0 -ml-1 mb-0.5"
                                                width="8"
                                                height="12"
                                                viewBox="0 0 8 13"
                                              >
                                                <path
                                                  d="M5.188 1H0v11.193l6.467-11.188C5.243.874 5.163.965 5.188 1z"
                                                  fill="#dcf8c6"
                                                />
                                              </svg>
                                            </>
                                          ) : (
                                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm">
                                              <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">
                                                {simulatedMessage || "Your message will appear here..."}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Template Buttons */}
                                      {formData.type === "Whatsapp" && selectedTemplate && (() => {
                                        const buttonsComponent = selectedTemplate.components.find(c => c.type === "BUTTONS")
                                        if (!buttonsComponent || !buttonsComponent.buttons || buttonsComponent.buttons.length === 0) return null

                                        return (
                                          <div className="flex justify-end">
                                            <div className="flex flex-col gap-1 max-w-[85%] w-full">
                                              {buttonsComponent.buttons.map((button, index) => (
                                                <div key={index} className="w-full">
                                                  {button.type === "QUICK_REPLY" && (
                                                    <div className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 shadow-sm w-full">
                                                      <p className="text-sm font-medium text-gray-900 text-center">{button.text}</p>
                                                    </div>
                                                  )}
                                                  {button.type === "URL" && (
                                                    <div className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 shadow-sm w-full">
                                                      <p className="text-sm font-medium text-green-600 text-center">{button.text}</p>
                                                    </div>
                                                  )}
                                                  {button.type === "PHONE_NUMBER" && (
                                                    <div className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 shadow-sm w-full">
                                                      <p className="text-sm font-medium text-green-600 text-center">{button.text}</p>
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )
                                      })()}

                                      {formData.type === "Whatsapp" && (
                                        <div className="flex items-center justify-end gap-1 mt-0.5 pr-1">
                                          <span className="text-[10px] text-gray-600">9:41</span>
                                          <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 16 15" fill="none">
                                            <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.063-.51zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="currentColor" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </IPhoneMockup>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* SMS Template Selection Dialog */}
      <Dialog open={isSmsTemplateDialogOpen} onOpenChange={setIsSmsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] min-h-[400px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select SMS Template</DialogTitle>
          </DialogHeader>
          <div className="mt-4 mb-2">
            <Input
              leftIcon={<Search className="h-4 w-4" />}
              placeholder="Search templates..."
              value={smsTemplateSearch}
              onChange={(e) => setSmsTemplateSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {mockSmsTemplates
              .filter(template => template.category !== "AUTHENTICATION")
              .filter(template => template.name.toLowerCase().includes(smsTemplateSearch.toLowerCase()) || (template.description || "").toLowerCase().includes(smsTemplateSearch.toLowerCase()))
              .map((template) => (
                <div
                  key={template.id}
                  className="border rounded-md p-4 bg-background hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      message: template.content,
                    }))
                    setIsDirty(true)
                    setIsSmsTemplateDialogOpen(false)
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{template.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h4>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{template.category}</Badge>
                  </div>
                  {template.description && (
                    <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                  )}
                  <div className="bg-muted min-h-[60px] p-3 rounded-md text-sm whitespace-pre-wrap">
                    {template.content}
                  </div>
                </div>
              ))}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsSmsTemplateDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper >
  )
}
