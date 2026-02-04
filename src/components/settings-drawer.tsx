import * as React from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    User,
    Building2,
    Users,
    Shield,
    Plug,
    CreditCard,
    Receipt,
    HelpCircle,
    FileText,
    Search,
    Bell,
    Globe,
    Lock,
    Database,
    Settings,
    X,
    Check,
    Command,
    Wallet,
    Zap,
    Smartphone,
    QrCode
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
    Field,
    FieldContent
} from "@/components/ui/field"
import {
    InputGroup,
    InputGroupInput,
    InputGroupAddon
} from "@/components/ui/input-group"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Item,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemGroup,
} from "@/components/ui/item"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const settingsNav = [
    {
        category: "General",
        items: [
            { id: "profile", title: "Account Information", icon: User, description: "Manage your personal details and preferences" },
            { id: "company", title: "Company Details", icon: Building2, description: "Manage company information and branding" },
        ]
    },
    {
        category: "Organization",
        items: [
            { id: "users", title: "Users & Permissions", icon: Users, description: "Manage team members and their roles" },
            { id: "security", title: "Security", icon: Shield, description: "Configure 2FA, SSO and password policies" },
            { id: "audit", title: "Audit Logs", icon: FileText, description: "View system activity and changes" },
        ]
    },
    {
        category: "Billing",
        items: [
            { id: "plans", title: "Plans & Features", icon: CreditCard, description: "Manage your subscription and limits" },
            { id: "usage", title: "Usage & Credits", icon: Zap, description: "Monitor your consumption and credit balance" },
            { id: "payments", title: "Payment Methods", icon: Wallet, description: "Manage credit cards and billing information" },
            { id: "invoices", title: "Invoices", icon: Receipt, description: "View and download past invoices" },
        ]
    },
    {
        category: "Platform",
        items: [
            { id: "integrations", title: "Integrations", icon: Plug, description: "Connect with third-party services" },
            { id: "notifications", title: "Notifications", icon: Bell, description: "Manage email and system alerts" },
            { id: "api", title: "API Settings", icon: Database, description: "Manage API keys and webhooks" },
        ]
    }
]

const searchIndex = [
    // General
    { id: "profile", title: "Account Information", description: "Personal details", tabId: "profile", keywords: ["name", "email", "avatar"] },
    { id: "company", title: "Company Details", description: "Brand and address", tabId: "company", keywords: ["logo", "address"] },
    // Organization
    { id: "users", title: "Users & Permissions", description: "Team members", tabId: "users", keywords: ["invite", "role", "member"] },
    { id: "security", title: "Security Settings", description: "2FA and Password", tabId: "security", keywords: ["password", "mfa", "sso"] },
    { id: "audit", title: "Audit Logs", description: "System activity", tabId: "audit", keywords: ["logs", "history"] },
    // Billing
    { id: "plans", title: "Plans & Features", description: "Subscription details", tabId: "plans", keywords: ["upgrade", "tier", "pro"] },
    { id: "usage", title: "Usage & Credits", description: "Consumption stats", tabId: "usage", keywords: ["limit", "quota"] },
    { id: "payments", title: "Payment Methods", description: "Credit cards", tabId: "payments", keywords: ["card", "visa", "mastercard"] },
    { id: "invoices", title: "Invoices", description: "Billing history", tabId: "invoices", keywords: ["receipt", "bill"] },
    // Platform
    { id: "integrations", title: "Integrations", description: "Third-party apps", tabId: "integrations", keywords: ["slack", "salesforce", "hubspot"] },
    { id: "notifications-email", title: "Email Notifications", description: "Email alert settings", tabId: "notifications", keywords: ["email", "alert"] },
    { id: "notifications-push", title: "Push Notifications", description: "Browser notifications", tabId: "notifications", keywords: ["push", "browser"] },
    { id: "api", title: "API Settings", description: "Keys and webhooks", tabId: "api", keywords: ["key", "secret", "token"] },
]

