import { ErrorBoundary } from "@/components/ErrorBoundary";
import OrganizationPage from "@/components/OrganizationsPage";

export default async function Page() {
  return (
    <div>
      <ErrorBoundary>
        <OrganizationPage />
      </ErrorBoundary>
    </div>
  );
}
