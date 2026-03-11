import { PageHeader } from "@/components/page-header";
import { PageWrapper } from "@/components/page-wrapper";
import { usePageTitle } from "@/hooks/use-dynamic-title";
import * as React from "react";
import { SettingsGroup } from "@/components/settings-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, QrCode, Check } from "lucide-react";
import { Item, ItemContent, ItemTitle, ItemDescription } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";

export default function SettingsSecurityPage() {
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  
  // Dynamic page title
  usePageTitle("Security Settings");

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
        title="Security Settings"
        description="Configure your account security and authentication methods"
        showBreadcrumbs={true}
        customBreadcrumbs={[
          { label: "Settings", href: "/settings/profile", isCurrent: false },
          { label: "Security", href: "/settings/security", isCurrent: true },
        ]}
        isLoading={isDataLoading}
      />
      
      <div className="max-w-4xl mx-auto py-6 space-y-6">
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
      </div>
    </PageWrapper>
  );
}