import { SettingsGroup } from "@/components/settings-group"

interface SettingsDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}


export function SettingsDrawer({ open, onOpenChange }: SettingsDrawerProps) {
    const [activeTab, setActiveTab] = React.useState("company")
    const [isBouncing, setIsBouncing] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [highlightedItem, setHighlightedItem] = React.useState<string | null>(null)

    // Filter search results
    const searchResults = React.useMemo(() => {
        if (!searchQuery.trim()) return []
        const q = searchQuery.toLowerCase()
        return searchIndex.filter(item =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.keywords.some(k => k.toLowerCase().includes(q))
        )
    }, [searchQuery])

    // Settings State
    const [notificationSettings, setNotificationSettings] = React.useState({
        emailNotifications: true,
        pushNotifications: true,
        autoArchive: false,
        showPriority: true,
        notificationPosition: "top-right"
    })

    // Initial state for change tracking
    const [initialNotificationSettings, setInitialNotificationSettings] = React.useState(notificationSettings)

    // Load saved settings
    React.useEffect(() => {
        const savedPosition = localStorage.getItem("toast-position")
        if (savedPosition) {
            setNotificationSettings(prev => ({ ...prev, notificationPosition: savedPosition }))
            setInitialNotificationSettings(prev => ({ ...prev, notificationPosition: savedPosition }))
        }
    }, [])

    // Derive unsaved changes
    const unsavedChangesCount = React.useMemo(() => {
        let count = 0
        if (notificationSettings.emailNotifications !== initialNotificationSettings.emailNotifications) count++
        if (notificationSettings.pushNotifications !== initialNotificationSettings.pushNotifications) count++
        if (notificationSettings.autoArchive !== initialNotificationSettings.autoArchive) count++
        if (notificationSettings.showPriority !== initialNotificationSettings.showPriority) count++
        if (notificationSettings.notificationPosition !== initialNotificationSettings.notificationPosition) count++
        return count
    }, [notificationSettings, initialNotificationSettings])

    const hasUnsavedChanges = unsavedChangesCount > 0

    // Reset to first tab when opening
    React.useEffect(() => {
        if (open) {
            setActiveTab(settingsNav[0].items[0].id)
        }
    }, [open])

    // Find current tab details
    const currentTab = settingsNav
        .flatMap(g => g.items)
        .find(i => i.id === activeTab) || settingsNav[0].items[0]

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && hasUnsavedChanges) {
            setIsBouncing(true)
            setTimeout(() => setIsBouncing(false), 800)
            return
        }
        onOpenChange(newOpen)
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent
                side="bottom"
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="h-[95vh] rounded-t-xl p-0 overflow-hidden bg-secondary outline-none shadow-2xl [&>button]:hidden"
            >
                <style>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-4px); }
                        75% { transform: translateX(4px); }
                    }
                    .animate-shake {
                        animation: shake 0.2s ease-in-out 3;
                    }
                `}</style>
                {/* Header - Fixed */}
                <div className="h-16 border-b bg-background shrink-0 z-50 relative w-full">
                    <div className="grid grid-cols-12 gap-6 px-4 md:px-8 max-w-[1600px] mx-auto h-full items-center">
                        {/* Spacer - 2 cols (matches body) */}
                        <div className="col-span-2 hidden xl:block" />

                        {/* Left: Title - 2 cols (matches sidebar) */}
                        <div className="col-span-12 md:col-span-3 xl:col-span-2 flex items-center gap-3">
                            <div className="size-8 bg-gray-100 rounded-lg flex items-center justify-center text-foreground shrink-0">
                                <Settings className="size-4" />
                            </div>
                            <span className="font-semibold text-lg hover:opacity-80 transition-opacity cursor-pointer">Settings</span>
                        </div>

                        {/* Center: Search OR Actions - 6 cols (matches content) */}
                        <div className="col-span-12 md:col-span-9 xl:col-span-6 flex justify-center">
                            {hasUnsavedChanges ? (
                                <div className="w-full animate-in fade-in zoom-in-95 duration-200">
                                    <div className={cn(
                                        "bg-muted/50 rounded-full px-1.5 py-1.5 flex items-center justify-between gap-3 border w-full",
                                        isBouncing && "animate-shake ring-2 ring-destructive/50 ring-offset-2"
                                    )}>
                                        <span className="text-xs font-medium text-muted-foreground px-2">
                                            {unsavedChangesCount} unsaved change{unsavedChangesCount > 1 ? 's' : ''}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 rounded-full px-3 text-xs hover:bg-background"
                                                onClick={() => setNotificationSettings(initialNotificationSettings)}
                                            >
                                                Discard
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-7 rounded-full px-3 text-xs"
                                                onClick={() => {
                                                    // Save to localStorage
                                                    localStorage.setItem("toast-position", notificationSettings.notificationPosition)
                                                    window.dispatchEvent(new CustomEvent("toast-position-changed", { detail: notificationSettings.notificationPosition }))
                                                    toast.success("Settings saved successfully")

                                                    // Update initial state to match current
                                                    setInitialNotificationSettings(notificationSettings)
                                                }}
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full">
                                    <Field className="w-full">
                                        <FieldContent>
                                            <InputGroup className="bg-background border-border-muted focus-visible:bg-background focus-visible:border-ring transition-all duration-200 cursor-pointer w-full gap-2 py-1.5 h-10 rounded-lg">
                                                <InputGroupAddon>
                                                    <Search className="h-4 w-4 text-muted-foreground" />
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    type="text"
                                                    placeholder="Search settings..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="h-full text-sm cursor-pointer w-full pr-0 pl-0 border-none focus-visible:ring-0 shadow-none bg-transparent"
                                                />

                                            </InputGroup>
                                        </FieldContent>
                                    </Field>
                                </div>
                            )}
                        </div>

                        {/* Right: Close Actions - 2 cols (matches spacer) */}
                        <div className="col-span-2 hidden xl:flex justify-end">
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={() => handleOpenChange(false)}
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Body - Centered Grid Layout */}
                <div className="flex-1 overflow-hidden bg-muted/10">
                    <ScrollArea className="h-full">
                        <div className="h-full w-full py-8">
                            <div className="grid grid-cols-12 gap-6 px-4 md:px-8 max-w-[1600px] mx-auto h-full">
                                {/* Spacer - 2 cols */}
                                <div className="col-span-2 hidden xl:block" />

                                {/* Sidebar - 2 cols */}
                                <div className="col-span-12 md:col-span-3 xl:col-span-2 flex flex-col gap-6">
                                    <div className="rounded-xl border bg-background shadow-sm overflow-hidden py-2">
                                        {settingsNav.map((group, i) => (
                                            <div key={i} className="mb-2 last:mb-0">
                                                <h4 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    {group.category}
                                                </h4>
                                                <div className="space-y-0.5 px-2">
                                                    {group.items.map((item) => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => {
                                                                if (hasUnsavedChanges && item.id !== activeTab) {
                                                                    setIsBouncing(true)
                                                                    setTimeout(() => setIsBouncing(false), 800)
                                                                    return
                                                                }
                                                                setActiveTab(item.id)
                                                            }}
                                                            className={cn(
                                                                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 text-left outline-none ring-sidebar-ring focus-visible:ring-2 cursor-pointer",
                                                                item.id === activeTab
                                                                    ? "bg-sidebar-accent/50 text-sidebar-accent-foreground font-medium" // Active state
                                                                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground" // Inactive state
                                                            )}
                                                        >
                                                            <item.icon className="size-4 shrink-0" />
                                                            <span className="truncate">{item.title}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Content - 6 cols */}
                                <div className="col-span-12 md:col-span-9 xl:col-span-6 flex flex-col gap-6">
                                    {searchQuery ? (
                                        <div className="rounded-xl border bg-background shadow-sm min-h-[500px] flex flex-col overflow-hidden">
                                            <div className="flex flex-col h-full">
                                                <div className="p-6 border-b bg-muted/10">
                                                    <h2 className="text-lg font-semibold tracking-tight">Search Results</h2>
                                                    <p className="text-muted-foreground mt-0.5 text-xs">Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"</p>
                                                </div>
                                                <div className="p-0 flex-1 overflow-auto bg-muted/5">
                                                    {searchResults.length > 0 ? (
                                                        <div className="divide-y border-t border-b">
                                                            {searchResults.map((result) => (
                                                                <button
                                                                    key={result.id}
                                                                    className="w-full text-left px-6 py-4 hover:bg-background transition-colors flex items-center justify-between group bg-background"
                                                                    onClick={() => {
                                                                        setActiveTab(result.tabId)
                                                                        setSearchQuery("")
                                                                        setHighlightedItem(result.id)
                                                                        setTimeout(() => setHighlightedItem(null), 2000)
                                                                    }}
                                                                >
                                                                    <div>
                                                                        <div className="font-medium text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                                                                            {result.title}
                                                                            <Settings className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground mt-0.5">{result.description}</div>
                                                                    </div>
                                                                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-normal text-muted-foreground">
                                                                        {settingsNav.find(g => g.items.some(i => i.id === result.tabId))?.items.find(i => i.id === result.tabId)?.title}
                                                                    </Badge>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                                            <div className="size-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                                                                <Search className="size-8 text-muted-foreground/30" />
                                                            </div>
                                                            <h3 className="text-sm font-medium">No results found</h3>
                                                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">We couldn't find any settings matching "{searchQuery}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col h-full">
                                            <div className="mb-6 px-1 pt-4">
                                                <h2 className="text-xl font-semibold tracking-tight">{currentTab.title}</h2>
                                                <p className="text-muted-foreground mt-1 text-sm">{currentTab.description}</p>
                                            </div>

                                            <ScrollArea className="flex-1 -mx-1 px-1">
                                                <div className="space-y-6 pb-20">
                                                    {currentTab.id === "profile" && (
                                                        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                            <SettingsGroup title="Personal Information" action={<Button variant="outline" size="sm">Change Avatar</Button>}>
                                                                <div className="space-y-8">
                                                                    <div className="flex items-center gap-4">
                                                                        <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                                                                            <AvatarImage src="/placeholder-user.jpg" />
                                                                            <AvatarFallback className="bg-primary/10 text-primary text-xl">JD</AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1">
                                                                            <h3 className="font-medium">John Doe</h3>
                                                                            <p className="text-sm text-muted-foreground">Product Manager</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid gap-5">
                                                                        <div className="grid gap-2">
                                                                            <label className="text-sm font-medium">Display Name</label>
                                                                            <Input defaultValue="John Doe" className="bg-background" />
                                                                        </div>
                                                                        <div className="grid gap-2">
                                                                            <label className="text-sm font-medium">Email Address</label>
                                                                            <Input defaultValue="john@cequens.com" className="bg-background" />
                                                                        </div>
                                                                        <div className="grid gap-2">
                                                                            <label className="text-sm font-medium">Phone Number</label>
                                                                            <Input defaultValue="+1 (555) 000-0000" className="bg-background" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </SettingsGroup>
                                                        </div>
                                                    )}

                                                    {currentTab.id === "company" && (
                                                        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                            <SettingsGroup title="Organization Details">
                                                                <div className="grid gap-5">
                                                                    <div className="grid gap-2">
                                                                        <label className="text-sm font-medium">Company Name</label>
                                                                        <Input defaultValue="Cequens" className="bg-background" />
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        <label className="text-sm font-medium">Website</label>
                                                                        <Input defaultValue="https://cequens.com" className="bg-background" />
                                                                    </div>
                                                                    <div className="fixed-grid grid-cols-2 gap-4">
                                                                        <div className="grid gap-2">
                                                                            <label className="text-sm font-medium">Tax ID</label>
                                                                            <Input defaultValue="TAX-123456789" className="bg-background" />
                                                                        </div>
                                                                        <div className="grid gap-2">
                                                                            <label className="text-sm font-medium">Currency</label>
                                                                            <Input defaultValue="USD - US Dollar" disabled className="bg-muted" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </SettingsGroup>
                                                        </div>
                                                    )}

                                                    {currentTab.id === "users" && (
                                                        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                            <SettingsGroup
                                                                title="Team Members"
                                                                action={<Button size="sm">Invite User</Button>}
                                                                contentClassName="p-1"
                                                            >
                                                                <div className="space-y-1">
                                                                    {[1, 2, 3].map((u) => (
                                                                        <Item key={u} className="hover:bg-muted/50 transition-colors rounded-lg">
                                                                            <ItemContent>
                                                                                <div className="flex items-center justify-between p-2">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <Avatar className="h-9 w-9 border border-border"><AvatarFallback>U{u}</AvatarFallback></Avatar>
                                                                                        <div>
                                                                                            <ItemTitle>User {u}</ItemTitle>
                                                                                            <ItemDescription className="text-xs">user{u}@company.com</ItemDescription>
                                                                                        </div>
                                                                                    </div>
                                                                                    <Badge variant="outline" className="bg-background">Member</Badge>
                                                                                </div>
                                                                            </ItemContent>
                                                                        </Item>
                                                                    ))}
                                                                </div>
                                                            </SettingsGroup>
                                                        </div>
                                                    )}

                                                    {currentTab.id === "security" && (
                                                        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                            <SettingsGroup title="Authentication" contentClassName="p-1">
                                                                <div className="space-y-1">
                                                                    <Item className="hover:bg-muted/50 transition-colors rounded-lg">
                                                                        <ItemContent>
                                                                            <div className="flex items-center gap-3 p-2">
                                                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                                                    <Smartphone className="h-4 w-4" />
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <ItemTitle>Text Message (SMS)</ItemTitle>
                                                                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-green-50 text-green-700 border-green-200">Enabled</Badge>
                                                                                    </div>
                                                                                    <ItemDescription className="truncate">Code sent to <span className="font-mono text-foreground">+1 (555) ***-**99</span></ItemDescription>
                                                                                </div>
                                                                                <Button variant="ghost" size="sm" className="h-8 text-xs">Change</Button>
                                                                            </div>
                                                                        </ItemContent>
                                                                    </Item>

                                                                    <Separator />

                                                                    <Item className="opacity-60 rounded-lg">
                                                                        <ItemContent>
                                                                            <div className="flex items-center gap-3 p-2">
                                                                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                                                                                    <QrCode className="h-4 w-4" />
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <ItemTitle>Authenticator App</ItemTitle>
                                                                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Coming Soon</Badge>
                                                                                    </div>
                                                                                    <ItemDescription>Use Google Authenticator or similar apps.</ItemDescription>
                                                                                </div>
                                                                            </div>
                                                                        </ItemContent>
                                                                    </Item>
                                                                </div>
                                                            </SettingsGroup>

                                                            <SettingsGroup title="Credentials" contentClassName="p-1">
                                                                <Item className="rounded-lg">
                                                                    <ItemContent>
                                                                        <div className="flex items-center justify-between p-2">
                                                                            <div>
                                                                                <ItemTitle>Password</ItemTitle>
                                                                                <ItemDescription>Last changed 3 months ago</ItemDescription>
                                                                            </div>
                                                                            <Button variant="outline" size="sm">Change Password</Button>
                                                                        </div>
                                                                    </ItemContent>
                                                                </Item>
                                                            </SettingsGroup>
                                                        </div>
                                                    )}

                                                    {currentTab.id === "plans" && (
                                                        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                            <SettingsGroup title="Current Plan" action={<Badge className="bg-primary text-primary-foreground">Active</Badge>}>
                                                                <div className="space-y-6">
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <div>
                                                                            <h3 className="text-lg font-bold text-primary">Pro Plan</h3>
                                                                            <p className="text-sm text-muted-foreground">$29/month</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2 text-sm text-muted-foreground">
                                                                        <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Unlimited Projects</div>
                                                                        <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Advanced Analytics</div>
                                                                        <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Priority Support</div>
                                                                    </div>
                                                                    <Button className="w-full mt-6">Manage Subscription</Button>
                                                                </div>
                                                            </SettingsGroup>
                                                        </div>
                                                    )}

                                                    {currentTab.id === "notifications" && (
                                                        <div className="grid gap-4 animate-in fade-in duration-300 slide-in-from-bottom-4">
                                                            <div className="space-y-4">
                                                                <SettingsGroup title="Notifications" contentClassName="p-1">
                                                                    <div className="space-y-1">
                                                                        <Item size="default" className="cursor-pointer hover:bg-muted/50 transition-colors rounded-lg" onClick={() => { setNotificationSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications })) }}>
                                                                            <ItemContent>
                                                                                <div className="px-4 py-3 flex items-start gap-3">
                                                                                    <Checkbox id="email-notifications" checked={notificationSettings.emailNotifications} onCheckedChange={(checked) => { setNotificationSettings(prev => ({ ...prev, emailNotifications: !!checked })) }} className="mt-0.5" />
                                                                                    <div>
                                                                                        <ItemTitle>Email Notifications</ItemTitle>
                                                                                        <ItemDescription className="text-xs mt-1">Receive notifications via email</ItemDescription>
                                                                                    </div>
                                                                                </div>
                                                                            </ItemContent>
                                                                        </Item>
                                                                        <Separator />
                                                                        <Item size="default" className="cursor-pointer hover:bg-muted/50 transition-colors rounded-lg" onClick={() => { setNotificationSettings(prev => ({ ...prev, pushNotifications: !prev.pushNotifications })) }}>
                                                                            <ItemContent>
                                                                                <div className="px-4 py-3 flex items-start gap-3">
                                                                                    <Checkbox id="push-notifications" checked={notificationSettings.pushNotifications} onCheckedChange={(checked) => { setNotificationSettings(prev => ({ ...prev, pushNotifications: !!checked })) }} className="mt-0.5" />
                                                                                    <div>
                                                                                        <ItemTitle>Push Notifications</ItemTitle>
                                                                                        <ItemDescription className="text-xs mt-1">Show browser notifications</ItemDescription>
                                                                                    </div>
                                                                                </div>
                                                                            </ItemContent>
                                                                        </Item>
                                                                        <Separator />
                                                                        <Item size="default" className="cursor-pointer hover:bg-muted/50 transition-colors rounded-lg" onClick={() => { setNotificationSettings(prev => ({ ...prev, autoArchive: !prev.autoArchive })) }}>
                                                                            <ItemContent>
                                                                                <div className="px-4 py-3 flex items-start gap-3">
                                                                                    <Checkbox id="auto-archive" checked={notificationSettings.autoArchive} onCheckedChange={(checked) => { setNotificationSettings(prev => ({ ...prev, autoArchive: !!checked })) }} className="mt-0.5" />
                                                                                    <div>
                                                                                        <ItemTitle>Auto Archive</ItemTitle>
                                                                                        <ItemDescription className="text-xs mt-1">Archive read notifications after 30 days</ItemDescription>
                                                                                    </div>
                                                                                </div>
                                                                            </ItemContent>
                                                                        </Item>
                                                                        <Separator />
                                                                        <Item size="default" className="cursor-pointer hover:bg-muted/50 transition-colors rounded-lg" onClick={() => { setNotificationSettings(prev => ({ ...prev, showPriority: !prev.showPriority })) }}>
                                                                            <ItemContent>
                                                                                <div className="px-4 py-3 flex items-start gap-3">
                                                                                    <Checkbox id="show-priority" checked={notificationSettings.showPriority} onCheckedChange={(checked) => { setNotificationSettings(prev => ({ ...prev, showPriority: !!checked })) }} className="mt-0.5" />
                                                                                    <div>
                                                                                        <ItemTitle>Show Priority Badges</ItemTitle>
                                                                                        <ItemDescription className="text-xs mt-1">Display priority indicators</ItemDescription>
                                                                                    </div>
                                                                                </div>
                                                                            </ItemContent>
                                                                        </Item>
                                                                    </div>
                                                                </SettingsGroup>
                                                            </div>


                                                            <SettingsGroup title="Notification position">
                                                                <RadioGroup value={notificationSettings.notificationPosition} onValueChange={(value) => { setNotificationSettings(prev => ({ ...prev, notificationPosition: value })); toast.info("Notification position preview", { description: "This is how notifications will appear", position: value as any }); }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                    {["top-right", "bottom-right", "bottom-center"].map((pos) => (
                                                                        <div key={pos} className="flex flex-col items-center">
                                                                            <div className="w-full cursor-pointer group" onClick={() => { setNotificationSettings(prev => ({ ...prev, notificationPosition: pos })); toast.info("Notification position preview", { description: "This is how notifications will appear", position: pos as any }); }}>
                                                                                <div className="relative w-full aspect-video bg-gray-100 rounded-md overflow-hidden flex items-center justify-center transition-colors group-hover:bg-muted/60 group-hover:ring-1 group-hover:ring-primary">
                                                                                    <div className="w-full h-full p-2">
                                                                                        <div className="overflow-hidden w-full h-full bg-background/80 rounded-sm border border-border/50 relative">
                                                                                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200"></div>
                                                                                            <div className="absolute top-3 left-1 w-1/3 h-0.5 bg-gray-200/50 rounded-full"></div>
                                                                                            <div className="absolute top-4 left-1 w-1/4 h-0.5 bg-gray-200/50 rounded-full"></div>
                                                                                            <div className="absolute top-7 left-1 w-1/2 h-0.5 bg-gray-200/50 rounded-full"></div>
                                                                                            <div className={cn("absolute m-0.5 w-1/3 h-3 bg-muted-foreground/40 rounded-sm border border-border-muted flex items-center justify-center group-hover:bg-primary/70 group-hover:border-border-primary transition-colors", pos === "top-right" && "top-0 right-0", pos === "bottom-right" && "bottom-0 right-0", pos === "bottom-center" && "bottom-0 left-1/2 transform -translate-x-1/2")}>
                                                                                                <div className="w-2/3 h-0.5 bg-white/60 rounded-full mx-auto"></div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center space-x-2 justify-center mt-2">
                                                                                    <RadioGroupItem value={pos} id={pos} />
                                                                                    <label htmlFor={pos} className="text-sm capitalize">{pos.replace("-", " ")}</label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </RadioGroup>
                                                            </SettingsGroup>
                                                        </div>
                                                    )}

                                                    {/* Catch-all for other tabs */}
                                                    {["profile", "company", "users", "security", "plans", "notifications"].indexOf(currentTab.id) === -1 && (
                                                        <div className="p-10 rounded-xl border-2 border-dashed border-muted bg-muted/5 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
                                                            <div className="size-12 rounded-full bg-muted/20 flex items-center justify-center">
                                                                <currentTab.icon className="size-6" />
                                                            </div>
                                                            <p className="font-medium">Configure your {currentTab.title}</p>
                                                            <p className="text-xs max-w-xs">Settings content coming soon.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    )}
                                </div>

                                {/* Spacer - 2 cols */}
                                <div className="col-span-2 hidden xl:block" />
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </SheetContent >
        </Sheet >
    )
}
