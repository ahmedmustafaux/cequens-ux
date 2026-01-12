import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { FileQuestion } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PageWrapper } from "@/components/page-wrapper";
import { TimeFilter } from "@/components/time-filter";
import { TableSkeleton } from "@/components/ui/table";
import { usePageTitle } from "@/hooks/use-dynamic-title";
import * as React from "react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("30d");
  const [isDataLoading, setIsDataLoading] = React.useState(true);

  // Dynamic page title
  usePageTitle("Analytics");

  // Simulate initial data loading from server
  React.useEffect(() => {
    setIsDataLoading(true);
    const timer = setTimeout(() => {
      setIsDataLoading(false);
    }, 400); // Standard 400ms loading time for server data

    return () => clearTimeout(timer);
  }, []);

  // Simulate data loading when time range changes
  React.useEffect(() => {
    if (timeRange) {
      setIsDataLoading(true);
      const timer = setTimeout(() => {
        setIsDataLoading(false);
      }, 300); // Standard 300ms loading time for time range change

      return () => clearTimeout(timer);
    }
  }, [timeRange]);

  return (
    <PageWrapper isLoading={isDataLoading}>
      <PageHeader
        title="Analytics"
        description="Analyze your communication platform performance"
        showBreadcrumbs={false}
        showFilters={true}
        filters={<TimeFilter value={timeRange} onValueChange={(value) => {
          if (typeof value === 'string') {
            setTimeRange(value)
          }
        }} isLoading={isDataLoading} mode="simple" />}
        isLoading={isDataLoading}
      />
      
      <div className="flex flex-col">
        {isDataLoading ? (
          <>
            <TableSkeleton rows={4} columns={4} />
            <TableSkeleton rows={4} columns={4} />
          </>
        ) : (
          <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestion />
          </EmptyMedia>
          <EmptyTitle>Coming Soon</EmptyTitle>
          <EmptyDescription>
            This feature is currently under development and will be available soon.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
        )}
      </div>
    </PageWrapper>
  );
}
