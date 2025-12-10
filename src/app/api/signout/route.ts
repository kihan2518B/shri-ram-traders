import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
    const supabase = await createClient()

    await supabase.auth.signOut()

    const cookieStore = cookies()
    cookieStore.delete('user')

    return NextResponse.redirect(new URL('/login', req.url))
}
