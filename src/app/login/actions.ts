import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers';

export async function login(formData: FormData): Promise<{
    success: boolean
    message: string
    data?: any
}> {
    const supabase = await createClient()
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        return { success: false, message: error.message }
    }

    // Set a cookie manually if needed
    const cookieStore = cookies()
    cookieStore.set('user', JSON.stringify({ id: data.user?.id, email }), {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return { success: true, message: "Login successful", data }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error, data } = await supabase.auth.signUp({ email, password })

    if (error) {
        return {
            success: false,
            message: error.message || 'Signup failed',
        }
    }

    try {
        await prisma.user.create({
            data: {
                email,
                id: data.user?.id as string,
            },
        })

        return {
            success: true,
            message: 'Signup successful',
        }
    } catch (prismaError) {
        console.error("Prisma error:", prismaError)
        return {
            success: false,
            message: 'Failed to create user in database',
        }
    }
}
export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();

    const cookieStore = cookies();
    cookieStore.delete('user');

    revalidatePath('/', 'layout');
    redirect('/login');
}
