import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;

  try {
    const loggedINUser = await prisma.user.create({
      data: {
        email,
        username,
        password,
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });
    cookies().set({
      name: "user",
      value: JSON.stringify(loggedINUser),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ message: "Signup successful" }, { status: 201 });
  } catch (prismaError) {
    console.error("Prisma error:", prismaError);
    return NextResponse.json(
      {
        message: "Signup failed due to server error",
      },
      { status: 500 }
    );
  }
}
