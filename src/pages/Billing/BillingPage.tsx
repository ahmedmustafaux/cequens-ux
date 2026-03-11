import { PageHeader } from "@/components/page-header";
import { PageWrapper } from "@/components/page-wrapper";
import { usePageTitle } from "@/hooks/use-dynamic-title";
import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction, CardSkeleton } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard, Plus, HelpCircle, ArrowUpRight, TrendingUp } from "lucide-react";
import { TopupDialog } from "./components/TopupDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function BillingPage() {
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const [isTopupOpen, setIsTopupOpen] = React.useState(false);
  
  // Dynamic page title
  usePageTitle("Billing & Subscription");

  // Simulate initial data loading from server
  React.useEffect(() => {
    setIsDataLoading(true);
    const timer = setTimeout(() => {
      setIsDataLoading(false);
    }, 400); // Standard 400ms loading time for server data

    return () => clearTimeout(timer);
  }, []);

  return (
    <PageWrapper isLoading={isDataLoading}>
      <PageHeader
        title="Billing & Subscription"
        description="Manage your billing information and subscription plans"
        showBreadcrumbs={false}
        isLoading={isDataLoading}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Available Balance Card */}
        {isDataLoading ? (
          <CardSkeleton />
        ) : (
          <Card className="relative overflow-hidden border-primary/10 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-shadow duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="size-24 -mr-8 -mt-8" />
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="flex items-center gap-1.5 font-medium text-foreground/70 uppercase text-[10px] tracking-widest">
                  <Wallet className="size-3.5 text-primary" />
                  Available Balance
                </CardDescription>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <HelpCircle className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Your current account funds available for use.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight mt-1">$1,250.00</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium border border-green-500/10">
                  <ArrowUpRight className="size-3" />
                  +12.5%
                </div>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Since last month</span>
              </div>
            </CardContent>
            <div className="px-4 pb-4">
              <Button 
                onClick={() => setIsTopupOpen(true)}
                className="w-full h-10 font-semibold group relative overflow-hidden"
              >
                <Plus className="size-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Top up balance
                <div className="hidden @lg/card-header:block">
                  <CardAction />
                </div>
              </Button>
            </div>
          </Card>
        )}

        {/* Credit Limit Card */}
        {isDataLoading ? (
          <CardSkeleton />
        ) : (
          <Card className="relative overflow-hidden border-orange-500/10 shadow-lg shadow-orange-500/5 hover:shadow-orange-500/10 transition-shadow duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard className="size-24 -mr-8 -mt-8 text-orange-600" />
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="flex items-center gap-1.5 font-medium text-foreground/70 uppercase text-[10px] tracking-widest">
                  <CreditCard className="size-3.5 text-orange-500" />
                  Credit Limit
                </CardDescription>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <HelpCircle className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">The maximum credit amount allowed for your account.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight mt-1 text-orange-600">$5,000.00</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mt-3">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Usage</span>
                  <span>45% Used</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full w-[45%]" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="size-3 text-orange-500" />
                  <span>Remaining: <strong>$2,750.00</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <TopupDialog open={isTopupOpen} onOpenChange={setIsTopupOpen} />

      {/* Other billing content placeholder */}
      <div className="border-2 border-dashed border-muted rounded-2xl p-12 text-center">
        <div className="bg-muted/50 rounded-full size-16 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="size-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">Invoices & Usage</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2">
          Your transaction history and detailed usage reports will appear here as you start using your balance.
        </p>
      </div>
    </PageWrapper>
  );
}