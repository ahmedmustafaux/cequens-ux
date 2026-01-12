// Unified mock data for the application
// This file contains all mock/example data used across the application

// ============================================================================
// TYPES
// ============================================================================

export type Campaign = {
  id: number;
  name: string;
  status: "Active" | "Draft" | "Completed";
  type: "Email" | "SMS" | "Whatsapp";
  recipients: number;
  sentDate: string | null;
  openRate: number;
  clickRate: number;
};

export type Contact = {
  id: string;
  name: string;
  phone: string; // includes country code directly (e.g., "+966501234567")
  countryISO: string; // ISO 3166-1 alpha-2 country code for flags
  avatar: string;
  avatarColor: string;
  tags: string[];
  channel: string;
  conversationStatus: string;
  assignee: string | null;
  lastMessage: string;
  isSelected: boolean;
  createdAt?: Date; // Date when contact was created
  lastInteractionTime?: Date; // Date of last interaction
  // Additional filter/segment fields
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  language?: string;
  botStatus?: string;
  lastInteractedChannel?: string;
  conversationOpenedTime?: Date;
};

export type ChartDataPoint = {
  date: string;
  whatsapp: number;
  sms: number;
};

export type DashboardChartDataPoint = {
  date: string;      // ISO format date (YYYY-MM-DD)
  period: string;    // Formatted date (e.g., "Jan 15")
  messages: number;  // Number of messages sent
  senders: number;   // Number of active senders
};

export type DashboardMetrics = {
  messagesSent: { value: string; change: string; trend: "up" | "down" };
  deliveryRate: { value: string; change: string; trend: "up" | "down" };
  activeSenders: { value: string; change: string; trend: "up" | "down" };
  responseRate: { value: string; change: string; trend: "up" | "down" };
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  category?: 'system' | 'campaign' | 'contact' | 'message' | 'billing';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  archived?: boolean;
};

export type SegmentFilter = {
  field: 'countryISO' | 'tags' | 'channel' | 'conversationStatus' | 'firstName' | 'lastName' | 'phoneNumber' | 'emailAddress' | 'language' | 'botStatus' | 'lastInteractedChannel' | 'timeSinceLastIncomingMessage' | 'lastMessageDate' | 'createdDate' | 'assignee' | 'conversationOpenedTime' | 'createdAt' | 'lastInteractionTime';
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty' | 'exists' | 'doesNotExist' | 'in' | 'notIn' | 'hasAnyOf' | 'hasAllOf' | 'hasNoneOf' | 'greaterThan' | 'lessThan' | 'between' | 'from' | 'to' | 'fromOnly' | 'isTimestampAfter' | 'isTimestampBefore' | 'isTimestampBetween' | 'isGreaterThanTime' | 'isLessThanTime' | 'isBetweenTime';
  value: string | string[] | number | number[] | Date | { from: Date; to: Date };
};

