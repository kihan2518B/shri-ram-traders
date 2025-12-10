'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const userData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error, data } = await supabase.auth.signInWithPassword(userData)
    console.log("data: ", data);

    if (error) {
        console.log("error: ", error);
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                role: formData.get('role') || "patient",
            },
        },
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        console.log("error: ", error);
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
export async function signOut() {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
}
