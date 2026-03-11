import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Landmark, Wallet, ShieldCheck, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TopupDialog({ open, onOpenChange }: TopupDialogProps) {
  const [copied, setCopied] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="size-5 text-primary" />
            Top up balance
          </DialogTitle>
          <DialogDescription>
            Select your preferred payment method to add funds to your account.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full">
          <Tabs defaultValue="credit-card" className="w-full mt-2">
            <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-auto mb-2">
              <TabsTrigger value="credit-card" className="px-4">Card</TabsTrigger>
              <TabsTrigger value="paypal" className="px-4">PayPal</TabsTrigger>
              <TabsTrigger value="bank" className="px-4">Bank</TabsTrigger>
            </TabsList>

            <div className="mt-4 h-[400px]">
              {/* Credit Card View */}
              <TabsContent value="credit-card" className="m-0 space-y-6">
                <div className="grid gap-2 mb-6">
                  <Label htmlFor="topupAmount">Amount to top up</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="topupAmount" type="number" placeholder="0.00" className="pl-7 text-lg font-medium" />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="grid gap-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative">
                      <Input id="cardNumber" placeholder="0000 0000 0000 0000" />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 items-center">
                        <VisaLogo className="h-4 w-7" />
                        <MastercardLogo className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM / YY" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input id="cardName" placeholder="John Doe" />
                  </div>
                </div>
                <Button className="w-full mt-4">
                  Continue with Card
                </Button>
              </TabsContent>

              {/* PayPal View */}
              <TabsContent value="paypal" className="m-0 h-full flex flex-col pt-2">
                <div className="grid gap-2 mb-8">
                  <Label htmlFor="paypalTopupAmount">Amount to top up</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="paypalTopupAmount" type="number" placeholder="0.00" className="pl-7 text-lg font-medium" />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center flex-1 text-center space-y-6 border-t pt-8 pb-4">
                  <PayPalFullLogo className="h-8 w-auto text-blue-600" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground w-4/5 mx-auto">
                      You will be redirected to PayPal to securely complete your payment.
                    </p>
                  </div>
                  <div className="mt-auto w-full pt-4">
                    <Button className="w-full bg-[#0070ba] hover:bg-[#003087] text-white">
                      Continue with PayPal
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Bank Transfer View */}
              <TabsContent value="bank" className="m-0 h-full flex flex-col space-y-4 pt-2">
                <div className="bg-muted p-4 rounded-md space-y-4">
                  <div className="grid gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Bank Name</span>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Chase Manhattan Bank</p>
                      <button onClick={() => handleCopy("Chase Manhattan Bank", "bank")} className="text-muted-foreground hover:text-foreground">
                        {copied === "bank" ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Account Number</span>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium font-mono">1234 5678 9012 3456</p>
                      <button onClick={() => handleCopy("1234567890123456", "acc")} className="text-muted-foreground hover:text-foreground">
                        {copied === "acc" ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-1">
                    <span className="text-xs font-medium text-muted-foreground">IBAN</span>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium font-mono">US89 CHASE 0012 3456 7890 12</p>
                      <button onClick={() => handleCopy("US89CHASE00123456789012", "iban")} className="text-muted-foreground hover:text-foreground">
                        {copied === "iban" ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 text-sm text-muted-foreground bg-primary/5 p-3 rounded-md">
                  <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    Include your <span className="font-medium text-foreground">Customer ID (C-10293)</span> in the transfer reference.
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Logo Components
function VisaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.9 33.3L22 14.7H26.8L23.7 33.3H18.9ZM39.6 15.2C38.6 14.8 37.1 14.4 35.3 14.4C30.8 14.4 27.6 16.8 27.6 20.3C27.6 22.8 29.8 24.2 31.6 25.1C33.4 25.9 34 26.5 34 27.3C34 28.5 32.5 29 31.2 29C29.7 29 28.3 28.5 27.2 28.1L26.4 31.9C27.5 32.4 29.3 32.9 31.3 32.9C36.1 32.9 39.1 30.5 39.1 26.9C39.1 20.7 30.6 20.4 30.6 17.5C30.6 16.6 31.4 15.7 33.2 15.7C34.6 15.7 36 16.1 36.9 16.5L39.6 15.2ZM47.6 14.7H43.9C42.8 14.7 41.9 15.1 41.4 16.1L35.4 33.3H40.4L41.3 29.3H47.4L47.9 33.3H52.4L47.6 14.7ZM42.5 25.6L44.2 18.2L45.2 25.6H42.5ZM13.8 14.7L9.1 29L8.6 26.3C7.5 22.1 4.3 18.1 0 16.2L0.1 15.7H7.7C8.7 15.7 9.6 16.4 9.9 17.4L11.7 26.4L16.4 14.7H21.4L13.8 33.3H8.9L13.8 14.7Z" fill="#1A1F71"/>
    </svg>
  );
}

function MastercardLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="12" r="7" fill="#EB001B" />
      <circle cx="17" cy="12" r="7" fill="#F79E1B" />
      <path d="M12 12a6.99 6.99 0 0 1 2.37-5.22c-1.35-.91-3-1.44-4.77-1.44-4.2 0-7.6 3.4-7.6 7.66s3.4 7.66 7.6 7.66c1.77 0 3.42-.53 4.77-1.44A6.99 6.99 0 0 1 12 12z" fill="#EB001B" />
      <path d="M12 12a6.99 6.99 0 0 0 -2.37 5.22c1.35.91 3 1.44 4.77 1.44 4.2 0 7.6-3.4 7.6-7.66s-3.4-7.66-7.6-7.66c-1.77 0-3.42.53-4.77 1.44A6.99 6.99 0 0 0 12 12z" fill="#F79E1B" opacity="0.8" />
    </svg>
  );
}