export type Segment = {
  id: string;
  name: string;
  description?: string;
  filters: SegmentFilter[];
  contactIds: string[]; // IDs of contacts that match this segment
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// CAMPAIGNS DATA
// ============================================================================

export const mockCampaigns: Campaign[] = [
  {
    id: 1,
    name: "Welcome Series",
    status: "Active",
    type: "Email",
    recipients: 1250,
    sentDate: "2024-01-15",
    openRate: 24.5,
    clickRate: 8.2,
  },
  {
    id: 2,
    name: "Product Launch",
    status: "Draft",
    type: "SMS",
    recipients: 0,
    sentDate: null,
    openRate: 0,
    clickRate: 0,
  },
  {
    id: 3,
    name: "Holiday Sale",
    status: "Completed",
    type: "Email",
    recipients: 2100,
    sentDate: "2023-12-20",
    openRate: 31.2,
    clickRate: 12.8,
  },
  {
    id: 4,
    name: "Newsletter",
    status: "Active",
    type: "Email",
    recipients: 3400,
    sentDate: "2024-01-01",
    openRate: 18.7,
    clickRate: 5.4,
  },
];

// ============================================================================
// CONTACTS DATA
// ============================================================================

// Helper function to parse lastMessage string to Date
const parseLastMessageToDate = (lastMessage: string): Date => {
  const now = new Date();
  const lowerMessage = lastMessage.toLowerCase();
  
  if (lowerMessage.includes("minute")) {
    const minutes = parseInt(lowerMessage.match(/(\d+)/)?.[1] || "0");
    return new Date(now.getTime() - minutes * 60 * 1000);
  }
  if (lowerMessage.includes("hour")) {
    const hours = parseInt(lowerMessage.match(/(\d+)/)?.[1] || "0");
    return new Date(now.getTime() - hours * 60 * 60 * 1000);
  }
  if (lowerMessage.includes("day")) {
    const days = parseInt(lowerMessage.match(/(\d+)/)?.[1] || "0");
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }
  if (lowerMessage.includes("week")) {
    const weeks = parseInt(lowerMessage.match(/(\d+)/)?.[1] || "0");
    return new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
  }
  if (lowerMessage.includes("month")) {
    const months = parseInt(lowerMessage.match(/(\d+)/)?.[1] || "0");
    const date = new Date(now);
    date.setMonth(date.getMonth() - months);
    return date;
  }
  // Default to now if can't parse
  return now;
};

// Helper function to generate createdAt date (some recent, some old)
const generateCreatedAt = (index: number): Date => {
  const now = new Date();
  // Mix of recent (last 7 days) and older contacts
  if (index % 3 === 0) {
    // Recent contacts (created in last 7 days)
    const daysAgo = Math.floor(Math.random() * 7);
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  } else if (index % 3 === 1) {
    // Medium age (8-30 days ago)
    const daysAgo = 8 + Math.floor(Math.random() * 23);
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  } else {
    // Older contacts (31+ days ago)
    const daysAgo = 31 + Math.floor(Math.random() * 60);
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  }
};

export const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Muthaher Ahmed",
    phone: "+918056182308",
    countryISO: "IN",
    avatar: "MA",
    avatarColor: "bg-purple-500",
    tags: ["VIP"],
    channel: "whatsapp",
    conversationStatus: "unassigned",
    assignee: null,
    lastMessage: "5 minutes ago",
    isSelected: false,
    firstName: "Muthaher",
    lastName: "Ahmed",
    emailAddress: "muthaher.ahmed@example.com",
    language: "en",
    botStatus: "active",
    lastInteractedChannel: "whatsapp"
  },
  {
    id: "2",
    name: "N. bash",
    phone: "+966551246489",
    countryISO: "SA",
    avatar: "NB",
    avatarColor: "bg-green-500",
    tags: [],
    channel: "whatsapp",
    conversationStatus: "unassigned",
    assignee: null,
    lastMessage: "3 hours ago",
    isSelected: false
  },
  {
    id: "3",
    name: "Salma Salah",
    phone: "+201206098604",
    countryISO: "EG",
    avatar: "SS",
    avatarColor: "bg-emerald-500",
    tags: [],
    channel: "whatsapp",
    conversationStatus: "unassigned",
    assignee: null,
    lastMessage: "an hour ago",
    isSelected: false
  },
  {
    id: "4",
    name: "test zid",
    phone: "+966500000005",
    countryISO: "SA",
    avatar: "TZ",
    avatarColor: "bg-lime-500",
    tags: ["SILVER PACKAGE", "AREA"],
    channel: "instagram",
    conversationStatus: "closed",
    assignee: null,
    lastMessage: "3 months ago",
    isSelected: false
  },
  {
    id: "5",
    name: "ola",
    phone: "+966556280930",
    countryISO: "SA",
    avatar: "O",
    avatarColor: "bg-red-600",
    tags: ["AREA"],
    channel: "messenger",
    conversationStatus: "closed",
    assignee: null,
    lastMessage: "3 months ago",
    isSelected: false
  },
  {
    id: "6",
    name: "Omar Sattam",
    phone: "+966544351828",
    countryISO: "SA",
    avatar: "OS",
    avatarColor: "bg-red-600",
    tags: ["AHMED", "DND-LIST"],
    channel: "whatsapp",
    conversationStatus: "assigned",
    assignee: "Salma",
    lastMessage: "9 minutes ago",
    isSelected: false
  },
  {
    id: "7",
    name: "لمياء القحطاني",
    phone: "+966534924155",
    countryISO: "SA",
    avatar: "لا",
    avatarColor: "bg-yellow-500",
    tags: ["AREA"],
    channel: "whatsapp",
    conversationStatus: "closed",
    assignee: null,
    lastMessage: "3 months ago",
    isSelected: false
  },
  {
    id: "8",
    name: "Ahmed Hassan",
    phone: "+966501234567",
    countryISO: "SA",
    avatar: "AH",
    avatarColor: "bg-blue-500",
    tags: ["VIP", "PREMIUM"],
    channel: "whatsapp",
    conversationStatus: "assigned",
    assignee: "Salma",
    lastMessage: "2 hours ago",
    isSelected: false,
    firstName: "Ahmed",
    lastName: "Hassan",
    emailAddress: "ahmed.hassan@example.com",
    language: "ar",
    botStatus: "active",
    lastInteractedChannel: "whatsapp"
  },
  {
    id: "9",
    name: "Fatima Al-Zahra",
    phone: "+966502345678",
    countryISO: "SA",
    avatar: "FA",
    avatarColor: "bg-pink-500",
    tags: ["NEW CUSTOMER"],
    channel: "whatsapp",
    conversationStatus: "unassigned",
    assignee: null,
    lastMessage: "1 day ago",
    isSelected: false
  },
  {
    id: "10",
    name: "Mohammed Ali",
    phone: "+966503456789",
    countryISO: "SA",
    avatar: "MA",
    avatarColor: "bg-indigo-500",
    tags: ["SILVER PACKAGE", "AREA", "VIP"],
    channel: "whatsapp",
    conversationStatus: "closed",
    assignee: null,
    lastMessage: "1 week ago",
    isSelected: false
  },
  {
    id: "11",
    name: "Sarah Johnson",
    phone: "+1504567890",
    countryISO: "US",
    avatar: "SJ",
    avatarColor: "bg-teal-500",
    tags: ["INTERNATIONAL"],
    channel: "whatsapp",
    conversationStatus: "assigned",
    assignee: "Omar",
    lastMessage: "30 minutes ago",
    isSelected: false,
    firstName: "Sarah",
    lastName: "Johnson",
    emailAddress: "sarah.johnson@example.com",
    language: "en",
    botStatus: "active",
    lastInteractedChannel: "whatsapp"
  },
  {
    id: "12",
    name: "Ali Al-Rashid",
    phone: "+966505678901",
    countryISO: "SA",
    avatar: "AR",
    avatarColor: "bg-orange-500",
    tags: ["AREA", "DND-LIST"],
    channel: "whatsapp",
    conversationStatus: "unassigned",
    assignee: null,
    lastMessage: "4 hours ago",
    isSelected: false
  },
  {
    id: "13",
    name: "Nour Al-Din",
    phone: "+966506789012",
    countryISO: "SA",
    avatar: "NA",
    avatarColor: "bg-cyan-500",
    tags: ["PREMIUM", "VIP"],
    channel: "whatsapp",
    conversationStatus: "assigned",
    assignee: "Salma",
    lastMessage: "15 minutes ago",
    isSelected: false
  },
  {
    id: "14",
    name: "Layla Ahmed",
    phone: "+966507890123",
    countryISO: "SA",
    avatar: "LA",
    avatarColor: "bg-rose-500",
    tags: ["NEW CUSTOMER", "AREA"],
    channel: "whatsapp",
    conversationStatus: "unassigned",
    assignee: null,
    lastMessage: "6 hours ago",
    isSelected: false
  },
  {
    id: "15",
    name: "Khalid Al-Mansouri",
    phone: "+966508901234",
    countryISO: "SA",
    avatar: "KM",
    avatarColor: "bg-violet-500",
    tags: ["SILVER PACKAGE"],
    channel: "whatsapp",
    conversationStatus: "closed",
    assignee: null,
    lastMessage: "2 days ago",
    isSelected: false
  },
  {
    id: "16",
    name: "Aisha Al-Zahra",
    phone: "+966509012345",
    countryISO: "SA",
    avatar: "AZ",
    avatarColor: "bg-emerald-600",
    tags: ["VIP", "PREMIUM"],
    channel: "whatsapp",
    conversationStatus: "assigned",
    assignee: "Omar",
    lastMessage: "45 minutes ago",
    isSelected: false
  },
  {
    id: "17",
    name: "Youssef Hassan",
    phone: "+966510123456",
    countryISO: "SA",
    avatar: "YH",
    avatarColor: "bg-amber-500",
    tags: ["NEW CUSTOMER"],
    channel: "instagram",
    conversationStatus: "unassigned",
    assignee: null,
    lastMessage: "1 hour ago",
    isSelected: false
  },
  {
    id: "18",
    name: "Mariam Al-Sayed",
    phone: "+966511234567",
    countryISO: "SA",
    avatar: "MS",
    avatarColor: "bg-purple-600",
    tags: ["AREA", "SILVER PACKAGE"],
    channel: "whatsapp",
    conversationStatus: "assigned",
    assignee: "Salma",
    lastMessage: "20 minutes ago",
    isSelected: false
  },
  {
    id: "19",
    name: "Tariq Al-Rashid",
    phone: "+966512345678",
    countryISO: "SA",
    avatar: "TR",
    avatarColor: "bg-slate-500",
    tags: ["DND-LIST"],
    channel: "whatsapp",
    conversationStatus: "closed",
    assignee: null,
    lastMessage: "1 week ago",
    isSelected: false
  },
  {
    id: "20",
    name: "Hala Al-Mahmoud",
    phone: "+966513456789",
    countryISO: "SA",
    avatar: "HM",
    avatarColor: "bg-fuchsia-500",
    tags: ["INTERNATIONAL", "VIP"],
    channel: "whatsapp",
    conversationStatus: "assigned",
    assignee: "Omar",
    lastMessage: "10 minutes ago",
    isSelected: false
  },
  {
    id: "21",
    name: "Omar Al-Din",
    phone: "+966514567890",
    countryISO: "SA",
    avatar: "OD",
    avatarColor: "bg-sky-500",
    tags: ["PREMIUM"],
    channel: "whatsapp",
    conversationStatus: "unassigned",
    assignee: null,
    lastMessage: "3 hours ago",
    isSelected: false
  },
  {
    id: "22",
    name: "Nadia Al-Khalil",
    phone: "+966515678901",
    countryISO: "SA",
    avatar: "NK",
    avatarColor: "bg-lime-600",
    tags: ["AREA", "NEW CUSTOMER"],
    channel: "whatsapp",
    conversationStatus: "assigned",
    assignee: "Salma",
    lastMessage: "25 minutes ago",
    isSelected: false
  },
  {
    id: "23",
    name: "Faisal Al-Mutairi",
    phone: "+966516789012",
    countryISO: "SA",
    avatar: "FM",
    avatarColor: "bg-red-500",
    tags: ["SILVER PACKAGE", "AREA"],
    channel: "whatsapp",
    conversationStatus: "closed",
    assignee: null,
    lastMessage: "4 days ago",
    isSelected: false
  },
  {
    id: "24",
    name: "Rania Al-Sabah",
    phone: "+966517890123",
    countryISO: "SA",
    avatar: "RS",
    avatarColor: "bg-green-600",
    tags: ["VIP"],
    channel: "whatsapp",
    conversationStatus: "assigned",
    assignee: "Omar",
    lastMessage: "5 minutes ago",
    isSelected: false
  },
  {
    id: "25",
    name: "Saeed Al-Ghamdi",
    phone: "+966518901234",
    countryISO: "SA",
    avatar: "SG",
    avatarColor: "bg-indigo-600",
    tags: ["PREMIUM", "INTERNATIONAL"],
    channel: "whatsapp",
    conversationStatus: "unassigned",
    assignee: null,
    lastMessage: "2 hours ago",
    isSelected: false
  },
  {
    id: "26",
    name: "Lina Al-Fahad",
    phone: "+966519012345",
    countryISO: "SA",
    avatar: "LF",
    avatarColor: "bg-pink-600",
    tags: ["NEW CUSTOMER", "AREA"],
    channel: "whatsapp",
    conversationStatus: "assigned",
    assignee: "Salma",
    lastMessage: "35 minutes ago",
    isSelected: false
  },
  {
    id: "27",
    name: "Majed Al-Otaibi",
    phone: "+966520123456",
    countryISO: "SA",
    avatar: "MO",
    avatarColor: "bg-teal-600",
    tags: ["SILVER PACKAGE"],
    channel: "whatsapp",
    conversationStatus: "closed",
    assignee: null,
    lastMessage: "1 week ago",
    isSelected: false
  },
  {
    id: "28",
    name: "Dina Al-Shammari",
    phone: "+966521234567",
    countryISO: "SA",
    avatar: "DS",
    avatarColor: "bg-orange-600",
    tags: ["VIP", "AREA"],
    channel: "whatsapp",
    conversationStatus: "assigned",
    assignee: "Omar",
    lastMessage: "15 minutes ago",
    isSelected: false
  },
  {
    id: "29",
    name: "Waleed Al-Harbi",
    phone: "+966522345678",
    countryISO: "SA",
    avatar: "WH",
    avatarColor: "bg-cyan-600",
    tags: ["PREMIUM", "DND-LIST"],
    channel: "whatsapp",
    conversationStatus: "unassigned",
    assignee: null,
    lastMessage: "6 hours ago",
    isSelected: false
  },
  {
    id: "30",
    name: "Zainab Al-Qahtani",
    phone: "+966523456789",
    countryISO: "SA",
    avatar: "ZQ",
    avatarColor: "bg-violet-600",
    tags: ["NEW CUSTOMER", "SILVER PACKAGE"],
    channel: "whatsapp",
    conversationStatus: "assigned",
    assignee: "Salma",
    lastMessage: "40 minutes ago",
    isSelected: false
  }
].map((contact, index) => {
  // Parse name into firstName and lastName if not already set
  let firstName = contact.firstName
  let lastName = contact.lastName
  
  if (!firstName && !lastName && contact.name) {
    const nameParts = contact.name.trim().split(/\s+/)
    if (nameParts.length === 1) {
      // Single name - treat as first name
      firstName = nameParts[0]
      lastName = ""
    } else if (nameParts.length >= 2) {
      // Multiple parts - first part is firstName, rest is lastName
      firstName = nameParts[0]
      lastName = nameParts.slice(1).join(" ")
    }
  }
  
  return {
    ...contact,
    firstName: firstName || "",
    lastName: lastName || "",
    createdAt: generateCreatedAt(index),
    lastInteractionTime: parseLastMessageToDate(contact.lastMessage),
  }
});

