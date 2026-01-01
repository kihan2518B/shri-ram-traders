import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookiedata = cookies().get("user")?.value;
  const data = JSON.parse(cookiedata || "{}");
  if (!data || !data.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    gstNumber,
    address,
    bankName,
    accountNumber,
    ifscCode,
    userId,
    logo,
  } = body;
  console.log("body: ", data);
  try {
    const organization = await prisma.organization.create({
      data: {
        name,
        userId: data.id,
        gstNumber,
        address,
        bankName,
        accountNumber,
        ifscCode,
        logo: logo || "",
      },
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const cookiedata = cookies().get("user")?.value;

    const data = JSON.parse(cookiedata || "{}");
    console.log("data ord`: ", data);

    if (!data || !data.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizations = await prisma.organization.findMany({
      where: { userId: data.id },
    });
    return NextResponse.json(
      { message: "Success", organizations },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error while getting organizations @/api/organizations", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
