import React from 'react'
import InvoiceForm from '../_components/InvoiceForm'
import { createClient } from '@/utils/supabase/server'

export default async function page() {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if(!data.user){
        return <></>
    }
    return (
        <div>
            <InvoiceForm user={data.user}/>
        </div>
    )
}
