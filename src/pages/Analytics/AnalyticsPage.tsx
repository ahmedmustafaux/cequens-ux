import { Navigate } from "react-router-dom";
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
    <Navigate to="/analytics/overview" replace />
  );
}
