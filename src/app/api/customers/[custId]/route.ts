import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: any) {
  try {
    const cookiedata = cookies().get("user")?.value;
    const data = JSON.parse(cookiedata || "{}");
    if (!data || !data.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { custId } = context.params;
    if (!custId)
      return NextResponse.json({ message: "No customer Id" }, { status: 400 });
    const customer = await prisma.customer.findUnique({
      where: {
        id: custId,
      },
      include: {
        invoices: true,
      },
    });
    return NextResponse.json(
      { message: "success", customer },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error while getting customer @/api/customer/[custId]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