// ============================================================================
// CHART DATA
// ============================================================================

export const getChartData = (timeRange: string): ChartDataPoint[] => {
  const baseData: ChartDataPoint[] = [
    { date: "2024-04-01", whatsapp: 222, sms: 150 },
    { date: "2024-04-02", whatsapp: 97, sms: 180 },
    { date: "2024-04-03", whatsapp: 167, sms: 120 },
    { date: "2024-04-04", whatsapp: 242, sms: 260 },
    { date: "2024-04-05", whatsapp: 373, sms: 290 },
    { date: "2024-04-06", whatsapp: 301, sms: 340 },
    { date: "2024-04-07", whatsapp: 245, sms: 180 },
    { date: "2024-04-08", whatsapp: 409, sms: 320 },
    { date: "2024-04-09", whatsapp: 59, sms: 110 },
    { date: "2024-04-10", whatsapp: 261, sms: 190 },
    { date: "2024-04-11", whatsapp: 327, sms: 350 },
    { date: "2024-04-12", whatsapp: 292, sms: 210 },
    { date: "2024-04-13", whatsapp: 342, sms: 380 },
    { date: "2024-04-14", whatsapp: 137, sms: 220 },
    { date: "2024-04-15", whatsapp: 120, sms: 170 },
    { date: "2024-04-16", whatsapp: 138, sms: 190 },
    { date: "2024-04-17", whatsapp: 446, sms: 360 },
    { date: "2024-04-18", whatsapp: 364, sms: 410 },
    { date: "2024-04-19", whatsapp: 243, sms: 180 },
    { date: "2024-04-20", whatsapp: 89, sms: 150 },
    { date: "2024-04-21", whatsapp: 137, sms: 200 },
    { date: "2024-04-22", whatsapp: 224, sms: 170 },
    { date: "2024-04-23", whatsapp: 138, sms: 230 },
    { date: "2024-04-24", whatsapp: 387, sms: 290 },
    { date: "2024-04-25", whatsapp: 215, sms: 250 },
    { date: "2024-04-26", whatsapp: 75, sms: 130 },
    { date: "2024-04-27", whatsapp: 383, sms: 420 },
    { date: "2024-04-28", whatsapp: 122, sms: 180 },
    { date: "2024-04-29", whatsapp: 315, sms: 240 },
    { date: "2024-04-30", whatsapp: 454, sms: 380 },
    { date: "2024-05-01", whatsapp: 165, sms: 220 },
    { date: "2024-05-02", whatsapp: 293, sms: 310 },
    { date: "2024-05-03", whatsapp: 247, sms: 190 },
    { date: "2024-05-04", whatsapp: 385, sms: 420 },
    { date: "2024-05-05", whatsapp: 481, sms: 390 },
    { date: "2024-05-06", whatsapp: 498, sms: 520 },
    { date: "2024-05-07", whatsapp: 388, sms: 300 },
    { date: "2024-05-08", whatsapp: 149, sms: 210 },
    { date: "2024-05-09", whatsapp: 227, sms: 180 },
    { date: "2024-05-10", whatsapp: 293, sms: 330 },
    { date: "2024-05-11", whatsapp: 335, sms: 270 },
    { date: "2024-05-12", whatsapp: 197, sms: 240 },
    { date: "2024-05-13", whatsapp: 197, sms: 160 },
    { date: "2024-05-14", whatsapp: 448, sms: 490 },
    { date: "2024-05-15", whatsapp: 473, sms: 380 },
    { date: "2024-05-16", whatsapp: 338, sms: 400 },
    { date: "2024-05-17", whatsapp: 499, sms: 420 },
    { date: "2024-05-18", whatsapp: 315, sms: 350 },
    { date: "2024-05-19", whatsapp: 235, sms: 180 },
    { date: "2024-05-20", whatsapp: 177, sms: 230 },
    { date: "2024-05-21", whatsapp: 82, sms: 140 },
    { date: "2024-05-22", whatsapp: 81, sms: 120 },
    { date: "2024-05-23", whatsapp: 252, sms: 290 },
    { date: "2024-05-24", whatsapp: 294, sms: 220 },
    { date: "2024-05-25", whatsapp: 201, sms: 250 },
    { date: "2024-05-26", whatsapp: 213, sms: 170 },
    { date: "2024-05-27", whatsapp: 420, sms: 460 },
    { date: "2024-05-28", whatsapp: 233, sms: 190 },
    { date: "2024-05-29", whatsapp: 78, sms: 130 },
    { date: "2024-05-30", whatsapp: 340, sms: 280 },
    { date: "2024-05-31", whatsapp: 178, sms: 230 },
    { date: "2024-06-01", whatsapp: 178, sms: 200 },
    { date: "2024-06-02", whatsapp: 470, sms: 410 },
    { date: "2024-06-03", whatsapp: 103, sms: 160 },
    { date: "2024-06-04", whatsapp: 439, sms: 380 },
    { date: "2024-06-05", whatsapp: 88, sms: 140 },
    { date: "2024-06-06", whatsapp: 294, sms: 250 },
    { date: "2024-06-07", whatsapp: 323, sms: 370 },
    { date: "2024-06-08", whatsapp: 385, sms: 320 },
    { date: "2024-06-09", whatsapp: 438, sms: 480 },
    { date: "2024-06-10", whatsapp: 155, sms: 200 },
    { date: "2024-06-11", whatsapp: 92, sms: 150 },
    { date: "2024-06-12", whatsapp: 492, sms: 420 },
    { date: "2024-06-13", whatsapp: 81, sms: 130 },
    { date: "2024-06-14", whatsapp: 426, sms: 380 },
    { date: "2024-06-15", whatsapp: 307, sms: 350 },
    { date: "2024-06-16", whatsapp: 371, sms: 310 },
    { date: "2024-06-17", whatsapp: 475, sms: 520 },
    { date: "2024-06-18", whatsapp: 107, sms: 170 },
    { date: "2024-06-19", whatsapp: 341, sms: 290 },
    { date: "2024-06-20", whatsapp: 408, sms: 450 },
    { date: "2024-06-21", whatsapp: 169, sms: 210 },
    { date: "2024-06-22", whatsapp: 317, sms: 270 },
    { date: "2024-06-23", whatsapp: 480, sms: 530 },
    { date: "2024-06-24", whatsapp: 132, sms: 180 },
    { date: "2024-06-25", whatsapp: 141, sms: 190 },
    { date: "2024-06-26", whatsapp: 434, sms: 380 },
    { date: "2024-06-27", whatsapp: 448, sms: 490 },
    { date: "2024-06-28", whatsapp: 149, sms: 200 },
    { date: "2024-06-29", whatsapp: 103, sms: 160 },
    { date: "2024-06-30", whatsapp: 446, sms: 400 },
  ];

  // Return different datasets based on time range
  switch (timeRange) {
    case "7d":
      return baseData.slice(-7).map((item, index) => ({
        ...item,
        whatsapp: Math.floor(item.whatsapp * (1.1 + (index / 6) * 0.2)),
        sms: Math.floor(item.sms * (1.2 + (index / 6) * 0.2))
      }));
    case "30d":
      return baseData.slice(-30).map((item, index) => ({
        ...item,
        whatsapp: Math.floor(item.whatsapp * (0.95 + (index / 29) * 0.1)),
        sms: Math.floor(item.sms * (0.9 + (index / 29) * 0.2))
      }));
    case "90d":
      return baseData.map((item, index) => ({
        ...item,
        whatsapp: Math.floor(item.whatsapp * (0.8 + (index / baseData.length) * 0.4)),
        sms: Math.floor(item.sms * (0.7 + (index / baseData.length) * 0.6))
      }));
    default:
      return baseData.slice(-30);
  }
};

