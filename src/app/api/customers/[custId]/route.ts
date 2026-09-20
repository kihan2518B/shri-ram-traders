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

export async function PUT(req: Request, context: any) {
  try {
    const cookiedata = cookies().get("user")?.value;
    const data = JSON.parse(cookiedata || "{}");
    if (!data || !data.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { custId } = context.params;
    const body = await req.json();

    const updatedCustomer = await prisma.customer.update({
      where: { id: custId, userId: data.id },
      data: {
        name: body.name,
        gstNumber: body.gstNumber,
        address: body.address,
      },
    });

    return NextResponse.json({ message: "Customer updated", customer: updatedCustomer });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const cookiedata = cookies().get("user")?.value;
    const data = JSON.parse(cookiedata || "{}");
    if (!data || !data.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { custId } = context.params;

    // Prisma onDelete: Cascade is configured on customer model for invoices
    await prisma.customer.delete({
      where: { id: custId, userId: data.id },
    });

    return NextResponse.json({ message: "Customer and linked records deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
