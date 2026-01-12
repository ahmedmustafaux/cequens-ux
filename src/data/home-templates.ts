// Template/workflow data for the home page
// These templates match user onboarding data (industry, goals, channels)

export interface AppIcon {
  name: string
  iconType: "emoji" | "text" | "svg" | "component"
  icon: string
  color?: string
  bgColor?: string
}

export interface WorkflowTemplate {
  id: string
  title: string
  description: string
  apps: AppIcon[]
  isAIPowered: boolean
  categories: string[] // "ai-workflow", "most-popular"
  tags?: string[] // "Campaigns", "API", "AI Powered", "Inbox", etc.
  industries?: string[] // industry IDs that this template is relevant for
  goals?: string[] // goal IDs that match user goals
  channels?: string[] // channel IDs used in this template
  readTime?: string
}

// App icon helpers
export function getAppIcon(name: string): AppIcon {
  const icons: Record<string, AppIcon> = {
    facebook: {
      name: "Facebook",
      iconType: "text",
      icon: "f",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    "google-sheets": {
      name: "Google Sheets",
      iconType: "emoji",
      icon: "📊",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    gmail: {
      name: "Gmail",
      iconType: "text",
      icon: "M",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20"
    },
    "microsoft-teams": {
      name: "Microsoft Teams",
      iconType: "text",
      icon: "T",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    whatsapp: {
      name: "WhatsApp",
      iconType: "svg",
      icon: "/icons/WhatsApp.svg",
      bgColor: "bg-white dark:bg-gray-900"
    },
    sms: {
      name: "SMS",
      iconType: "component",
      icon: "ChatText",
      bgColor: "bg-muted"
    },
    email: {
      name: "Email",
      iconType: "component",
      icon: "EnvelopeSimple",
      bgColor: "bg-muted"
    },
    "chatgpt": {
      name: "ChatGPT",
      iconType: "emoji",
      icon: "🤖",
      bgColor: "bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20"
    },
    "google-ai-studio": {
      name: "Google AI Studio",
      iconType: "emoji",
      icon: "⭐",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    }
  }
  return icons[name] || { name, iconType: "text", icon: "?", bgColor: "bg-muted" }
}

// Template data
export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "fb-leads-sheets",
    title: "Capture New Leads from Facebook, Analyze Their Details, and Log Them into Google Sheets",
    description: "Automatically capture leads from Facebook, extract their information using AI, and organize everything in Google Sheets.",
    apps: [getAppIcon("facebook"), getAppIcon("google-sheets")],
    isAIPowered: true,
    categories: ["ai-workflow", "most-popular"],
    tags: ["AI Powered", "API"],
    industries: ["ecommerce", "retail"],
    goals: ["goal-4"], // Lead generation
    channels: ["channel-5"] // Messenger
  },
  {
    id: "sheets-chatgpt-insights",
    title: "Receive automatic updates in Google Sheets with ChatGPT insights",
    description: "Get AI-powered insights and analysis automatically added to your Google Sheets from ChatGPT.",
    apps: [getAppIcon("google-sheets"), getAppIcon("chatgpt")],
    isAIPowered: true,
    categories: ["ai-workflow"],
    tags: ["AI Powered", "API"],
    industries: ["ecommerce", "technology", "finance"],
    goals: ["goal-8"], // Analytics & reporting
    channels: ["channel-3"] // Email
  },
  {
    id: "gmail-ai-replies",
    title: "Instantly Respond to New Emails with AI-Powered Replies and Google AI Studio",
    description: "Automatically generate intelligent email responses using AI to improve customer service efficiency.",
    apps: [getAppIcon("gmail"), getAppIcon("google-ai-studio")],
    isAIPowered: true,
    categories: ["ai-workflow"],
    tags: ["AI Powered"],
    industries: ["technology", "ecommerce"],
    goals: ["goal-3"], // Support automation
    channels: ["channel-3"] // Email
  },
  {
    id: "whatsapp-order-confirmation",
    title: "Send Order Confirmations via WhatsApp Automatically",
    description: "Automatically send order confirmation messages to customers via WhatsApp when they place an order.",
    apps: [getAppIcon("whatsapp")],
    isAIPowered: false,
    categories: ["most-popular"],
    tags: ["API"],
    industries: ["ecommerce", "retail"],
    goals: ["goal-1", "goal-2"], // Customer engagement, Marketing campaigns
    channels: ["channel-2"] // WhatsApp
  },
  {
    id: "sms-appointment-reminder",
    title: "Automated SMS Appointment Reminders",
    description: "Send automated SMS reminders to customers 24 hours before their scheduled appointments.",
    apps: [getAppIcon("sms")],
    isAIPowered: false,
    categories: ["most-popular"],
    tags: ["API"],
    industries: ["healthcare", "education"],
    goals: ["goal-1"], // Customer engagement
    channels: ["channel-1"] // SMS
  },
  {
    id: "multi-channel-campaign",
    title: "Multi-Channel Marketing Campaign Automation",
    description: "Run coordinated campaigns across WhatsApp, SMS, and Email with personalized messaging.",
    apps: [getAppIcon("whatsapp"), getAppIcon("sms"), getAppIcon("email")],
    isAIPowered: false,
    categories: ["most-popular"],
    tags: ["Campaigns", "API"],
    industries: ["ecommerce", "retail", "finance"],
    goals: ["goal-2", "goal-9"], // Marketing campaigns, Multi-channel messaging
    channels: ["channel-2", "channel-1", "channel-3"]
  },
  {
    id: "ai-customer-support",
    title: "AI-Powered Customer Support Automation",
    description: "Automatically handle customer inquiries using AI, escalating complex issues to human agents when needed.",
    apps: [getAppIcon("chatgpt"), getAppIcon("whatsapp")],
    isAIPowered: true,
    categories: ["ai-workflow"],
    tags: ["AI Powered"],
    industries: ["ecommerce", "technology", "retail"],
    goals: ["goal-3"], // Support automation
    channels: ["channel-2", "channel-5"] // WhatsApp, Messenger
  },
  {
    id: "abandoned-cart-recovery",
    title: "Automated Abandoned Cart Recovery via WhatsApp",
    description: "Send personalized reminders to customers who abandoned their shopping cart, increasing conversion rates.",
    apps: [getAppIcon("whatsapp")],
    isAIPowered: false,
    categories: ["most-popular"],
    tags: ["Campaigns", "API"],
    industries: ["ecommerce"],
    goals: ["goal-2", "goal-4"], // Marketing campaigns, Lead generation
    channels: ["channel-2"] // WhatsApp
  },
  {
    id: "whatsapp-shipping-updates",
    title: "Real-time Shipping Updates via WhatsApp",
    description: "Keep customers informed with automated shipping notifications and delivery tracking through WhatsApp.",
    apps: [getAppIcon("whatsapp")],
    isAIPowered: false,
    categories: ["most-popular"],
    tags: ["API"],
    industries: ["ecommerce", "retail"],
    goals: ["goal-1"], // Customer engagement
    channels: ["channel-2"] // WhatsApp
  },
  {
    id: "whatsapp-customer-support",
    title: "WhatsApp Customer Support Hub",
    description: "Manage customer inquiries, support tickets, and conversations all in one WhatsApp-powered inbox.",
    apps: [getAppIcon("whatsapp")],
    isAIPowered: false,
    categories: ["most-popular"],
    tags: ["API"],
    industries: ["ecommerce", "retail", "technology"],
    goals: ["goal-3"], // Support automation
    channels: ["channel-2"] // WhatsApp
  },
  {
    id: "whatsapp-marketing-broadcast",
    title: "WhatsApp Marketing Broadcast Campaigns",
    description: "Send targeted marketing messages, promotions, and announcements to your customer base via WhatsApp.",
    apps: [getAppIcon("whatsapp")],
    isAIPowered: false,
    categories: ["most-popular"],
    tags: ["Campaigns", "API"],
    industries: ["ecommerce", "retail", "finance"],
    goals: ["goal-2"], // Marketing campaigns
    channels: ["channel-2"] // WhatsApp
  },
  {
    id: "whatsapp-payment-reminders",
    title: "Automated Payment Reminders via WhatsApp",
    description: "Send friendly payment reminders and invoice notifications to improve collection rates.",
    apps: [getAppIcon("whatsapp")],
    isAIPowered: false,
    categories: ["most-popular"],
    tags: ["Campaigns", "API"],
    industries: ["finance", "ecommerce", "retail"],
    goals: ["goal-1", "goal-4"], // Customer engagement, Lead generation
    channels: ["channel-2"] // WhatsApp
  },
  {
    id: "ai-sentiment-analysis",
    title: "AI-Powered Sentiment Analysis for Messages",
    description: "Automatically analyze customer message sentiment and prioritize urgent or negative conversations.",
    apps: [getAppIcon("chatgpt"), getAppIcon("whatsapp")],
    isAIPowered: true,
    categories: ["ai-workflow"],
    tags: ["AI Powered", "API"],
    industries: ["ecommerce", "technology", "retail"],
    goals: ["goal-3", "goal-8"], // Support automation, Analytics
    channels: ["channel-2", "channel-1", "channel-3"]
  },
  {
    id: "ai-message-translation",
    title: "AI Message Translation & Localization",
    description: "Automatically translate customer messages and responses to support global customers in their language.",
    apps: [getAppIcon("google-ai-studio"), getAppIcon("whatsapp")],
    isAIPowered: true,
    categories: ["ai-workflow"],
    tags: ["AI Powered", "API"],
    industries: ["ecommerce", "technology", "retail"],
    goals: ["goal-3"], // Support automation
    channels: ["channel-2", "channel-1", "channel-3"]
  },
  {
    id: "ai-personalized-recommendations",
    title: "AI-Powered Personalized Product Recommendations",
    description: "Send personalized product recommendations to customers based on their purchase history and preferences.",
    apps: [getAppIcon("chatgpt"), getAppIcon("whatsapp")],
    isAIPowered: true,
    categories: ["ai-workflow"],
    tags: ["AI Powered", "Campaigns"],
    industries: ["ecommerce", "retail"],
    goals: ["goal-2", "goal-4"], // Marketing campaigns, Lead generation
    channels: ["channel-2", "channel-3"]
  },
  {
    id: "ai-conversation-summaries",
    title: "AI-Generated Conversation Summaries",
    description: "Automatically generate summaries of customer conversations for better team collaboration and insights.",
    apps: [getAppIcon("chatgpt"), getAppIcon("google-sheets")],
    isAIPowered: true,
    categories: ["ai-workflow"],
    tags: ["AI Powered", "API"],
    industries: ["ecommerce", "technology", "finance"],
    goals: ["goal-8"], // Analytics & reporting
    channels: ["channel-2", "channel-1", "channel-3"]
  },
  {
    id: "healthcare-appointment-whatsapp",
    title: "Healthcare Appointment Reminders via WhatsApp",
    description: "Send appointment confirmations, reminders, and health tips to patients through WhatsApp.",
    apps: [getAppIcon("whatsapp")],
    isAIPowered: false,
    categories: ["most-popular"],
    tags: ["API"],
    industries: ["healthcare"],
    goals: ["goal-1", "goal-5"], // Customer engagement, Compliance
    channels: ["channel-2"] // WhatsApp
  },
  {
    id: "finance-transaction-alerts",
    title: "Financial Transaction Alerts via WhatsApp",
    description: "Send secure transaction notifications, account updates, and security alerts to banking customers.",
    apps: [getAppIcon("whatsapp")],
    isAIPowered: false,
    categories: ["most-popular"],
    tags: ["API"],
    industries: ["finance"],
    goals: ["goal-1", "goal-5"], // Customer engagement, Compliance
    channels: ["channel-2"] // WhatsApp
  },
  {
    id: "customer-surveys-inbox",
    title: "Customer Feedback Surveys & Collection",
    description: "Create and manage customer satisfaction surveys, collect feedback, and analyze responses in your inbox.",
    apps: [getAppIcon("whatsapp"), getAppIcon("email")],
    isAIPowered: false,
    categories: ["most-popular"],
    tags: ["Inbox"],
    industries: ["ecommerce", "retail", "technology"],
    goals: ["goal-1", "goal-8"], // Customer engagement, Analytics
    channels: ["channel-2", "channel-3", "channel-1"]
  },
  {
    id: "team-groups-management",
    title: "Team Groups & Collaboration Hub",
    description: "Organize team conversations, manage group chats, and coordinate customer support across multiple channels.",
    apps: [getAppIcon("whatsapp"), getAppIcon("sms")],
    isAIPowered: false,
    categories: ["most-popular"],
    tags: ["Inbox"],
    industries: ["ecommerce", "technology", "retail"],
    goals: ["goal-3"], // Support automation
    channels: ["channel-2", "channel-1", "channel-3"]
  },
  {
    id: "ai-chatbot-inbox",
    title: "AI Chatbot for Inbox Automation",
    description: "Deploy intelligent chatbots to handle customer inquiries, route conversations, and escalate to human agents when needed.",
    apps: [getAppIcon("chatgpt"), getAppIcon("whatsapp")],
    isAIPowered: true,
    categories: ["ai-workflow"],
    tags: ["Inbox", "AI Powered"],
    industries: ["ecommerce", "technology", "retail"],
    goals: ["goal-3"], // Support automation
    channels: ["channel-2", "channel-1", "channel-5"]
  },
  {
    id: "unified-inbox-management",
    title: "Unified Inbox for Multi-Channel Support",
    description: "Centralize all customer conversations from WhatsApp, SMS, Email, and more in one unified inbox interface.",
    apps: [getAppIcon("whatsapp"), getAppIcon("sms"), getAppIcon("email")],
    isAIPowered: false,
    categories: ["most-popular"],
    tags: ["Inbox"],
    industries: ["ecommerce", "retail", "technology", "finance"],
    goals: ["goal-3", "goal-9"], // Support automation, Multi-channel messaging
    channels: ["channel-2", "channel-1", "channel-3"]
  },
  {
    id: "inbox-assignment-routing",
    title: "Smart Inbox Assignment & Routing",
    description: "Automatically assign conversations to the right team members based on skills, workload, and conversation context.",
    apps: [getAppIcon("whatsapp")],
    isAIPowered: false,
    categories: ["most-popular"],
    tags: ["Inbox"],
    industries: ["ecommerce", "technology", "retail"],
    goals: ["goal-3"], // Support automation
    channels: ["channel-2", "channel-1", "channel-3"]
  },
  {
    id: "ai-inbox-sentiment-routing",
    title: "AI-Powered Sentiment-Based Inbox Routing",
    description: "Use AI to analyze message sentiment and automatically prioritize urgent or negative conversations in your inbox.",
    apps: [getAppIcon("chatgpt"), getAppIcon("whatsapp")],
    isAIPowered: true,
    categories: ["ai-workflow"],
    tags: ["Inbox", "AI Powered"],
    industries: ["ecommerce", "technology", "retail"],
    goals: ["goal-3", "goal-8"], // Support automation, Analytics
    channels: ["channel-2", "channel-1", "channel-3"]
  }
]

// Featured content/articles data
export interface FeaturedContent {
  id: string
  title: string
  description: string
  readTime: string
  apps: string[] // App names for visual generation
  cta: {
    label: string
    href?: string
  }
}

// Featured content items
export const featuredContent: FeaturedContent[] = [
  {
    id: "sheets-automation",
    title: "6 Google Sheets automation ideas to organize your work",
    description: "Want AI and automation to improve your spreadsheet workflows? Get ideas and templates for connecting the king of sheets to the rest of your tech stack.",
    readTime: "4 min",
    apps: ["google-sheets", "facebook", "microsoft-teams", "gmail"],
    cta: {
      label: "Read the post"
    }
  }
]