// ============================================================================
// NAVIGATION DATA
// ============================================================================

export const navigationData = {
  navMain: [
    {
      title: "Overview",
      url: "/",
      icon: "IconDashboard",
    },
    {
      title: "Messages",
      url: "/messages",
      icon: "IconMessage",
    },
    {
      title: "Campaigns",
      url: "/campaigns",
      icon: "IconPhoneCall",
      items: [
        {
          title: "All Campaigns",
          url: "/campaigns",
        },
        {
          title: "Templates",
          url: "/campaigns/templates",
        },
        {
          title: "AI Bots",
          url: "/campaigns/ai-bots",
        },
        {
          title: "Settings",
          url: "/campaigns/settings",
        },
      ],
    },
    {
      title: "Audience",
      url: "/contacts",
      icon: "IconUsers",
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: "IconChartBar",
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: "IconSearch",
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: "IconSettings",
    },
    {
      title: "Help & Support",
      url: "/help",
      icon: "IconHelp",
    },
  ],
};

// ============================================================================
// NOTIFICATION DATA
// ============================================================================

export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Message Received",
    message: "You have a new message from Ahmed Ali",
    type: "info",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    category: "message",
    priority: "medium",
  },
  {
    id: "2",
    title: "Campaign Completed",
    message: "Your 'Welcome Series' campaign has been completed successfully",
    type: "success",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    category: "campaign",
    priority: "low",
  },
  {
    id: "3",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur tonight from 2-4 AM",
    type: "warning",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: true,
    category: "system",
    priority: "medium",
  },
  {
    id: "4",
    title: "New Contact Added",
    message: "Sarah Johnson has been added to your contacts",
    type: "info",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: true,
    category: "contact",
    priority: "low",
  },
  {
    id: "5",
    title: "Billing Alert",
    message: "Your subscription will renew in 3 days",
    type: "warning",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: false,
    category: "billing",
    priority: "high",
  },
];

