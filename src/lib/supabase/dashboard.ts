import { supabase } from '../supabase'

export interface DashboardMetricsData {
  messagesSent: { value: string; change: string; trend: "up" | "down" };
  deliveryRate: { value: string; change: string; trend: "up" | "down" };
  activeSenders: { value: string; change: string; trend: "up" | "down" };
  responseRate: { value: string; change: string; trend: "up" | "down" };
}

/**
 * Calculate date range based on time range string
 */
function getDateRange(timeRange: string): { from: Date; to: Date } {
  const to = new Date()
  to.setHours(23, 59, 59, 999) // End of today
  
  const from = new Date()
  
  switch (timeRange) {
    case "7d":
      from.setDate(from.getDate() - 7)
      break
    case "30d":
      from.setDate(from.getDate() - 30)
      break
    case "90d":
      from.setDate(from.getDate() - 90)
      break
    default:
      from.setDate(from.getDate() - 30)
  }
  
  from.setHours(0, 0, 0, 0) // Start of day
  
  return { from, to }
}

/**
 * Get previous period date range for comparison
 */
function getPreviousPeriodDateRange(timeRange: string): { from: Date; to: Date } {
  const current = getDateRange(timeRange)
  const diffTime = current.to.getTime() - current.from.getTime()
  
  const to = new Date(current.from.getTime() - 1) // Day before current period starts
  to.setHours(23, 59, 59, 999)
  
  const from = new Date(to.getTime() - diffTime)
  from.setHours(0, 0, 0, 0)
  
  return { from, to }
}

/**
 * Fetch dashboard metrics from real database data
 */
