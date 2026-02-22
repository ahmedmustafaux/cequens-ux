import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usePageTitle } from "@/hooks/use-dynamic-title"
import { PageWrapper } from "@/components/page-wrapper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CardSkeleton } from "@/components/ui/card"
import { PageHeaderProfile } from "@/components/page-header"
import { motion } from "framer-motion"
import { smoothTransition } from "@/lib/transitions"
import {
    BarChart3,
    Users,
    Clock,
    Send,
    CheckCircle2,
    AlertCircle,
    Calendar,
    MessageSquare,
    Eye,
    MoreVertical,
    Trash2,
    Copy
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCampaign, useDeleteCampaign } from "@/hooks/use-campaigns"
import { useNavigationContext } from "@/hooks/use-navigation-context"
import NotFoundPage from "../General/NotFoundPage"
import { IPhoneMockup } from "react-device-mockup"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function CampaignDetailPage() {
    const params = useParams()
    const navigate = useNavigate()
    const campaignId = params.id as string

    // Fetch campaign from database
    const { data: campaign, isLoading, error } = useCampaign(campaignId)
    const deleteCampaign = useDeleteCampaign()

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

    // Dynamic page title and breadcrumb
    const { setBreadcrumbOverride } = useNavigationContext()
    const campaignName = campaign?.name || 'Campaign Details'
    usePageTitle(campaignName)

    React.useEffect(() => {
        if (campaign?.name && campaignId) {
            setBreadcrumbOverride(campaignId, campaign.name)
        }
    }, [campaign?.name, campaignId, setBreadcrumbOverride])

    // Handle back navigation
    const handleBack = () => {
        navigate("/engage/campaigns")
    }

    const handleDelete = () => {
        deleteCampaign.mutate(campaignId, {
            onSuccess: () => {
                toast.success("Campaign deleted successfully")
                setIsDeleteDialogOpen(false)
                navigate("/engage/campaigns")
            },
            onError: (err) => {
                toast.error("Failed to delete campaign")
                console.error(err)
            }
        })
    }

    // Show loading state
    if (isLoading) {
        return (
            <PageWrapper isLoading={true}>
                <PageHeaderProfile
                    title="Loading..."
                    onBack={handleBack}
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                    <div>
                        <CardSkeleton />
                    </div>
                </div>
            </PageWrapper>
        )
    }

    // Show 404 state if not found or error
    if (error || !campaign) {
        return <NotFoundPage />
    }

    const isFuture = campaign.sent_date && new Date(campaign.sent_date) > new Date()
    const isDraft = campaign.status === "Draft"
    const isRecurring = campaign.schedule_type === "recurring"

    return (
        <PageWrapper>
            <PageHeaderProfile
                title={campaign.name}
                onBack={handleBack}
                actions={
                    <div className="flex items-center gap-2">
                        {isDraft && (
                            <Button onClick={() => navigate(`/engage/campaigns/create`, { state: { campaign } })}>
                                Edit Draft
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast.info("Duplicate not implemented")}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer group">
                                    <Trash2 className="h-4 w-4 mr-2 text-destructive group-focus:text-destructive group-hover:text-destructive" />
                                    <span className="text-destructive font-medium group-focus:text-destructive group-hover:text-destructive">Delete Campaign</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                }
            />

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Campaign</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this campaign? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleteCampaign.isPending}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteCampaign.isPending}>
                            {deleteCampaign.isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={smoothTransition}
                className="flex flex-col gap-4"
            >
                {/* Status Banner */}
                <div className={cn(
                    "relative overflow-hidden p-5 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:shadow-md",
                    isDraft ? "bg-gradient-to-br from-gray-50/80 to-gray-100/50 border-gray-200/60 dark:from-zinc-900/80 dark:to-zinc-800/50 dark:border-zinc-800/60" :
                        isRecurring ? "bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 border-emerald-200/60 dark:from-emerald-950/40 dark:to-emerald-900/20 dark:border-emerald-900/40" :
                            isFuture ? "bg-gradient-to-br from-blue-50/80 to-blue-100/50 border-blue-200/60 dark:from-blue-950/40 dark:to-blue-900/20 dark:border-blue-900/40" :
                                "bg-gradient-to-br from-indigo-50/80 to-indigo-100/50 border-indigo-200/60 dark:from-indigo-950/40 dark:to-indigo-900/20 dark:border-indigo-900/40"
                )}>
                    {/* Modern background blur/glow effect */}
                    <div className={cn(
                        "absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500",
                        isDraft ? "bg-gray-400 dark:bg-gray-600" :
                            isRecurring ? "bg-emerald-500 dark:bg-emerald-600" :
                                isFuture ? "bg-blue-500 dark:bg-blue-600" :
                                    "bg-indigo-500 dark:bg-indigo-600"
                    )} />

                    <div className="flex items-center gap-4 relative z-10">
                        <div className={cn(
                            "p-2.5 rounded-xl border shadow-sm backdrop-blur-sm",
                            isDraft ? "bg-white/90 border-gray-200 text-gray-600 dark:bg-zinc-900/50 dark:border-zinc-800/80 dark:text-gray-400" :
                                isRecurring ? "bg-white/90 border-blue-200 text-blue-600 dark:bg-blue-900/50 dark:border-blue-800/80 dark:text-blue-400" :
                                    isFuture ? "bg-white/90 border-gray-200 text-gray-600 dark:bg-zinc-900/50 dark:border-zinc-800/80 dark:text-gray-400" :
                                        "bg-white/90 border-green-200 text-green-600 dark:bg-green-900/50 dark:border-green-800/80 dark:text-green-400"
                        )}>
                            {isDraft ? <AlertCircle className="h-5 w-5" /> :
                                isRecurring ? <Clock className="h-5 w-5" /> :
                                    isFuture ? <Calendar className="h-5 w-5" /> :
                                        <Send className="h-5 w-5" />}
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-sm tracking-tight text-foreground">
                                {isDraft ? "This campaign is a draft" :
                                    isRecurring ? "This campaign is running on a schedule" :
                                        isFuture ? `Scheduled for ${new Date(campaign.sent_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${new Date(campaign.sent_date!).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` :
                                            `Sent on ${new Date(campaign.sent_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${new Date(campaign.sent_date!).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">
                                {isDraft ? "Complete the setup to launch it." :
                                    isRecurring ? "Delivering messages based on your weekly time-grid." :
                                        isFuture ? "We'll start sending at the scheduled time." :
                                            "Delivery completed successfully."}
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className={cn(
                        "relative z-10 font-bold uppercase tracking-wider text-[10px] px-3 py-1 rounded-full border shadow-sm backdrop-blur-sm",
                        isDraft ? "bg-white/90 border-gray-200 text-gray-700 dark:bg-zinc-800/90 dark:border-zinc-700 dark:text-gray-300" :
                            isRecurring ? "bg-white/90 border-blue-200 text-blue-700 dark:bg-blue-900/50 dark:border-blue-800/80 dark:text-blue-400" :
                                isFuture ? "bg-white/90 border-gray-200 text-gray-700 dark:bg-zinc-800/90 dark:border-zinc-700 dark:text-gray-300" :
                                    "bg-white/90 border-green-200 text-green-700 dark:bg-green-900/50 dark:border-green-800/80 dark:text-green-400"
                    )}>
                        <div className="flex items-center gap-1.5">
                            <div className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                isDraft ? "bg-gray-400 shadow-[0_0_8px] shadow-gray-400/50" :
                                    isRecurring ? "bg-blue-500 animate-pulse shadow-[0_0_8px] shadow-blue-500/50" :
                                        isFuture ? "bg-gray-400 shadow-[0_0_8px] shadow-gray-400/50" :
                                            "bg-green-500 shadow-[0_0_8px] shadow-green-500/50"
                            )} />
                            {isRecurring ? "Running" : isFuture ? "Scheduled" : campaign.status === "Active" ? "Sent" : campaign.status}
                        </div>
                    </Badge>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Recipients
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{campaign.recipients.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Delivery Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{campaign.delivery_rate}%</div>
                            <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${campaign.delivery_rate}%` }} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Channel
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{campaign.channel}</div>
                            <p className="text-xs text-muted-foreground mt-1">{campaign.type}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Sent Date
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-semibold whitespace-nowrap text-foreground">
                                {campaign.sent_date ? new Date(campaign.sent_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                                {campaign.sent_date ? new Date(campaign.sent_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'Not sent yet'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Campaign Info & Content Review */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <CardTitle>Content Review</CardTitle>
                            </div>
                            <CardDescription>How the message appears to your recipients</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row gap-4 items-start">
                            {/* Mobile Mockup */}
                            <div className="w-full md:w-[320px] h-[550px] flex-shrink-0 bg-muted/20 rounded-xl overflow-hidden flex justify-center items-start pt-4 border">
                                <IPhoneMockup
                                    screenWidth={280}
                                    screenType="notch"
                                    frameColor="#1f2937"
                                    hideStatusBar={true}
                                >
                                    <div className={cn(
                                        "pt-4 w-full h-full relative",
                                        campaign.channel === "Whatsapp" ? "bg-[#efeae9] dark:bg-zinc-900" : "bg-white dark:bg-zinc-950"
                                    )}>
                                        {campaign.channel === "Whatsapp" && (
                                            <div
                                                className="absolute inset-0 opacity-[0.08]"
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='whatsapp-pattern' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='15' cy='15' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='45' cy='20' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='75' cy='25' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='25' cy='40' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='55' cy='45' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='85' cy='50' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='35' cy='65' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='65' cy='70' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='20' cy='85' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='50' cy='90' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3Ccircle cx='80' cy='95' r='1.2' fill='%23a4a4a4' opacity='0.4'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23whatsapp-pattern)'/%3E%3C/svg%3E")`,
                                                    backgroundSize: '100px 100px',
                                                }}
                                            />
                                        )}
                                        <div className="relative z-10 flex flex-col h-full px-4 pt-2">
                                            {/* Chat Bubble Simulation */}
                                            <div className="mt-4 flex flex-col">
                                                <div className="flex justify-start">
                                                    <div className={cn(
                                                        "relative max-w-[85%] px-3 py-2 rounded-lg shadow-sm text-sm",
                                                        campaign.channel === "Whatsapp"
                                                            ? "bg-white dark:bg-zinc-800 text-foreground"
                                                            : "bg-muted text-foreground"
                                                    )}>
                                                        <p className="leading-relaxed">
                                                            {campaign.channel === "Whatsapp" ?
                                                                "Hello! We're excited to share our latest updates with you. Click the button below to learn more about our new features." :
                                                                `CeQuens: Your campaign "${campaign.name}" has been processed for ${campaign.recipients} recipients.`
                                                            }
                                                        </p>
                                                        <div className="flex items-center justify-end gap-1 mt-1 opacity-50">
                                                            <span className="text-[10px]">9:41 AM</span>
                                                            {campaign.channel === "Whatsapp" && (
                                                                <CheckCircle2 className="h-3 w-3 text-blue-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </IPhoneMockup>
                            </div>

                            {/* Template Content Summary */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Message Content</h4>
                                    <div className="p-4 rounded-lg bg-muted/30 border text-sm space-y-3">
                                        <p><strong>Channel:</strong> {campaign.channel}</p>
                                        <p><strong>Strategy:</strong> {campaign.type}</p>
                                        <div className="h-px bg-border my-2" />
                                        <p className="text-muted-foreground italic">
                                            {campaign.channel === "Whatsapp" ?
                                                "Using 'product_announcement' template with dynamic variables." :
                                                "Custom SMS message body."
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Dynamic Variables</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2 rounded border bg-background flex flex-col">
                                            <span className="text-[10px] text-muted-foreground uppercase">Variable 1</span>
                                            <span className="text-xs font-medium">Customer Name</span>
                                        </div>
                                        <div className="p-2 rounded border bg-background flex flex-col">
                                            <span className="text-[10px] text-muted-foreground uppercase">Variable 2</span>
                                            <span className="text-xs font-medium">Order Number</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-[#0ea5e9]/5 border border-[#0ea5e9]/20">
                                    <p className="text-xs text-[#0ea5e9] font-medium leading-relaxed">
                                        This is a preview based on the template used during campaign creation. For live delivery details, please check the logs.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="self-start">
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6">
                            {(() => {
                                const total = campaign.recipients || 0
                                const deliveredCount = Math.round((total * (campaign.delivery_rate || 0)) / 100)
                                const readCount = Math.round((total * (campaign.read_rate || 0)) / 100)
                                const sentCount = total
                                const failedCount = Math.max(0, sentCount - deliveredCount)
                                const failedRate = sentCount > 0 ? Math.round((failedCount / sentCount) * 100) : 0

                                const stats = [
                                    { label: "Sent", value: sentCount, rate: 100, icon: Send, color: "text-muted-foreground/60", bg: "bg-muted/40" },
                                    { label: "Delivered", value: deliveredCount, rate: campaign.delivery_rate, icon: CheckCircle2, color: "text-muted-foreground/60", bg: "bg-muted/40" },
                                    { label: "Read", value: readCount, rate: campaign.read_rate, icon: MessageSquare, color: "text-muted-foreground/60", bg: "bg-muted/40" },
                                    { label: "Failed", value: failedCount, rate: failedRate, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
                                ]

                                return stats.map((stat, index) => (
                                    <div key={stat.label} className="relative flex items-start gap-4">
                                        {/* Vertical Dashed Connector */}
                                        {index < stats.length - 1 && (
                                            <div className="absolute left-[16px] top-[40px] bottom-[-32px] w-px border-l-[1.5px] border-dashed border-border/60" />
                                        )}

                                        <div className={cn("relative z-10 p-2 rounded-full", stat.bg, stat.color)}>
                                            <stat.icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col min-w-0 pt-0.5">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1.5">{stat.label}</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className={cn("text-lg font-bold tracking-tight truncate", stat.label === "Failed" && "text-red-600")}>
                                                    {stat.value.toLocaleString()}
                                                </span>
                                                <span className="text-[10px] font-medium text-muted-foreground/60">
                                                    {stat.rate}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            })()}
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </PageWrapper>
    )
}
