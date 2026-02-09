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
    LogOut,
} from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { integrations, ThirdPartyIntegration, SyncHistory } from "./contacts-import-dialog"

interface ContactsImportDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialIntegrationId?: string | null
}

export function ContactsImportDrawer({
    open,
    onOpenChange,
    initialIntegrationId
}: ContactsImportDrawerProps) {
    const [selectedIntegration, setSelectedIntegration] = React.useState<ThirdPartyIntegration | null>(null)
    const [isConnecting, setIsConnecting] = React.useState(false)
    const [isApiMode, setIsApiMode] = React.useState(false)
    const [apiKey, setApiKey] = React.useState("")
    const [isSyncing, setIsSyncing] = React.useState(false)
    const [connectedIntegrations, setConnectedIntegrations] = React.useState<Record<string, ThirdPartyIntegration>>({})

    // Reset state when opening/closing or changing initial ID
    React.useEffect(() => {
        if (open) {
            if (initialIntegrationId) {
                // If we have an initial ID, select that integration immediately
                const integration = integrations.find(i => i.id === initialIntegrationId)
                if (integration) {
                    const connectedData = connectedIntegrations[integration.id]
                    setSelectedIntegration(connectedData || integration)
                }
            } else {
                setSelectedIntegration(null)
            }
        }
    }, [open, initialIntegrationId, connectedIntegrations])

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

    const handleApiConnect = async () => {
        if (!apiKey.trim()) return
        setIsConnecting(true)

        // Mock API connection logic
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsConnecting(false)
        setIsApiMode(false)
        setApiKey("")

        // For demo: handle success
        if (selectedIntegration) {
            handleConnect(selectedIntegration.id)
        }
    }

    const handleDisconnect = async (integrationId: string) => {
        setIsSyncing(true)
        // Simulate disconnect process
        await new Promise(resolve => setTimeout(resolve, 1000))

        setConnectedIntegrations(prev => {
            const next = { ...prev }
            delete next[integrationId]
            return next
        })

        const integration = integrations.find(i => i.id === integrationId)
        if (integration) {
            setSelectedIntegration(integration)
        }

        setIsSyncing(false)
    }

    const handleBack = () => {
        // If we were opened with an initial ID, closing the detail view should essentially close the drawer or go back to list?
        // The user requirement implies clicking a method opens the drawer. If they go back, should they see the list?
        // "show right side drawer" implies the drawer is for that specific integration.
        // However, keeping the list view accessible seems robust.
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
                return "bg-success/10 text-success border-success/20"
            case "failed":
                return "bg-error/10 text-error border-error/20"
            case "partial":
                return "bg-warning/10 text-warning border-warning/20"
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col overflow-hidden p-0">
                <div className="p-4 pb-0">
                    <SheetHeader className="pb-4">
                        {selectedIntegration ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center overflow-hidden flex-shrink-0">
                                    <img
                                        src={selectedIntegration.logo}
                                        alt={selectedIntegration.name}
                                        className="w-6 h-6 object-contain"
                                    />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <SheetTitle className="flex items-center gap-2 text-base">
                                        {selectedIntegration.name}
                                        {selectedIntegration.connected && (
                                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Connected
                                            </Badge>
                                        )}
                                    </SheetTitle>
                                    <SheetDescription className="truncate text-xs">
                                        {selectedIntegration.description}
                                    </SheetDescription>
                                </div>
                            </div>
                        ) : (
                            <>
                                <SheetTitle>Import from 3rd Party</SheetTitle>
                                <SheetDescription>
                                    Connect your favorite tools to sync contacts automatically
                                </SheetDescription>
                            </>
                        )}
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto px-4">
                    <div className="flex flex-col h-full min-h-0">
                        {selectedIntegration ? (
                            // Integration Detail View
                            <div className={cn("space-y-6 flex-1", !selectedIntegration.connected && "flex flex-col items-center justify-center")}>
                                {selectedIntegration.connected ? (
                                    <>
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-lg border bg-card/50">
                                                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                                    <Users className="w-3 h-3" />
                                                    Total Contacts
                                                </div>
                                                <div className="text-xl font-semibold">
                                                    {selectedIntegration.totalContacts?.toLocaleString() || 0}
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-lg border bg-card/50">
                                                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                                    <Clock className="w-3 h-3" />
                                                    Last Sync
                                                </div>
                                                <div className="text-md font-semibold">
                                                    {selectedIntegration.lastSync ? formatDate(selectedIntegration.lastSync) : "Never"}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-4">
                                            <Button
                                                className="w-full gap-2"
                                                onClick={handleSync}
                                                disabled={isSyncing}
                                            >
                                                {isSyncing ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Syncing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <RefreshCw className="w-4 h-4" />
                                                        Sync Now
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* Sync History */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Sync History
                                            </h3>
                                            <div className="space-y-2">
                                                {selectedIntegration.syncHistory && selectedIntegration.syncHistory.length > 0 ? (
                                                    selectedIntegration.syncHistory.map((history) => (
                                                        <div
                                                            key={history.id}
                                                            className="p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn(
                                                                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                                                        history.status === "success" ? "bg-success/10 text-success" :
                                                                            history.status === "failed" ? "bg-error/10 text-error" :
                                                                                "bg-warning/10 text-warning"
                                                                    )}>
                                                                        {history.status === "success" ? (
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                        ) : history.status === "failed" ? (
                                                                            <AlertCircle className="w-4 h-4" />
                                                                        ) : (
                                                                            <AlertCircle className="w-4 h-4" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-medium">
                                                                            {history.contactsImported.toLocaleString()} contacts
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {formatDate(history.date)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn("capitalize text-xs", getStatusColor(history.status))}
                                                                >
                                                                    {history.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                                                        No sync history yet
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // Not Connected View
                                    <div className="flex flex-col items-center justify-center text-center -mt-20">
                                        <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6 ring-8 ring-primary/5">
                                            <Cloud className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">
                                            Connect {selectedIntegration.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto leading-relaxed">
                                            Authorize Cequens to access your {selectedIntegration.name} contacts and keep them in sync automatically.
                                        </p>

                                        <div className="flex flex-col items-center w-full max-w-xs gap-3">
                                            {isApiMode ? (
                                                <div className="w-full space-y-4">
                                                    <div className="space-y-2 text-left">
                                                        <label className="text-xs font-medium text-muted-foreground ml-1 block">
                                                            API Key
                                                        </label>
                                                        <Input
                                                            placeholder="Paste your API key here..."
                                                            value={apiKey}
                                                            onChange={(e) => setApiKey(e.target.value)}
                                                            className="h-10"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Button
                                                            onClick={handleApiConnect}
                                                            disabled={isConnecting || !apiKey.trim()}
                                                            className="w-full"
                                                        >
                                                            {isConnecting ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                    Connecting...
                                                                </div>
                                                            ) : (
                                                                "Connect"
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="link"
                                                            className="w-full"
                                                            onClick={() => setIsApiMode(false)}
                                                        >
                                                            Back
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Button
                                                        onClick={() => handleConnect(selectedIntegration.id)}
                                                        disabled={isConnecting}
                                                        className="w-full"
                                                    >
                                                        {isConnecting ? (
                                                            <div className="flex items-center gap-2">
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                Connecting...
                                                            </div>
                                                        ) : (
                                                            `Sign in with ${selectedIntegration.name}`
                                                        )}
                                                    </Button>

                                                    <Button
                                                        variant="link"
                                                        className="w-full"
                                                        onClick={() => setIsApiMode(true)}
                                                    >
                                                        Connect with APIs
                                                    </Button>
                                                </>
                                            )}
                                        </div>
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
                                                "hover:border-primary/50 hover:bg-accent/50 transition-all duration-200",
                                                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                                "group relative overflow-hidden"
                                            )}
                                        >
                                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-background border flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-200">
                                                <img
                                                    src={integration.logo}
                                                    alt={integration.name}
                                                    className="w-7 h-7 object-contain"
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
                                                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] gap-1 bg-success/10 text-success hover:bg-success/20 border-success/20">
                                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                                            Connected
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground truncate group-hover:text-foreground transition-colors">
                                                    {integration.description}
                                                </div>
                                            </div>
                                            <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                                <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sticky Bottom Footer Section */}
                {selectedIntegration && (
                    <div className="p-4 text-center">
                        {selectedIntegration.connected ? (
                            <Button
                                variant="link"
                                className="text-destructive hover:text-destructive/80 p-0 font-medium"
                                onClick={() => handleDisconnect(selectedIntegration.id)}
                                disabled={isSyncing}
                            >
                                Disconnect {selectedIntegration.name}
                            </Button>
                        ) : (
                            <p className="text-[11px] text-muted-foreground text-center mx-auto max-w-[240px] leading-relaxed">
                                By connecting, you agree to our <span className="underline cursor-pointer hover:text-foreground transition-colors">Terms of Service</span> and <span className="underline cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span>.
                            </p>
                        )}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
