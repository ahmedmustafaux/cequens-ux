import { PageHeader } from "@/components/page-header";
import { PageWrapper } from "@/components/page-wrapper";
import { usePageTitle } from "@/hooks/use-dynamic-title";
import * as React from "react";
import { SettingsGroup } from "@/components/settings-group";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Item, ItemContent, ItemTitle, ItemDescription } from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";

export default function SettingsOrganizationPage() {
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  
  // Dynamic page title
  usePageTitle("Users & Permissions");

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
        title="Users & Permissions"
        description="Manage team members and their roles"
        showBreadcrumbs={true}
        customBreadcrumbs={[
          { label: "Settings", href: "/settings/profile", isCurrent: false },
          { label: "Users & Permissions", href: "/settings/organization", isCurrent: true },
        ]}
        isLoading={isDataLoading}
      />
      
      <div className="max-w-4xl mx-auto py-6 space-y-6">
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
      </div>
    </PageWrapper>
  );
}