export async function fetchDashboardMetrics(
  userId: string,
  timeRange: string
): Promise<DashboardMetricsData> {
  if (!userId) {
    throw new Error('userId is required to fetch dashboard metrics')
  }

  const { from: currentFrom, to: currentTo } = getDateRange(timeRange)
  const { from: previousFrom, to: previousTo } = getPreviousPeriodDateRange(timeRange)

  // Fetch campaigns for current period (only those that have been sent)
  const { data: currentCampaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .select('recipients, open_rate, click_rate, status, sent_date, type')
    .eq('user_id', userId)
    .in('status', ['Active', 'Completed'])
    .not('sent_date', 'is', null)
    .gte('sent_date', currentFrom.toISOString())
    .lte('sent_date', currentTo.toISOString())

  if (campaignsError) {
    console.error('Error fetching campaigns for metrics:', campaignsError)
    throw campaignsError
  }

  // Fetch campaigns for previous period (for trend calculation)
  const { data: previousCampaigns, error: prevCampaignsError } = await supabase
    .from('campaigns')
    .select('recipients, open_rate, click_rate, status, sent_date, type')
    .eq('user_id', userId)
    .in('status', ['Active', 'Completed'])
    .not('sent_date', 'is', null)
    .gte('sent_date', previousFrom.toISOString())
    .lte('sent_date', previousTo.toISOString())

  if (prevCampaignsError) {
    console.error('Error fetching previous campaigns for metrics:', prevCampaignsError)
    // Continue with empty previous data if error
  }

  // Fetch contacts for current period (for active senders and response rate)
  const { data: currentContacts, error: contactsError } = await supabase
    .from('contacts')
    .select('channel, last_interaction_time')
    .eq('user_id', userId)
    .not('channel', 'is', null)
    .gte('last_interaction_time', currentFrom.toISOString())
    .lte('last_interaction_time', currentTo.toISOString())

  if (contactsError) {
    console.error('Error fetching contacts for metrics:', contactsError)
    // Continue with empty contacts if error
  }

  // Fetch contacts for previous period
  const { data: previousContacts, error: prevContactsError } = await supabase
    .from('contacts')
    .select('channel, last_interaction_time')
    .eq('user_id', userId)
    .not('channel', 'is', null)
    .gte('last_interaction_time', previousFrom.toISOString())
    .lte('last_interaction_time', previousTo.toISOString())

  if (prevContactsError) {
    console.error('Error fetching previous contacts for metrics:', prevContactsError)
  }

  // Calculate Messages Sent (sum of recipients from campaigns)
  const currentMessagesSent = (currentCampaigns || []).reduce(
    (sum, campaign) => sum + (campaign.recipients || 0),
    0
  )
  const previousMessagesSent = (previousCampaigns || []).reduce(
    (sum, campaign) => sum + (campaign.recipients || 0),
    0
  )

  // Calculate Delivery Rate (weighted average of open_rate by recipients)
  let currentDeliveryRate = 0
  let totalRecipientsForDelivery = 0
  
  if (currentCampaigns && currentCampaigns.length > 0) {
    currentCampaigns.forEach(campaign => {
      const recipients = campaign.recipients || 0
      const openRate = campaign.open_rate || 0
      if (recipients > 0 && openRate > 0) {
        totalRecipientsForDelivery += recipients
        currentDeliveryRate += openRate * recipients
      }
    })
    if (totalRecipientsForDelivery > 0) {
      currentDeliveryRate = currentDeliveryRate / totalRecipientsForDelivery
    }
  }

  let previousDeliveryRate = 0
  let prevTotalRecipientsForDelivery = 0
  
  if (previousCampaigns && previousCampaigns.length > 0) {
    previousCampaigns.forEach(campaign => {
      const recipients = campaign.recipients || 0
      const openRate = campaign.open_rate || 0
      if (recipients > 0 && openRate > 0) {
        prevTotalRecipientsForDelivery += recipients
        previousDeliveryRate += openRate * recipients
      }
    })
    if (prevTotalRecipientsForDelivery > 0) {
      previousDeliveryRate = previousDeliveryRate / prevTotalRecipientsForDelivery
    }
  }

  // Calculate Active Senders (unique channels from contacts)
  const currentUniqueChannels = new Set(
    (currentContacts || [])
      .map(contact => contact.channel)
      .filter((channel): channel is string => !!channel)
  )
  const currentActiveSenders = currentUniqueChannels.size

  const previousUniqueChannels = new Set(
    (previousContacts || [])
      .map(contact => contact.channel)
      .filter((channel): channel is string => !!channel)
  )
  const previousActiveSenders = previousUniqueChannels.size

  // Calculate Response Rate (percentage of contacts that have interacted)
  // First, get total contacts in the period
  const { count: totalContactsCount } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', currentFrom.toISOString())
    .lte('created_at', currentTo.toISOString())

  const totalContacts = totalContactsCount || 0
  const contactsWithInteractions = (currentContacts || []).length
  const currentResponseRate = totalContacts > 0 
    ? (contactsWithInteractions / totalContacts) * 100 
    : 0

  // Previous period response rate
  const { count: prevTotalContactsCount } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', previousFrom.toISOString())
    .lte('created_at', previousTo.toISOString())

  const prevTotalContacts = prevTotalContactsCount || 0
  const prevContactsWithInteractions = (previousContacts || []).length
  const previousResponseRate = prevTotalContacts > 0 
    ? (prevContactsWithInteractions / prevTotalContacts) * 100 
    : 0

  // Calculate percentage changes and trends
  const calculateChange = (current: number, previous: number): { change: string; trend: "up" | "down" } => {
    if (previous === 0) {
      if (current === 0) {
        return { change: "0%", trend: "up" }
      }
      return { change: "+100%", trend: "up" }
    }
    
    const changePercent = ((current - previous) / previous) * 100
    const changeFormatted = changePercent.toFixed(1)
    const sign = changePercent >= 0 ? "+" : ""
    
    return {
      change: `${sign}${changeFormatted}%`,
      trend: changePercent >= 0 ? "up" : "down"
    }
  }

  const messagesChange = calculateChange(currentMessagesSent, previousMessagesSent)
  const deliveryChange = calculateChange(currentDeliveryRate, previousDeliveryRate)
  const sendersChange = calculateChange(currentActiveSenders, previousActiveSenders)
  const responseChange = calculateChange(currentResponseRate, previousResponseRate)

  return {
    messagesSent: {
      value: currentMessagesSent.toLocaleString(),
      change: messagesChange.change,
      trend: messagesChange.trend
    },
    deliveryRate: {
      value: currentDeliveryRate > 0 ? `${currentDeliveryRate.toFixed(1)}%` : "0%",
      change: deliveryChange.change,
      trend: deliveryChange.trend
    },
    activeSenders: {
      value: currentActiveSenders.toLocaleString(),
      change: sendersChange.change,
      trend: sendersChange.trend
    },
    responseRate: {
      value: currentResponseRate > 0 ? `${currentResponseRate.toFixed(1)}%` : "0%",
      change: responseChange.change,
      trend: responseChange.trend
    }
  }
}
