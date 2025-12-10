import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import InvoicesComponent from './_components/InvoiceComponent'

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect('/login')
  }

  return <InvoicesComponent user={data.user} />
}
