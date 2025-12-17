import InvoicesComponent from "./_components/InvoiceComponent";
import { headers } from "next/headers";

export default async function InvoicesPage() {
  const user = headers().get("x-user");
  return <InvoicesComponent user={user} />;
}
