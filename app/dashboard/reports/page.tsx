import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ReportPage from "./_components/ReportPage";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }
  return <ReportPage user={data.user} />;
}
