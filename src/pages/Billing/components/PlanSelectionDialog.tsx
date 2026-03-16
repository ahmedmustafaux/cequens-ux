import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    Zap, 
    ShieldCheck, 
    CreditCard,
    AlertCircle,
    Smartphone,
    MessageSquare,
    Phone,
    Mail,
    Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PlanSelectionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product: {
        id: string
        name: string
        price: string
        features: string[]
        description: string
        color: string
        rates?: {
            sms: string
            whatsapp: string
            voice: string
            email: string
        }
    } | null
    type: "plan" | "product"
}

export function PlanSelectionDialog({ open, onOpenChange, product, type }: PlanSelectionDialogProps) {
    const [currentStepId, setCurrentStepId] = React.useState<"overview" | "confirm" | "success">("confirm")
    const [isProcessing, setIsProcessing] = React.useState(false)

    // Reset step when dialog closes or product changes
    React.useEffect(() => {
        if (!open) {
            setTimeout(() => setCurrentStepId("confirm"), 300)
        }
    }, [open])

    if (!product) return null

    const handleAction = async () => {
        setIsProcessing(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsProcessing(false)
        setCurrentStepId("success")
        toast.success(`${product.name} plan activated successfully!`)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="size-5 text-primary" />
                        Upgrade Your Plan
                    </DialogTitle>
                    <DialogDescription>
                        Confirm your subscription to the {product.name} tier.
                    </DialogDescription>
                </DialogHeader>

                {/* Content Area */}
                <div className="grid gap-6 py-4">
                    {currentStepId === "overview" && (
                        <div className="space-y-5">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Core Benefits</h4>
                                    <Button 
                                        variant="link" 
                                        size="sm"
                                        onClick={() => setCurrentStepId("confirm")}
                                        className="h-auto p-0 text-[10px] font-bold uppercase tracking-widest"
                                    >
                                        Back to payment
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {product.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/5">
                                            <div className="size-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="size-3 text-green-600" />
                                            </div>
                                            <span className="text-sm text-foreground/80 leading-snug">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {product.rates && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price per Message</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[
                                            { label: "SMS", val: product.rates.sms, icon: Smartphone },
                                            { label: "WhatsApp", val: product.rates.whatsapp, icon: MessageSquare },
                                            { label: "Voice", val: product.rates.voice, icon: Phone },
                                            { label: "Email", val: product.rates.email, icon: Mail },
                                        ].map((rate, i) => (
                                            <div key={i} className="flex flex-col items-center p-2 rounded-lg border bg-background text-center gap-1">
                                                <rate.icon className="size-3 text-muted-foreground" />
                                                <span className="text-[10px] font-medium">{rate.label}</span>
                                                <span className="text-xs font-bold text-primary">{rate.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStepId === "confirm" && (
                        <div className="space-y-5">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subscription Summary</h4>
                                    <Button 
                                        variant="link"
                                        size="sm"
                                        onClick={() => setCurrentStepId("overview")}
                                        className="h-auto p-0 text-[10px] font-bold uppercase tracking-widest"
                                    >
                                        View Tier Details
                                    </Button>
                                </div>
                                <div className="space-y-3 rounded-xl border p-4 bg-muted/10">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{type === "plan" ? "Plan" : "Product"}</span>
                                        <span className="font-bold text-primary">{product.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t pt-3">
                                        <span className="text-muted-foreground">Monthly Commitment</span>
                                        <span className="font-bold">{product.price}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t pt-3">
                                        <span className="text-muted-foreground">Next Payment</span>
                                        <span className="font-bold">April 16, 2026</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment Method</h4>
                                <div className="flex items-center justify-between p-3.5 rounded-xl border bg-background">
                                    <div className="flex items-center gap-3.5">
                                        <div className="size-9 rounded-lg bg-muted flex items-center justify-center border">
                                            <CreditCard className="size-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold leading-none">Visa ending in 4242</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1.5 font-medium">Expires 12/26</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-bold uppercase tracking-widest border">Change</Button>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/5 text-orange-800 border border-orange-200/40">
                                <AlertCircle className="size-4 mt-0.5 shrink-0 text-orange-600" />
                                <p className="text-[11px] leading-relaxed font-medium">
                                    Your trial will be activated immediately. You won't be charged until the trial period ends. You can cancel anytime from your settings.
                                </p>
                            </div>
                        </div>
                    )}

                    {currentStepId === "success" && (
                        <div className="py-8 flex flex-col items-center text-center justify-center">
                            <div className="size-20 rounded-full bg-green-500/10 flex items-center justify-center mb-8">
                                <ShieldCheck className="size-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight mb-3">Activation Complete!</h2>
                            <p className="text-muted-foreground text-sm max-w-[320px] mb-10 leading-relaxed">
                                Your **{product.name}** {type} is now active. We've unlocked all your premium features and channel access.
                            </p>
                            <Button className="w-full" onClick={() => onOpenChange(false)}>
                                Return to Dashboard
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer Actions (not for success) */}
                {currentStepId !== "success" && (
                    <DialogFooter>
                        {currentStepId === "overview" ? (
                            <Button 
                                className="w-full"
                                onClick={() => setCurrentStepId("confirm")}
                            >
                                Back to payment
                            </Button>
                        ) : (
                            <Button 
                                className="w-full"
                                disabled={isProcessing}
                                onClick={handleAction}
                            >
                                {isProcessing ? "Processing..." : `Activate ${type}`}
                            </Button>
                        )}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}
