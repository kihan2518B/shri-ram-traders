import { ErrorBoundary } from "@/components/ErrorBoundary";
import EmployeesPage from "./_components/EmployeesPage";

export default function Page() {
  return (
    <ErrorBoundary>
      <EmployeesPage />
    </ErrorBoundary>
  );
}

