import { redirect } from "next/navigation";
import CustomerForm from "./_components/CustomerForm";
import CustomersList from "./_components/CustomersList";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function CustomersPage() {
  const supabase = await createClient();
  const user = headers().get("x-user");
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">customers</h1>
      <ErrorBoundary>
        <CustomerForm user={String(user)} />
        {user && <CustomersList user={user} />}
      </ErrorBoundary>
    </div>
  );
}
