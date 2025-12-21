import React from "react";
import InvoiceDetails from "../_components/InvoiceDetails";
import Link from "next/link";
import { headers } from "next/headers";

export default async function Page() {
  const user = headers().get("x-user");

  return (
    <div className="w-full p-6">
      <Link className="border-2 p-2 rounded" href={"/dashboard/bills"}>
        Back
      </Link>
      <InvoiceDetails user={String(user)} />
    </div>
  );
}
