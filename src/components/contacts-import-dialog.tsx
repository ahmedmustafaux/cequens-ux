import * as React from "react"
import { 
  Cloud, 
  CheckCircle2,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Users,
  Calendar,
  Clock,
  Download,
  Upload,
  Settings,
  Zap,
  Filter,
  Tag,
  FileText,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SyncHistory {
  id: string
  date: string
  contactsImported: number
  status: "success" | "failed" | "partial"
}

interface ThirdPartyIntegration {
  id: string
  name: string
  description: string
  logo: string
  connected: boolean
  lastSync?: string
  totalContacts?: number
  syncHistory?: SyncHistory[]
}

const integrations: ThirdPartyIntegration[] = [
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Sync contacts from your HubSpot CRM",
    logo: "https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png",
    connected: false,
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect with 5,000+ apps via Zapier",
    logo: "https://cdn.zapier.com/zapier/images/logos/zapier-logomark.png",
    connected: false,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Import contacts from Salesforce CRM",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
    connected: false,
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Sync customers from your Shopify store",
    logo: "https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-primary-logo-456baa801ee66a0a435671082365958316831c9960c480451dd0330bcdae304f.svg",
    connected: false,
  },
]

interface ContactsImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactsImportDialog({ 
  open, 
  onOpenChange 
}: ContactsImportDialogProps) {
  const [selectedIntegration, setSelectedIntegration] = React.useState<ThirdPartyIntegration | null>(null)
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [connectedIntegrations, setConnectedIntegrations] = React.useState<Record<string, ThirdPartyIntegration>>({})

  const handleIntegrationClick = (integration: ThirdPartyIntegration) => {
    const connectedData = connectedIntegrations[integration.id]
    if (connectedData) {
      setSelectedIntegration(connectedData)
    } else {
      setSelectedIntegration(integration)
    }
  }

  const handleConnect = async (integrationId: string) => {
    setIsConnecting(true)

    // Simulate OAuth connection process
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock connected integration data
    const mockConnectedData: ThirdPartyIntegration = {
      ...integrations.find(i => i.id === integrationId)!,
      connected: true,
      lastSync: new Date().toISOString(),
      totalContacts: 1247,
      syncHistory: [
        {
          id: "1",
          date: new Date().toISOString(),
          contactsImported: 1247,
          status: "success"
        },
        {
          id: "2",
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          contactsImported: 1180,
          status: "success"
        },
        {
          id: "3",
          date: new Date(Date.now() - 86400000 * 5).toISOString(),
          contactsImported: 1050,
          status: "partial"
        }
      ]
    }

    setConnectedIntegrations(prev => ({
      ...prev,
      [integrationId]: mockConnectedData
    }))

    setSelectedIntegration(mockConnectedData)
    setIsConnecting(false)
  }

  const handleSync = async () => {
    if (!selectedIntegration) return
    
    setIsSyncing(true)
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update sync history
    const newHistory: SyncHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      contactsImported: Math.floor(Math.random() * 100) + (selectedIntegration.totalContacts || 0),
      status: "success"
    }

    const updatedIntegration = {
      ...selectedIntegration,
      lastSync: new Date().toISOString(),
      totalContacts: newHistory.contactsImported,
      syncHistory: [newHistory, ...(selectedIntegration.syncHistory || [])]
    }

    setConnectedIntegrations(prev => ({
      ...prev,
      [selectedIntegration.id]: updatedIntegration
    }))

    setSelectedIntegration(updatedIntegration)
    setIsSyncing(false)
  }

  const handleBack = () => {
    setSelectedIntegration(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }

  const getStatusColor = (status: SyncHistory["status"]) => {
    switch (status) {
      case "success":
        return "bg-success/10 text-success-foreground"
      case "failed":
        return "bg-destructive/10 text-destructive-foreground"
      case "partial":
        return "bg-warning/10 text-warning-foreground"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "max-h-[85vh] overflow-hidden flex flex-col gap-2",
          selectedIntegration?.connected ? "max-w-5xl" : "max-w-2xl"
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          {selectedIntegration ? (
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img 
                    src={selectedIntegration.logo} 
                    alt={selectedIntegration.name}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="flex items-center gap-2">
                    {selectedIntegration.name}
                    {selectedIntegration.connected && (
                      <Badge variant="outline" className="bg-success/10 text-success-foreground border-border-success">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription className="truncate">
                    {selectedIntegration.description}
                  </DialogDescription>
                </div>
              </div>
            </div>
          ) : (
            <>
              <DialogTitle>Import from 3rd Party</DialogTitle>
              <DialogDescription>
                Connect your favorite tools to sync contacts automatically
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        <div className="flex-1 px-6 pb-6">
          {selectedIntegration ? (
            // Integration Detail View
            <div className="space-y-6">
              {selectedIntegration.connected ? (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Users className="w-4 h-4" />
                        Total Contacts
                      </div>
                      <div className="text-2xl font-semibold">
                        {selectedIntegration.totalContacts?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Clock className="w-4 h-4" />
                        Last Sync
                      </div>
                      <div className="text-lg font-semibold">
                        {selectedIntegration.lastSync ? formatDate(selectedIntegration.lastSync) : "Never"}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <TrendingUp className="w-4 h-4" />
                        Growth
                      </div>
                      <div className="text-2xl font-semibold text-success-foreground">
                        +12%
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Zap className="w-4 h-4" />
                        Auto-Sync
                      </div>
                      <div className="text-lg font-semibold">
                        Daily
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {/* Left Column - Actions & Use Cases */}
                    <div className="col-span-2 space-y-6">
                      {/* Quick Actions */}
                      <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            variant="outline" 
                            className="justify-start gap-2 h-auto py-3"
                            onClick={handleSync}
                            disabled={isSyncing}
                          >
                            {isSyncing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <div className="text-left">
                                  <div className="font-medium">Syncing...</div>
                                  <div className="text-xs text-muted-foreground">Please wait</div>
                                </div>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4" />
                                <div className="text-left">
                                  <div className="font-medium">Sync Now</div>
                                  <div className="text-xs text-muted-foreground">Update contacts</div>
                                </div>
                              </>
                            )}
                          </Button>
                          <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                            <Download className="w-4 h-4" />
                            <div className="text-left">
                              <div className="font-medium">Export Data</div>
                              <div className="text-xs text-muted-foreground">Download CSV</div>
                            </div>
                          </Button>
                          <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                            <Filter className="w-4 h-4" />
                            <div className="text-left">
                              <div className="font-medium">Filter Sync</div>
                              <div className="text-xs text-muted-foreground">Set conditions</div>
                            </div>
                          </Button>
                          <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                            <Settings className="w-4 h-4" />
                            <div className="text-left">
                              <div className="font-medium">Configure</div>
                              <div className="text-xs text-muted-foreground">Sync settings</div>
                            </div>
                          </Button>
                        </div>
                      </div>

                      {/* Use Cases */}
                      <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Common Use Cases
                        </h3>
                        <div className="space-y-2">
                          <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Upload className="w-4 h-4 text-info-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">Automated Contact Import</div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  Automatically sync new contacts from {selectedIntegration.name} to your contact list daily
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Tag className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">Smart Segmentation</div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  Automatically tag and segment contacts based on {selectedIntegration.name} data
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <RefreshCw className="w-4 h-4 text-success-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">Two-Way Sync</div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  Keep contact information synchronized between both platforms
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Sync History */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Sync History
                        </h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                          {selectedIntegration.syncHistory && selectedIntegration.syncHistory.length > 0 ? (
                            selectedIntegration.syncHistory.map((history) => (
                              <div
                                key={history.id}
                                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                      {history.status === "success" ? (
                                        <CheckCircle2 className="w-3 h-3 text-success-foreground" />
                                      ) : history.status === "failed" ? (
                                        <AlertCircle className="w-3 h-3 text-destructive-foreground" />
                                      ) : (
                                        <AlertCircle className="w-3 h-3 text-warning-foreground" />
                                      )}
                                    </div>
                                    <Badge 
                                      variant="outline" 
                                      className={cn("capitalize text-xs", getStatusColor(history.status))}
                                    >
                                      {history.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-sm font-medium">
                                  {history.contactsImported.toLocaleString()} contacts
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {formatDate(history.date)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              No sync history yet
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Not Connected View
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Cloud className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Connect {selectedIntegration.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    Authorize Cequens to access your {selectedIntegration.name} contacts and keep them in sync automatically.
                  </p>
                  <Button 
                    onClick={() => handleConnect(selectedIntegration.id)}
                    disabled={isConnecting}
                    className="gap-2"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Connect {selectedIntegration.name}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Integration List View
            <div className="space-y-3">
              {integrations.map((integration) => {
                const isConnected = !!connectedIntegrations[integration.id]
                return (
                  <button
                    key={integration.id}
                    onClick={() => handleIntegrationClick(integration)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-lg border text-left cursor-pointer",
                      "hover:border-border-primary hover:bg-accent/50 transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    )}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-background border flex items-center justify-center overflow-hidden">
                      <img 
                        src={integration.logo} 
                        alt={integration.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const parent = e.currentTarget.parentElement
                          if (parent) {
                            const fallback = document.createElement('div')
                            fallback.className = 'w-8 h-8 rounded bg-primary/10 flex items-center justify-center'
                            fallback.innerHTML = '<div class="w-5 h-5 text-primary">?</div>'
                            parent.appendChild(fallback)
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium flex items-center gap-2">
                        {integration.name}
                        {isConnected && (
                          <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {integration.description}
                      </div>
                    </div>
                    <Badge variant={isConnected ? "default" : "outline"}>
                      {isConnected ? "Connected" : "Connect"}
                    </Badge>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}