// ============================================================================
// DASHBOARD DATA
// ============================================================================

/**
 * Generates random dashboard chart data based on the specified time range
 * 
 * This function creates an array of data points with random values for messages and senders
 * that can be used for dashboard visualizations. The data is completely randomized
 * to avoid sequential patterns.
 * 
 * @param range - Time range string ("7d", "30d", or "90d")
 * @returns Array of data points with date, period, messages, and senders properties
 */
export const getDashboardChartData = (range: string): DashboardChartDataPoint[] => {
  const today = new Date()
  let numDays: number
  
  switch (range) {
    case "7d":
      numDays = 7
      break
    case "30d":
      numDays = 30
      break
    case "90d":
      numDays = 90
      break
    default:
      numDays = 30
  }
  
  // Generate data for each day in the range
  const dataPoints = Array.from({ length: numDays }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (numDays - 1 - i))
    
    // Format the day as "MMM DD" (e.g., "Jan 15")
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    })
    
    return { 
      date,
      period: formattedDate
    }
  })

  // Generate completely random data for each time period
  return dataPoints.map((point) => {
    // Random values within reasonable ranges
    const randomMessagesSent = Math.floor(Math.random() * 80000) + 10000 // Random between 10,000 and 90,000
    const randomActiveSenders = Math.floor(Math.random() * 800) + 200 // Random between 200 and 1,000

    return {
      date: point.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      period: point.period,
      messages: randomMessagesSent,
      senders: randomActiveSenders,
    }
  })
}

/**
 * Generates random dashboard metrics data
 * 
 * This function creates random metrics for the dashboard cards including
 * message counts, delivery rates, active senders, and response rates.
 * Values are completely randomized to avoid sequential patterns.
 * 
 * @returns Dashboard metrics object with random values
 */
export const getDashboardMetrics = (): DashboardMetrics => {
  // Generate random metrics data
  
  // Random message count between 20,000 and 500,000
  const randomMessages = Math.floor(Math.random() * 480000) + 20000
  const formattedMessages = randomMessages.toLocaleString()
  
  // Random delivery rate between 95% and 99.9%
  const randomDelivery = (95 + Math.random() * 4.9).toFixed(1)
  
  // Random active senders between 300 and 5,000
  const randomSenders = Math.floor(Math.random() * 4700) + 300
  const formattedSenders = randomSenders.toLocaleString()
  
  // Random response rate between 25% and 40%
  const randomResponse = (25 + Math.random() * 15).toFixed(1)
  
  // Random change percentages between -5% and +25%
  const getRandomChange = () => {
    const changeValue = Math.random() * 30 - 5
    const changeFormatted = changeValue.toFixed(1)
    return (changeValue > 0 ? "+" : "") + changeFormatted + "%"
  }
  
  // Determine trend based on change value
  const getTrend = (change: string): "up" | "down" => 
    change.startsWith("+") ? "up" : "down"
  
  const messagesChange = getRandomChange()
  const deliveryChange = getRandomChange()
  const sendersChange = getRandomChange()
  const responseChange = getRandomChange()
  
  return {
    messagesSent: { value: formattedMessages, change: messagesChange, trend: getTrend(messagesChange) },
    deliveryRate: { value: randomDelivery + "%", change: deliveryChange, trend: getTrend(deliveryChange) },
    activeSenders: { value: formattedSenders, change: sendersChange, trend: getTrend(sendersChange) },
    responseRate: { value: randomResponse + "%", change: responseChange, trend: getTrend(responseChange) }
  }
}

// ============================================================================
// CONFIGURATION DATA
// ============================================================================

export const assigneeConfig = {
  available: { 
    label: "Available", 
    color: "bg-success/10 text-success-foreground border-border-success"
  },
  unavailable: { 
    label: "Unavailable", 
    color: "bg-muted text-muted-foreground border-border-muted"
  }
};

// ============================================================================
// SEGMENTS DATA
// ============================================================================

