import { PageHeader } from "@/components/page-header";
import { PageWrapper } from "@/components/page-wrapper";
import { usePageTitle } from "@/hooks/use-dynamic-title";
import * as React from "react";
import { SettingsGroup } from "@/components/settings-group";
import { Input } from "@/components/ui/input";

export default function SettingsCompanyPage() {
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  
  // Dynamic page title
  usePageTitle("Company Details");

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
        title="Company Details"
        description="Manage company information and branding"
        showBreadcrumbs={true}
        customBreadcrumbs={[
          { label: "Settings", href: "/settings/profile", isCurrent: false },
          { label: "Company Details", href: "/settings/company", isCurrent: true },
        ]}
        isLoading={isDataLoading}
      />
      
      <div className="max-w-4xl mx-auto py-6 space-y-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </PageWrapper>
  );
}
