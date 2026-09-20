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

    const invoicesCount = await prisma.invoice.count({
      where: { customerId: custId },
    });

    const invoices = await prisma.invoice.findMany({
      where: { customerId: custId },
      select: { id: true },
    });

    const invoiceIds = invoices.map((i) => i.id);

    const paymentsCount = await prisma.paymentLog.count({
      where: { invoiceId: { in: invoiceIds } },
    });

    return NextResponse.json({
      invoicesCount,
      paymentsCount,
      hasLinkedData: invoicesCount > 0 || paymentsCount > 0,
    });
  } catch (error) {
    console.error("Error checking customer linked data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

