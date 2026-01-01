// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  console.log(" username, password: ", username, password);
  if (!username || !password) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 500 }
    );
  }
  const loggedINUser = await prisma.user.findUnique({
    where: {
      username: username,
    },
    select: {
      password: true,
      email: true,
      id: true,
    },
  });
  console.log("loggedINUser: ", loggedINUser);
  if (!loggedINUser || loggedINUser.password !== password) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid credentials",
      },
      { status: 401 }
    );
  }
  const user = {
    ...loggedINUser,
  };
  cookies().set({
    name: "user",
    value: JSON.stringify(user),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ success: true, message: "Login successful" });
}
