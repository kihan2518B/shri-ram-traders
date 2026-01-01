import React from "react";
import InvoiceForm from "../_components/InvoiceForm";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function page() {
  const user = headers().get("x-user");

  return (
    <div className="p-8 bg-gray-100 min-h-screen w-full">
      <Link href="/dashboard/bills" className="mb-4 inline-block">
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          New Invoice
        </Button>
      </Link>
      <ErrorBoundary>
        <InvoiceForm user={user} />
      </ErrorBoundary>
    </div>
  );
}
