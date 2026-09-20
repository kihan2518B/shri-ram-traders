import { ErrorBoundary } from "@/components/ErrorBoundary";
import BalanceSheetPage from "./_components/BalanceSheetPage";

export default async function Page() {
  return (
    <ErrorBoundary>
      <BalanceSheetPage />
    </ErrorBoundary>
  );
}

