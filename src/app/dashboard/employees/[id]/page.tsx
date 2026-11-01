import { ErrorBoundary } from "@/components/ErrorBoundary";
import EmployeeDetailPage from "./_components/EmployeeDetailPage";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <EmployeeDetailPage employeeId={params.id} />
    </ErrorBoundary>
  );
}

