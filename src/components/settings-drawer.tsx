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
    Zap
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

interface SettingsDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SettingsDrawer({ open, onOpenChange }: SettingsDrawerProps) {
    const [activeTab, setActiveTab] = React.useState("company")
    const [isBouncing, setIsBouncing] = React.useState(false)

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
                                                            onClick={() => setActiveTab(item.id)}
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
                                    <div className="rounded-xl border bg-background shadow-sm min-h-[500px] flex flex-col overflow-hidden">
                                        <div className="p-6">
                                            <h2 className="text-xl font-semibold tracking-tight">{currentTab.title}</h2>
                                            <p className="text-muted-foreground mt-1 text-sm">{currentTab.description}</p>
                                        </div>
                                        <Separator />

                                        <div className="p-6 space-y-8">
                                            {currentTab.id === "notifications" ? (
                                                <div className="space-y-6 animate-in fade-in duration-300 slide-in-from-bottom-4">
                                                    <ItemGroup className="border rounded-xl bg-background overflow-hidden">
                                                        <Item
                                                            size="default"
                                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                            onClick={() => {
                                                                setNotificationSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }));
                                                            }}
                                                        >
                                                            <ItemContent>
                                                                <div className="px-4 py-3 flex items-start gap-3">
                                                                    <Checkbox
                                                                        id="email-notifications"
                                                                        checked={notificationSettings.emailNotifications}
                                                                        onCheckedChange={(checked) => {
                                                                            setNotificationSettings(prev => ({ ...prev, emailNotifications: !!checked }))
                                                                        }}
                                                                        className="mt-0.5"
                                                                    />
                                                                    <div>
                                                                        <ItemTitle>Email Notifications</ItemTitle>
                                                                        <ItemDescription className="text-xs mt-1">Receive notifications via email</ItemDescription>
                                                                    </div>
                                                                </div>
                                                            </ItemContent>
                                                        </Item>

                                                        <Separator />

                                                        <Item
                                                            size="default"
                                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                            onClick={() => {
                                                                setNotificationSettings(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }));
                                                            }}
                                                        >
                                                            <ItemContent>
                                                                <div className="px-4 py-3 flex items-start gap-3">
                                                                    <Checkbox
                                                                        id="push-notifications"
                                                                        checked={notificationSettings.pushNotifications}
                                                                        onCheckedChange={(checked) => {
                                                                            setNotificationSettings(prev => ({ ...prev, pushNotifications: !!checked }))
                                                                        }}
                                                                        className="mt-0.5"
                                                                    />
                                                                    <div>
                                                                        <ItemTitle>Push Notifications</ItemTitle>
                                                                        <ItemDescription className="text-xs mt-1">Show browser notifications</ItemDescription>
                                                                    </div>
                                                                </div>
                                                            </ItemContent>
                                                        </Item>

                                                        <Separator />

                                                        <Item
                                                            size="default"
                                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                            onClick={() => {
                                                                setNotificationSettings(prev => ({ ...prev, autoArchive: !prev.autoArchive }));
                                                            }}
                                                        >
                                                            <ItemContent>
                                                                <div className="px-4 py-3 flex items-start gap-3">
                                                                    <Checkbox
                                                                        id="auto-archive"
                                                                        checked={notificationSettings.autoArchive}
                                                                        onCheckedChange={(checked) => {
                                                                            setNotificationSettings(prev => ({ ...prev, autoArchive: !!checked }))
                                                                        }}
                                                                        className="mt-0.5"
                                                                    />
                                                                    <div>
                                                                        <ItemTitle>Auto Archive</ItemTitle>
                                                                        <ItemDescription className="text-xs mt-1">Archive read notifications after 30 days</ItemDescription>
                                                                    </div>
                                                                </div>
                                                            </ItemContent>
                                                        </Item>

                                                        <Separator />

                                                        <Item
                                                            size="default"
                                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                            onClick={() => {
                                                                setNotificationSettings(prev => ({ ...prev, showPriority: !prev.showPriority }));
                                                            }}
                                                        >
                                                            <ItemContent>
                                                                <div className="px-4 py-3 flex items-start gap-3">
                                                                    <Checkbox
                                                                        id="show-priority"
                                                                        checked={notificationSettings.showPriority}
                                                                        onCheckedChange={(checked) => {
                                                                            setNotificationSettings(prev => ({ ...prev, showPriority: !!checked }))
                                                                        }}
                                                                        className="mt-0.5"
                                                                    />
                                                                    <div>
                                                                        <ItemTitle>Show Priority Badges</ItemTitle>
                                                                        <ItemDescription className="text-xs mt-1">Display priority indicators</ItemDescription>
                                                                    </div>
                                                                </div>
                                                            </ItemContent>
                                                        </Item>
                                                    </ItemGroup>

                                                    <div className="py-4">
                                                        <h3 className="text-sm font-medium mb-3">Notification position</h3>
                                                        <RadioGroup
                                                            value={notificationSettings.notificationPosition}
                                                            onValueChange={(value) => {
                                                                setNotificationSettings(prev => ({ ...prev, notificationPosition: value }));
                                                                toast.info("Notification position preview", {
                                                                    description: "This is how notifications will appear",
                                                                    position: value as any
                                                                });
                                                            }}
                                                            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                                                        >
                                                            {["top-right", "bottom-right", "bottom-center"].map((pos) => (
                                                                <div key={pos} className="flex flex-col items-center">
                                                                    <div
                                                                        className="w-full cursor-pointer group"
                                                                        onClick={() => {
                                                                            setNotificationSettings(prev => ({ ...prev, notificationPosition: pos }));
                                                                            toast.info("Notification position preview", {
                                                                                description: "This is how notifications will appear",
                                                                                position: pos as any
                                                                            });
                                                                        }}
                                                                    >
                                                                        <div className="relative w-full aspect-video bg-gray-100 rounded-md overflow-hidden flex items-center justify-center transition-colors group-hover:bg-muted/60 group-hover:ring-1 group-hover:ring-primary">
                                                                            <div className="w-full h-full p-2">
                                                                                <div className="overflow-hidden w-full h-full bg-background/80 rounded-sm border border-border/50 relative">
                                                                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200"></div>
                                                                                    <div className="absolute top-3 left-1 w-1/3 h-0.5 bg-gray-200/50 rounded-full"></div>
                                                                                    <div className="absolute top-4 left-1 w-1/4 h-0.5 bg-gray-200/50 rounded-full"></div>
                                                                                    <div className="absolute top-7 left-1 w-1/2 h-0.5 bg-gray-200/50 rounded-full"></div>
                                                                                    <div className={cn(
                                                                                        "absolute m-0.5 w-1/3 h-3 bg-muted-foreground/40 rounded-sm border border-border-muted flex items-center justify-center group-hover:bg-primary/70 group-hover:border-border-primary transition-colors",
                                                                                        pos === "top-right" && "top-0 right-0",
                                                                                        pos === "bottom-right" && "bottom-0 right-0",
                                                                                        pos === "bottom-center" && "bottom-0 left-1/2 transform -translate-x-1/2"
                                                                                    )}>
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
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div className="p-10 rounded-xl border-2 border-dashed border-muted bg-muted/5 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
                                                        <div className="size-12 rounded-full bg-muted/20 flex items-center justify-center">
                                                            <currentTab.icon className="size-6" />
                                                        </div>
                                                        <p className="font-medium">Configure your {currentTab.title}</p>
                                                        <p className="text-xs max-w-xs">Settings and configuration options for this section will appear here.</p>
                                                    </div>

                                                    <div className="space-y-4 pt-4">
                                                        <div className="space-y-2">
                                                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                                                            <div className="h-10 w-full bg-muted/30 rounded" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                                            <div className="h-10 w-full bg-muted/30 rounded" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Spacer - 2 cols */}
                                <div className="col-span-2 hidden xl:block" />
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    )
}