function PayPalFullLogo({ className, textClassName }: { className?: string, textClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.528 7.322C18.528 3.278 15.655 0 11.083 0H2.571C1.942 0 1.411 0.473 1.3 1.09L0.00501099 13.911C-0.088989 14.838 0.627011 15.65 1.55401 15.65H5.87501L5.19501 22.383C5.10101 23.31 5.81701 24.122 6.74401 24.122H8.38101C9.01001 24.122 9.54101 23.649 9.65201 23.033L10.741 12.25C10.852 11.144 11.787 10.3 12.898 10.3H14.777C16.848 10.3 18.528 8.966 18.528 7.322Z" fill="#253B80"/>
        <path d="M23.992 9.42001C23.992 5.06801 20.842 1.50301 15.939 1.50301H10.19C9.561 1.50301 9.03 1.97601 8.919 2.59301L6.726 24.271C6.632 25.198 7.348 26.01 8.275 26.01H12.336C12.965 26.01 13.496 25.537 13.607 24.92L14.475 16.326C14.586 15.22 15.521 14.376 16.632 14.376H17.766C21.21 14.376 23.992 12.968 23.992 9.42001Z" fill="#179BD7" style={{ mixBlendMode: 'multiply' }}/>
        <path d="M23.992 9.42001C23.992 5.06801 20.842 1.50301 15.939 1.50301H10.19C9.561 1.50301 9.03 1.97601 8.919 2.59301L6.726 24.271C6.632 25.198 7.348 26.01 8.275 26.01H12.336C12.965 26.01 13.496 25.537 13.607 24.92L14.475 16.326C14.586 15.22 15.521 14.376 16.632 14.376H17.766C21.21 14.376 23.992 12.968 23.992 9.42001Z" fill="#179BD7"/>
      </svg>
      <span className={cn("text-xl font-bold tracking-tighter text-blue-800 flex items-baseline", textClassName)}>
        Pay<span className="text-blue-500">Pal</span>
      </span>
    </div>
  );
}
