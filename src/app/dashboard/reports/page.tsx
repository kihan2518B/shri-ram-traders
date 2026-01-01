import { ErrorBoundary } from "@/components/ErrorBoundary";
import ReportPage from "./_components/ReportPage";

export default async function Page() {
  return (
    <ErrorBoundary>
      <ReportPage />
    </ErrorBoundary>
  );
}
