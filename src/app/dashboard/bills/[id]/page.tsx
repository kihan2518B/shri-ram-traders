import { createClient } from '@/utils/supabase/server'
import { redirect, useParams } from 'next/navigation'
import React from 'react'
import InvoiceDetails from '../_components/InvoiceDetails'
import Link from 'next/link'

export default async function Page() {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
        redirect('/auth/login')
    }

    return (
        <div className='w-full p-6'>
            <Link className='border-2 p-2 rounded' href={'/dashboard/bills'}>Back</Link>
            <InvoiceDetails user={data.user} />
        </div>
    )
}
