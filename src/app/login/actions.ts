import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function login(formData: FormData): Promise<{
  success: boolean;
  message: string;
}> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { success: false, message: error?.message ?? "Login failed" };
  }

  cookies().set({
    name: "user",
    value: data.user.id,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { success: true, message: "Login successful" };
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error, data } = await supabase.auth.signUp({ email, password });

  if (error) {
    return {
      success: false,
      message: error.message || "Signup failed",
    };
  }

  try {
    await prisma.user.create({
      data: {
        email,
        id: data.user?.id as string,
      },
    });

    return {
      success: true,
      message: "Signup successful",
    };
  } catch (prismaError) {
    console.error("Prisma error:", prismaError);
    return {
      success: false,
      message: "Failed to create user in database",
    };
  }
}
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  cookies().delete("user");

  redirect("/login");
}
