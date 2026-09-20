import React from "react";
import InvoiceForm from "../_components/InvoiceForm";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ArrowLeft } from "lucide-react";

export default async function page() {
  const user = headers().get("x-user");

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen w-full space-y-4">
      <Link href="/dashboard/bills" className="inline-block">
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices List
        </Button>
      </Link>
      <ErrorBoundary>
        <InvoiceForm user={user} />
      </ErrorBoundary>
    </div>
  );
}
