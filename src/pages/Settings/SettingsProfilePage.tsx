import { PageHeader } from "@/components/page-header";
import { PageWrapper } from "@/components/page-wrapper";
import { usePageTitle } from "@/hooks/use-dynamic-title";
import * as React from "react";
import { SettingsGroup } from "@/components/settings-group";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function SettingsProfilePage() {
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  
  // Dynamic page title
  usePageTitle("Profile & Account Settings");

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
        title="Profile & Account Settings"
        description="Manage your personal profile and account preferences"
        showBreadcrumbs={true}
        customBreadcrumbs={[
          { label: "Settings", href: "/settings/profile", isCurrent: false },
          { label: "Profile & Account", href: "/settings/profile", isCurrent: true },
        ]}
        isLoading={isDataLoading}
      />
      
      <div className="max-w-4xl mx-auto py-6 space-y-6">
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
      </div>
    </PageWrapper>
  );
}