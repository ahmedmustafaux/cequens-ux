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
    QrCode,
    Settings2,
    Plus,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { SheetDescription } from "@/components/ui/sheet"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { TopupDialog } from "@/pages/Billing/components/TopupDialog"
import { ArrowUpRight, TrendingUp } from "lucide-react"

const settingsNav = [
    {
        category: "Account",
        items: [
            { id: "profile", title: "My details", icon: User, description: "Manage your personal information and preferences" },
            { id: "security", title: "Password & Security", icon: Shield, description: "Configure 2FA, SSO and password policies" },
            { id: "audit", title: "Login Activity", icon: FileText, description: "View recent login attempts and system activity" },
        ]
    },
    {
        category: "Subscription",
        items: [
            { id: "billing", title: "Billing", icon: Wallet, description: "Manage billing, plans, and payment methods" },
            { id: "teams", title: "Teams", icon: Users, description: "Manage team members and organization structure" },
            { id: "coverage", title: "Coverage & Prices", icon: Globe, description: "View service availability and pricing details" },
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
    const [isTopupOpen, setIsTopupOpen] = React.useState(false)

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
                className="h-[94vh] rounded-t-xl p-0 flex flex-col overflow-hidden bg-secondary outline-none shadow-2xl"
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
                            <SheetHeader>
                                <VisuallyHidden>
                                    <SheetTitle>Settings</SheetTitle>
                                    <SheetDescription>Manage your account settings and preferences.</SheetDescription>
                                </VisuallyHidden>
                            </SheetHeader>
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
                        <div className="absolute top-4 right-4">
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
                <div className="flex-1 overflow-y-auto bg-muted/10">
                    <div className="w-full pb-8">
                        <div className="grid grid-cols-12 gap-6 px-4 md:px-8 max-w-[1600px] mx-auto items-start">
                            {/* Spacer - 2 cols */}
                            <div className="col-span-2 hidden xl:block" />

                            {/* Sidebar - 2 cols - Sticky positioning */}
                            <div className="col-span-12 md:col-span-3 xl:col-span-2 flex flex-col gap-6 sticky top-4 h-fit pb-20">
                                <div className="rounded-xl border bg-background shadow-sm overflow-hidden py-2 shrink-0">
                                    {settingsNav.map((group, i) => (
                                        <div key={i} className="mb-4 last:mb-0">
                                            <h4 className="px-5 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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

                            {/* Content - 6 cols - Scrolls with parent */}
                            <div className="col-span-12 md:col-span-9 xl:col-span-6 flex flex-col pt-8 pr-2">
                                {searchQuery ? (
                                    <div className="flex flex-col">
                                        <div className="mb-6 px-1">
                                            <h2 className="text-xl font-semibold tracking-tight">Search Results</h2>
                                            <p className="text-muted-foreground mt-1 text-sm">Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"</p>
                                        </div>

                                        <div className="flex-1 -mx-1 px-1">
                                            <div className="space-y-4 pb-20">
                                                {searchResults.length > 0 ? (
                                                    <div className="grid gap-4">
                                                        {searchResults.map((result) => (
                                                            <button
                                                                key={result.id}
                                                                className="w-full text-left p-4 rounded-xl border bg-background shadow-sm hover:bg-background/50 transition-all flex items-center justify-between group cursor-pointer"
                                                                onClick={() => {
                                                                    setActiveTab(result.tabId)
                                                                    setSearchQuery("")
                                                                    setHighlightedItem(result.id)
                                                                    setTimeout(() => setHighlightedItem(null), 2000)
                                                                }}
                                                            >
                                                                <div>
                                                                    <div className="font-medium text-sm flex items-center gap-2">
                                                                        {result.title}
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
                                                    <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-dashed border-muted bg-muted/5">
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
                                    <div className="flex flex-col">
                                        <div className="mb-6 px-1">
                                            <h2 className="text-xl font-semibold tracking-tight">{currentTab.title}</h2>
                                            <p className="text-muted-foreground mt-1 text-sm">{currentTab.description}</p>
                                        </div>

                                        <div className="flex-1 -mx-1 px-1">
                                            <div className="space-y-6 pb-20">
                                                {(activeTab === "profile" || activeTab === "company") && (
                                                    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                        <SettingsGroup title="Personal Information" action={<Button variant="outline" size="sm">Change Avatar</Button>} contentClassName="p-1">
                                                            <div className="space-y-1">
                                                                <Item className="rounded-lg">
                                                                    <ItemContent>
                                                                        <div className="space-y-8 p-4">
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
                                                                    </ItemContent>
                                                                </Item>
                                                            </div>
                                                        </SettingsGroup>

                                                        <SettingsGroup title="Organization Details" contentClassName="p-1">
                                                            <div className="space-y-1">
                                                                <Item className="rounded-lg">
                                                                    <ItemContent>
                                                                        <div className="grid gap-5 p-4">
                                                                            <div className="grid gap-2">
                                                                                <label className="text-sm font-medium">Company Name</label>
                                                                                <Input defaultValue="Cequens" className="bg-background" />
                                                                            </div>
                                                                            <div className="grid gap-2">
                                                                                <label className="text-sm font-medium">Website</label>
                                                                                <Input defaultValue="https://cequens.com" className="bg-background" />
                                                                            </div>
                                                                        </div>
                                                                    </ItemContent>
                                                                </Item>
                                                            </div>
                                                        </SettingsGroup>
                                                    </div>
                                                )}

                                                {activeTab === "billing" && (
                                                    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-8">
                                                        <SettingsGroup title="Balance & Credit" action={<Button size="sm" onClick={() => setIsTopupOpen(true)}>Top up balance</Button>}>
                                                            <div className="flex py-2 items-center space-x-4">
                                                                <div className="flex flex-1 flex-col gap-0.5">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                                            <Wallet className="size-4" />
                                                                        </div>
                                                                        <span className="text-sm font-medium text-muted-foreground pt-0.5">Available Balance</span>
                                                                    </div>
                                                                    <span className="text-xl font-bold tracking-tight text-foreground pl-10">EGP 1,250.00</span>
                                                                </div>

                                                                <Separator orientation="vertical" className="h-10" />

                                                                <div className="flex flex-1 flex-col gap-0.5">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                                                                            <CreditCard className="size-4" />
                                                                        </div>
                                                                        <span className="text-sm font-medium text-muted-foreground pt-0.5">Credit Limit</span>
                                                                    </div>
                                                                    <span className="text-xl font-bold tracking-tight text-orange-600 pl-10">EGP 5,000.00</span>
                                                                </div>
                                                            </div>
                                                        </SettingsGroup>

                                                        <SettingsGroup title="Billing History" contentClassName="p-0 overflow-hidden">
                                                            <Table>
                                                                <TableHeader className="bg-muted/50">
                                                                    <TableRow>
                                                                        <TableHead className="font-semibold w-[100px]">Invoice</TableHead>
                                                                        <TableHead className="font-semibold">Date</TableHead>
                                                                        <TableHead className="font-semibold">Status</TableHead>
                                                                        <TableHead className="font-semibold text-right">Amount</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {[
                                                                        { id: "INV-001", date: "Mar 01, 2026", status: "Paid", amount: "$500.00" },
                                                                        { id: "INV-002", date: "Feb 01, 2026", status: "Paid", amount: "$250.00" },
                                                                        { id: "INV-003", date: "Jan 01, 2026", status: "Paid", amount: "$150.00" },
                                                                    ].map((invoice) => (
                                                                        <TableRow key={invoice.id} className="hover:bg-muted/30 transition-colors">
                                                                            <TableCell className="font-medium text-sm">{invoice.id}</TableCell>
                                                                            <TableCell className="text-sm text-muted-foreground">{invoice.date}</TableCell>
                                                                            <TableCell>
                                                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-green-50 text-green-700 border-green-200 shadow-none font-medium">
                                                                                    {invoice.status}
                                                                                </Badge>
                                                                            </TableCell>
                                                                            <TableCell className="text-right text-sm font-bold">{invoice.amount}</TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </SettingsGroup>

                                                        <TopupDialog open={isTopupOpen} onOpenChange={setIsTopupOpen} />
                                                    </div>
                                                )}

                                                {activeTab === "teams" && (
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

                                                {activeTab === "security" && (
                                                    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-8">
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

                                                        <SettingsGroup title="Security Controls" contentClassName="p-1">
                                                            <div className="space-y-1">
                                                                <Item className="hover:bg-muted/50 transition-colors rounded-lg">
                                                                    <ItemContent>
                                                                        <div className="flex items-center justify-between p-2">
                                                                            <div className="space-y-1 pr-4">
                                                                                <label className="text-sm font-medium">Change password</label>
                                                                                <p className="text-xs text-muted-foreground">Your password has not changed in the last 144 days.</p>
                                                                            </div>
                                                                            <Button variant="outline" size="sm" className="h-8 text-xs shrink-0">Change password</Button>
                                                                        </div>
                                                                    </ItemContent>
                                                                </Item>

                                                                <Item className="hover:bg-muted/50 transition-colors rounded-lg">
                                                                    <ItemContent>
                                                                        <div className="flex items-center justify-between p-2">
                                                                            <div className="space-y-1 pr-4">
                                                                                <label className="text-sm font-medium">Enable auto logout</label>
                                                                                <p className="text-xs text-muted-foreground">Enable auto logout after x minutes</p>
                                                                            </div>
                                                                            <Switch />
                                                                        </div>
                                                                    </ItemContent>
                                                                </Item>

                                                                <Item className="hover:bg-muted/50 transition-colors rounded-lg">
                                                                    <ItemContent>
                                                                        <div className="flex items-center justify-between p-2">
                                                                            <div className="space-y-1 pr-4">
                                                                                <label className="text-sm font-medium">Single Sign-On</label>
                                                                                <p className="text-xs text-muted-foreground">Setup is done, if enabled users can use SSO now.</p>
                                                                            </div>
                                                                            <div className="flex items-center gap-4 shrink-0">
                                                                                <Button variant="outline" className="h-8 px-3 text-xs font-medium">Edit SSO Settings</Button>
                                                                                <Switch defaultChecked />
                                                                            </div>
                                                                        </div>
                                                                    </ItemContent>
                                                                </Item>
                                                            </div>
                                                        </SettingsGroup>

                                                        <SettingsGroup title="Account Policies" contentClassName="p-1">
                                                            <div className="space-y-1">
                                                                {/* Incorrect Logins */}
                                                                <Item className="hover:bg-muted/50 transition-colors rounded-lg">
                                                                    <ItemContent>
                                                                        <div className="flex items-center justify-between p-2">
                                                                            <div className="flex flex-col pr-4">
                                                                                <label className="text-sm font-medium">Set maximum number for incorrect logins</label>
                                                                                <p className="text-xs text-muted-foreground mt-0.5">Users under this account who will exceed the limit will be automatically locked out.</p>
                                                                            </div>
                                                                            <div className="w-[80px] shrink-0">
                                                                                <Select defaultValue="5">
                                                                                    <SelectTrigger className="h-8 px-3 text-xs w-full">
                                                                                        <SelectValue placeholder="Select" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="3">3</SelectItem>
                                                                                        <SelectItem value="5">5</SelectItem>
                                                                                        <SelectItem value="10">10</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                        </div>
                                                                    </ItemContent>
                                                                </Item>

                                                                {/* Inactive User Policy */}
                                                                <Item className="hover:bg-muted/50 transition-colors rounded-lg">
                                                                    <ItemContent>
                                                                        <div className="flex items-center justify-between p-2">
                                                                            <div className="space-y-1 pr-4">
                                                                                <label className="text-sm font-medium">Set inactive user policy</label>
                                                                                <p className="text-xs text-muted-foreground">Users will be deactivated after not logging in for a specified period.</p>
                                                                            </div>
                                                                            <Switch />
                                                                        </div>
                                                                    </ItemContent>
                                                                </Item>

                                                                {/* Password Expiry */}
                                                                <Item className="hover:bg-muted/50 transition-colors rounded-lg">
                                                                    <ItemContent>
                                                                        <div className="flex items-center justify-between p-2">
                                                                            <div className="flex flex-col pr-4">
                                                                                <label className="text-sm font-medium">Set password expiry policy</label>
                                                                                <p className="text-xs text-muted-foreground mt-0.5">Passwords for users under this account will expire after the specified number of days.</p>
                                                                            </div>
                                                                            <div className="w-[100px] shrink-0">
                                                                                <Select defaultValue="90">
                                                                                    <SelectTrigger className="h-8 px-3 text-xs w-full">
                                                                                        <SelectValue placeholder="Select" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="30">30 days</SelectItem>
                                                                                        <SelectItem value="60">60 days</SelectItem>
                                                                                        <SelectItem value="90">90 days</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                        </div>
                                                                    </ItemContent>
                                                                </Item>

                                                                {/* Auto Logout */}
                                                                <Item className="hover:bg-muted/50 transition-colors rounded-lg">
                                                                    <ItemContent>
                                                                        <div className="flex flex-col p-2 space-y-4">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="space-y-1 pr-4">
                                                                                    <label className="text-sm font-medium">Force auto logout after inactivity</label>
                                                                                    <p className="text-xs text-muted-foreground">Users will be logged out automatically from the portal after being inactive.</p>
                                                                                </div>
                                                                                <Switch defaultChecked />
                                                                            </div>
                                                                            <div className="w-full xl:w-1/2">
                                                                                <div className="flex items-center justify-between mb-3">
                                                                                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tabular-nums">Inactivity duration</span>
                                                                                    <Badge variant="secondary" className="text-[10px] font-mono">40 Min</Badge>
                                                                                </div>
                                                                                <Slider defaultValue={[40]} max={120} step={5} className="py-2" />
                                                                            </div>
                                                                        </div>
                                                                    </ItemContent>
                                                                </Item>

                                                                {/* IP Whitelist */}
                                                                <Item className="hover:bg-muted/50 transition-colors rounded-lg">
                                                                    <ItemContent>
                                                                        <div className="flex items-center justify-between p-2">
                                                                            <div className="space-y-1 pr-4">
                                                                                <label className="text-sm font-medium">IP Whitelist</label>
                                                                                <p className="text-xs text-muted-foreground">Limit your IP access list to ensure only authorized connections.</p>
                                                                            </div>
                                                                            <Button variant="outline" size="sm" className="h-8 text-xs">Edit List</Button>
                                                                        </div>
                                                                    </ItemContent>
                                                                </Item>
                                                            </div>
                                                        </SettingsGroup>
                                                    </div>
                                                )}

                                                {activeTab === "audit" && (
                                                    <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                        <SettingsGroup title="Login History" contentClassName="p-0 overflow-hidden">
                                                            <Table>
                                                                <TableHeader className="bg-muted/50">
                                                                    <TableRow>
                                                                        <TableHead className="font-semibold">User</TableHead>
                                                                        <TableHead className="font-semibold">Date/Time</TableHead>
                                                                        <TableHead className="font-semibold">IP</TableHead>
                                                                        <TableHead className="font-semibold">OS</TableHead>
                                                                        <TableHead className="font-semibold">Device</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {[
                                                                        { user: "BhramTest", time: "March 10th 2026, 6:10:45 pm", ip: "41.235.164.204", os: "Mac", device: "desktop" },
                                                                        { user: "BhramTest", time: "March 10th 2026, 5:13:27 pm", ip: "41.235.164.204", os: "Mac", device: "desktop" },
                                                                        { user: "BhramTest", time: "March 10th 2026, 12:13:26 pm", ip: "41.235.214.122", os: "Mac", device: "desktop" },
                                                                    ].map((log, i) => (
                                                                        <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                                                                            <TableCell className="text-sm">{log.user}</TableCell>
                                                                            <TableCell className="text-sm text-muted-foreground">{log.time}</TableCell>
                                                                            <TableCell className="text-sm font-mono text-muted-foreground">{log.ip}</TableCell>
                                                                            <TableCell className="text-sm text-muted-foreground">{log.os}</TableCell>
                                                                            <TableCell className="text-sm text-muted-foreground">{log.device}</TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </SettingsGroup>
                                                    </div>
                                                )}

                                                {/* Catch-all for other tabs */}
                                                {["profile", "billing", "teams", "security", "audit", "company"].indexOf(activeTab) === -1 && (
                                                    <div className="p-10 rounded-xl border-2 border-dashed border-muted bg-muted/5 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
                                                        <div className="size-12 rounded-full bg-muted/20 flex items-center justify-center">
                                                            <currentTab.icon className="size-6" />
                                                        </div>
                                                        <p className="font-medium">Configure your {currentTab.title}</p>
                                                        <p className="text-xs max-w-xs">Settings content coming soon.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </SheetContent >
        </Sheet >
    )
}
