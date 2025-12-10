import { redirect } from 'next/navigation'
import CustomerForm from './_components/CustomerForm'
import CustomersList from './_components/CustomersList'
import { createClient } from '@/utils/supabase/server'

export default async function CustomersPage() {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()

    if (!data) {
        redirect('/login')
    }
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">customers</h1>
            <CustomerForm user={data.user!} />
            {data.user && (
                <CustomersList user={data.user!} />
            )}
        </div>
    )
}