export const mockSegments: Segment[] = [
  {
    id: "segment-1",
    name: "Contacts created <7 days ago",
    description: "Contacts that were created within the last 7 days",
    filters: [
      {
        field: "createdAt",
        operator: "isLessThanTime",
        value: 7, // 7 days
      },
    ],
    contactIds: [],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "segment-2",
    name: "Contacts inactive >30 days",
    description: "Contacts that haven't interacted in more than 30 days",
    filters: [
      {
        field: "lastInteractionTime",
        operator: "isGreaterThanTime",
        value: 30, // 30 days
      },
    ],
    contactIds: [],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "segment-3",
    name: "Contacts with tags",
    description: "Contacts that have at least one tag assigned",
    filters: [
      {
        field: "tags",
        operator: "isNotEmpty",
        value: "",
      },
    ],
    contactIds: [],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// ============================================================================
// SEGMENT UTILITIES
// ============================================================================

/**
 * Checks if a contact matches a segment filter
 */
export function contactMatchesFilter(contact: Contact, filter: SegmentFilter): boolean {
  const { field, operator, value } = filter;

  switch (field) {
    case 'countryISO':
      if (operator === 'equals' && typeof value === 'string') {
        return contact.countryISO === value;
      }
      if (operator === 'notEquals' && typeof value === 'string') {
        return contact.countryISO !== value;
      }
      if (operator === 'in' && Array.isArray(value)) {
        return value.some(v => typeof v === 'string' && v === contact.countryISO);
      }
      if (operator === 'notIn' && Array.isArray(value)) {
        return !value.some(v => typeof v === 'string' && v === contact.countryISO);
      }
      if (operator === 'hasAnyOf' && Array.isArray(value)) {
        return value.some(v => typeof v === 'string' && v === contact.countryISO);
      }
      return false;

    case 'tags':
      if (operator === 'equals' && typeof value === 'string') {
        return contact.tags.includes(value);
      }
      if (operator === 'notEquals' && typeof value === 'string') {
        return !contact.tags.includes(value);
      }
      if (operator === 'contains' && typeof value === 'string') {
        return contact.tags.includes(value);
      }
      if (operator === 'notContains' && typeof value === 'string') {
        return !contact.tags.includes(value);
      }
      if (operator === 'in' && Array.isArray(value)) {
        return value.some(tag => typeof tag === 'string' && contact.tags.includes(tag));
      }
      if (operator === 'notIn' && Array.isArray(value)) {
        return !value.some(tag => typeof tag === 'string' && contact.tags.includes(tag));
      }
      if (operator === 'hasAnyOf' && Array.isArray(value)) {
        return value.some(tag => typeof tag === 'string' && contact.tags.includes(tag));
      }
      if (operator === 'hasAllOf' && Array.isArray(value)) {
        return value.every(tag => typeof tag === 'string' && contact.tags.includes(tag));
      }
      if (operator === 'hasNoneOf' && Array.isArray(value)) {
        return !value.some(tag => typeof tag === 'string' && contact.tags.includes(tag));
      }
      if (operator === 'isEmpty') {
        return contact.tags.length === 0;
      }
      if (operator === 'isNotEmpty') {
        return contact.tags.length > 0;
      }
      return false;

    case 'channel':
      if (operator === 'exists') {
        return !!contact.channel;
      }
      if (operator === 'doesNotExist') {
        return !contact.channel;
      }
      if (operator === 'equals' && typeof value === 'string') {
        return contact.channel === value;
      }
      if (operator === 'notEquals' && typeof value === 'string') {
        return contact.channel !== value;
      }
      if (operator === 'in' && Array.isArray(value)) {
        return value.some(v => typeof v === 'string' && v === contact.channel);
      }
      if (operator === 'notIn' && Array.isArray(value)) {
        return !value.some(v => typeof v === 'string' && v === contact.channel);
      }
      if (operator === 'hasAnyOf' && Array.isArray(value)) {
        return value.some(v => typeof v === 'string' && v === contact.channel);
      }
      if (operator === 'hasAllOf' && Array.isArray(value)) {
        return value.every(v => typeof v === 'string' && v === contact.channel);
      }
      if (operator === 'hasNoneOf' && Array.isArray(value)) {
        return !value.some(v => typeof v === 'string' && v === contact.channel);
      }
      return false;

    case 'conversationStatus':
      if (operator === 'equals' && typeof value === 'string') {
        return contact.conversationStatus === value;
      }
      if (operator === 'notEquals' && typeof value === 'string') {
        return contact.conversationStatus !== value;
      }
      if (operator === 'in' && Array.isArray(value)) {
        return value.some(v => typeof v === 'string' && v === contact.conversationStatus);
      }
      if (operator === 'notIn' && Array.isArray(value)) {
        return !value.some(v => typeof v === 'string' && v === contact.conversationStatus);
      }
      if (operator === 'hasAnyOf' && Array.isArray(value)) {
        return value.some(v => typeof v === 'string' && v === contact.conversationStatus);
      }
      return false;

    // Date/time fields - actual implementations
    case 'createdAt':
      if (!contact.createdAt) return false;
      if (operator === 'exists') {
        return !!contact.createdAt;
      }
      if (operator === 'doesNotExist') {
        return !contact.createdAt;
      }
      if (operator === 'isLessThanTime' && typeof value === 'number') {
        // Check if contact was created less than X days ago
        const daysSinceCreation = Math.floor((Date.now() - contact.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceCreation < value;
      }
      if (operator === 'isGreaterThanTime' && typeof value === 'number') {
        // Check if contact was created more than X days ago
        const daysSinceCreation = Math.floor((Date.now() - contact.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceCreation > value;
      }
      return false;

    case 'lastInteractionTime':
    case 'timeSinceLastIncomingMessage':
      const interactionDate = contact.lastInteractionTime;
      if (!interactionDate) {
        // If no interaction date, only match "doesNotExist" or "isEmpty"
        return operator === 'doesNotExist' || operator === 'isEmpty';
      }
      if (operator === 'exists') {
        return !!interactionDate;
      }
      if (operator === 'doesNotExist') {
        return !interactionDate;
      }
      if (operator === 'isGreaterThanTime' && typeof value === 'number') {
        // Check if last interaction was more than X days ago (inactive)
        const daysSinceInteraction = Math.floor((Date.now() - interactionDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceInteraction > value;
      }
      if (operator === 'isLessThanTime' && typeof value === 'number') {
        // Check if last interaction was less than X days ago (active)
        const daysSinceInteraction = Math.floor((Date.now() - interactionDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceInteraction < value;
      }
      return false;

    case 'conversationOpenedTime':
      // Placeholder for conversationOpenedTime - not implemented in Contact type yet
      if (operator === 'exists') {
        return true;
      }
      if (operator === 'doesNotExist') {
        return false;
      }
      return false;

    default:
      return false;
  }
}

/**
 * Checks if a contact matches all filters in a segment
 */
export function contactMatchesSegment(contact: Contact, segment: Segment): boolean {
  if (segment.filters.length === 0) {
    return false; // Segment with no filters matches nothing
  }

  return segment.filters.every(filter => contactMatchesFilter(contact, filter));
}

/**
 * Finds all contacts that match a segment's filters
 */
export function getContactsForSegment(contacts: Contact[], segment: Segment): Contact[] {
  return contacts.filter(contact => contactMatchesSegment(contact, segment));
}

/**
 * Updates segment's contact IDs based on current contacts
 */
export function updateSegmentContacts(segment: Segment, contacts: Contact[]): Segment {
  const matchingContacts = getContactsForSegment(contacts, segment);
  return {
    ...segment,
    contactIds: matchingContacts.map(c => c.id),
    updatedAt: new Date()
  };
}

// ============================================================================
// WHATSAPP TEMPLATES DATA
// ============================================================================

export type WhatsAppTemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION";

export type WhatsAppTemplateComponentType = "HEADER" | "BODY" | "FOOTER" | "BUTTONS";

export type WhatsAppButtonType = "QUICK_REPLY" | "URL" | "PHONE_NUMBER";

export type WhatsAppMediaType = "IMAGE" | "VIDEO" | "DOCUMENT";

export interface WhatsAppTemplateVariable {
  name: string;
  example: string;
  required: boolean;
}

export interface WhatsAppTemplateButton {
  type: WhatsAppButtonType;
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface WhatsAppTemplateComponent {
  type: WhatsAppTemplateComponentType;
  format?: WhatsAppMediaType;
  text?: string;
  example?: {
    header_handle?: string[];
    body_text?: string[][];
  };
  buttons?: WhatsAppTemplateButton[];
  variables?: WhatsAppTemplateVariable[];
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: WhatsAppTemplateCategory;
  language: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  components: WhatsAppTemplateComponent[];
  description?: string;
  createdAt: Date;
}

export const mockWhatsAppTemplates: WhatsAppTemplate[] = [
  // TEXT Templates
  {
    id: "template-text-1",
    name: "welcome_message",
    category: "UTILITY",
    language: "en",
    status: "APPROVED",
    description: "Welcome new users to your service",
    components: [
      {
        type: "BODY",
        text: "Hello {{1}}, welcome to {{2}}! We're excited to have you on board.",
        example: {
          body_text: [["John", "Acme Corp"]]
        },
        variables: [
          { name: "1", example: "John", required: true },
          { name: "2", example: "Acme Corp", required: true }
        ]
      },
      {
        type: "FOOTER",
        text: "Thank you for choosing us!"
      }
    ],
    createdAt: new Date("2024-01-15")
  },
  {
    id: "template-text-2",
    name: "order_confirmation",
    category: "UTILITY",
    language: "en",
    status: "APPROVED",
    description: "Confirm order placement",
    components: [
      {
        type: "BODY",
        text: "Hi {{1}}, your order #{{2}} has been confirmed! Total: {{3}}. Expected delivery: {{4}}.",
        example: {
          body_text: [["Sarah", "ORD-12345", "$99.99", "Jan 25, 2024"]]
        },
        variables: [
          { name: "1", example: "Sarah", required: true },
          { name: "2", example: "ORD-12345", required: true },
          { name: "3", example: "$99.99", required: true },
          { name: "4", example: "Jan 25, 2024", required: true }
        ]
      }
    ],
    createdAt: new Date("2024-01-20")
  },
  {
    id: "template-text-3",
    name: "appointment_reminder",
    category: "UTILITY",
    language: "en",
    status: "APPROVED",
    description: "Remind customers about appointments",
    components: [
      {
        type: "BODY",
        text: "Reminder: You have an appointment with {{1}} on {{2}} at {{3}}. Please arrive 10 minutes early.",
        example: {
          body_text: [["Dr. Smith", "Jan 30, 2024", "2:00 PM"]]
        },
        variables: [
          { name: "1", example: "Dr. Smith", required: true },
          { name: "2", example: "Jan 30, 2024", required: true },
          { name: "3", example: "2:00 PM", required: true }
        ]
      }
    ],
    createdAt: new Date("2024-02-01")
  },
  
  // MEDIA Templates (Image)
  {
    id: "template-media-1",
    name: "product_announcement",
    category: "MARKETING",
    language: "en",
    status: "APPROVED",
    description: "Announce new products with image",
    components: [
      {
        type: "HEADER",
        format: "IMAGE",
        example: {
          header_handle: ["image_url_here"]
        }
      },
      {
        type: "BODY",
        text: "🎉 Introducing {{1}}! Get {{2}} off your first purchase. Use code: {{3}}",
        example: {
          body_text: [["New Collection", "20%", "NEW20"]]
        },
        variables: [
          { name: "1", example: "New Collection", required: true },
          { name: "2", example: "20%", required: true },
          { name: "3", example: "NEW20", required: true }
        ]
      },
      {
        type: "FOOTER",
        text: "Shop now and save!"
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "View Products",
            url: "https://example.com/products"
          },
          {
            type: "QUICK_REPLY",
            text: "Get Help"
          }
        ]
      }
    ],
    createdAt: new Date("2024-02-10")
  },
  {
    id: "template-media-2",
    name: "shipping_update",
    category: "UTILITY",
    language: "en",
    status: "APPROVED",
    description: "Update customers on shipping status with tracking image",
    components: [
      {
        type: "HEADER",
        format: "IMAGE",
        example: {
          header_handle: ["tracking_qr_code_url"]
        }
      },
      {
        type: "BODY",
        text: "Your order #{{1}} is on the way! Track your package: {{2}}",
        example: {
          body_text: [["ORD-12345", "TRACK-789"]]
        },
        variables: [
          { name: "1", example: "ORD-12345", required: true },
          { name: "2", example: "TRACK-789", required: true }
        ]
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "Track Package",
            url: "https://example.com/track/{{1}}"
          }
        ]
      }
    ],
    createdAt: new Date("2024-02-15")
  },
  
  // MEDIA Templates (Video)
  {
    id: "template-media-3",
    name: "tutorial_video",
    category: "UTILITY",
    language: "en",
    status: "APPROVED",
    description: "Share tutorial videos with customers",
    components: [
      {
        type: "HEADER",
        format: "VIDEO",
        example: {
          header_handle: ["video_url_here"]
        }
      },
      {
        type: "BODY",
        text: "Check out this tutorial on {{1}}. Learn how to {{2}} in just {{3}} minutes!",
        example: {
          body_text: [["Using Our App", "get started", "5"]]
        },
        variables: [
          { name: "1", example: "Using Our App", required: true },
          { name: "2", example: "get started", required: true },
          { name: "3", example: "5", required: true }
        ]
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "Watch Tutorial",
            url: "https://example.com/tutorials"
          }
        ]
      }
    ],
    createdAt: new Date("2024-02-20")
  },
  
  // MEDIA Templates (Document)
  {
    id: "template-media-4",
    name: "invoice_delivery",
    category: "UTILITY",
    language: "en",
    status: "APPROVED",
    description: "Send invoices as documents",
    components: [
      {
        type: "HEADER",
        format: "DOCUMENT",
        example: {
          header_handle: ["invoice_pdf_url"]
        }
      },
      {
        type: "BODY",
        text: "Your invoice for order #{{1}} is ready. Amount: {{2}}. Due date: {{3}}.",
        example: {
          body_text: [["ORD-12345", "$199.99", "Feb 15, 2024"]]
        },
        variables: [
          { name: "1", example: "ORD-12345", required: true },
          { name: "2", example: "$199.99", required: true },
          { name: "3", example: "Feb 15, 2024", required: true }
        ]
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "Pay Now",
            url: "https://example.com/pay/{{1}}"
          }
        ]
      }
    ],
    createdAt: new Date("2024-02-25")
  },
  
  // INTERACTIVE Templates with Buttons
  {
    id: "template-interactive-1",
    name: "promotional_offer",
    category: "MARKETING",
    language: "en",
    status: "APPROVED",
    description: "Promotional offers with interactive buttons",
    components: [
      {
        type: "BODY",
        text: "🎁 Special offer for {{1}}! Get {{2}} off on all items. Valid until {{3}}.",
        example: {
          body_text: [["Valued Customer", "30%", "Feb 29, 2024"]]
        },
        variables: [
          { name: "1", example: "Valued Customer", required: true },
          { name: "2", example: "30%", required: true },
          { name: "3", example: "Feb 29, 2024", required: true }
        ]
      },
      {
        type: "FOOTER",
        text: "Use code: SAVE30"
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "Shop Now",
            url: "https://example.com/sale"
          },
          {
            type: "QUICK_REPLY",
            text: "View Catalog"
          },
          {
            type: "QUICK_REPLY",
            text: "Contact Support"
          }
        ]
      }
    ],
    createdAt: new Date("2024-03-01")
  },
  {
    id: "template-interactive-2",
    name: "event_invitation",
    category: "MARKETING",
    language: "en",
    status: "APPROVED",
    description: "Invite customers to events",
    components: [
      {
        type: "BODY",
        text: "You're invited! Join us for {{1}} on {{2}} at {{3}}. We'd love to see you there!",
        example: {
          body_text: [["Product Launch Event", "March 15, 2024", "6:00 PM"]]
        },
        variables: [
          { name: "1", example: "Product Launch Event", required: true },
          { name: "2", example: "March 15, 2024", required: true },
          { name: "3", example: "6:00 PM", required: true }
        ]
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "RSVP Now",
            url: "https://example.com/rsvp"
          },
          {
            type: "PHONE_NUMBER",
            text: "Call Us",
            phoneNumber: "+1234567890"
          }
        ]
      }
    ],
    createdAt: new Date("2024-03-05")
  },
  
  // AUTHENTICATION Templates
  {
    id: "template-auth-1",
    name: "otp_verification",
    category: "AUTHENTICATION",
    language: "en",
    status: "APPROVED",
    description: "Send OTP codes for verification",
    components: [
      {
        type: "BODY",
        text: "Your verification code is {{1}}. Valid for {{2}} minutes. Do not share this code with anyone.",
        example: {
          body_text: [["123456", "10"]]
        },
        variables: [
          { name: "1", example: "123456", required: true },
          { name: "2", example: "10", required: true }
        ]
      },
      {
        type: "FOOTER",
        text: "This is an automated message."
      }
    ],
    createdAt: new Date("2024-03-10")
  },
  {
    id: "template-auth-2",
    name: "password_reset",
    category: "AUTHENTICATION",
    language: "en",
    status: "APPROVED",
    description: "Password reset confirmation",
    components: [
      {
        type: "BODY",
        text: "Hi {{1}}, we received a request to reset your password. Click the link below to reset. If you didn't request this, please ignore this message.",
        example: {
          body_text: [["John"]]
        },
        variables: [
          { name: "1", example: "John", required: true }
        ]
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "Reset Password",
            url: "https://example.com/reset/{{1}}"
          }
        ]
      }
    ],
    createdAt: new Date("2024-03-12")
  },
  
  // Complex Templates with Multiple Components
  {
    id: "template-complex-1",
    name: "newsletter_announcement",
    category: "MARKETING",
    language: "en",
    status: "APPROVED",
    description: "Newsletter with image and multiple buttons",
    components: [
      {
        type: "HEADER",
        format: "IMAGE",
        example: {
          header_handle: ["newsletter_image_url"]
        }
      },
      {
        type: "BODY",
        text: "📰 {{1}} Newsletter - {{2}}\n\n{{3}}\n\nRead the full article to learn more!",
        example: {
          body_text: [["Monthly", "March 2024", "This month's highlights include new features and exciting updates."]]
        },
        variables: [
          { name: "1", example: "Monthly", required: true },
          { name: "2", example: "March 2024", required: true },
          { name: "3", example: "This month's highlights include new features and exciting updates.", required: true }
        ]
      },
      {
        type: "FOOTER",
        text: "Stay connected with us!"
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "Read Article",
            url: "https://example.com/newsletter/{{2}}"
          },
          {
            type: "URL",
            text: "Subscribe",
            url: "https://example.com/subscribe"
          },
          {
            type: "QUICK_REPLY",
            text: "Unsubscribe"
          }
        ]
      }
    ],
    createdAt: new Date("2024-03-15")
  },
  
  // Simple Text Only
  {
    id: "template-simple-1",
    name: "simple_notification",
    category: "UTILITY",
    language: "en",
    status: "APPROVED",
    description: "Simple text notification",
    components: [
      {
        type: "BODY",
        text: "Hello {{1}}, this is a notification from {{2}}. {{3}}",
        example: {
          body_text: [["Customer", "Acme Corp", "Your request has been processed."]]
        },
        variables: [
          { name: "1", example: "Customer", required: true },
          { name: "2", example: "Acme Corp", required: true },
          { name: "3", example: "Your request has been processed.", required: true }
        ]
      }
    ],
    createdAt: new Date("2024-03-20")
  }
];
