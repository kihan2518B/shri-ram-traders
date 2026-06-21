import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: any) {
  try {
    const cookiedata = cookies().get("user")?.value;
    const data = JSON.parse(cookiedata || "{}");
    if (!data || !data.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;
    if (!id)
      return NextResponse.json({ message: "No invoice id" }, { status: 400 });

    const invoice = await prisma.invoice.findUnique({
      where: {
        id: id,
      },
      include: {
        customer: true,
        organization: true,
        payments: true,
      },
    });
    return NextResponse.json({ message: "success", invoice }, { status: 200 });
  } catch (error) {
    console.error("Error while getting invoice @/api/invoices/[id]", error);
    return NextResponse.json(
      { message: "Error while getting invoice" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, context: any) {
  try {
    const cookiedata = cookies().get("user")?.value;
    const userdata = JSON.parse(cookiedata || "{}");
    if (!userdata || !userdata.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const AddPaymentLog = searchParams.get("AddPaymentLog");
    const { id } = context.params;
    if (!id)
      return NextResponse.json({ message: "No invoice id" }, { status: 400 });

    const data = await req.json();

    // Get the current invoice to check the amount
    const currentInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!currentInvoice) {
      return NextResponse.json(
        { message: "Invoice not found" },
        { status: 404 },
      );
    }
    if (AddPaymentLog) {
      if (!data.amount) {
        return NextResponse.json(
          { message: "Amount is required to add payment log" },
          { status: 400 },
        );
      }
      // If payment amount is provided in the request
      if (
        data.amount &&
        data.amount >
          currentInvoice.grandTotal + (Number(currentInvoice?.uplak) || 0)
      ) {
        return NextResponse.json(
          { message: "Payment amount cannot be greater than invoice amount" },
          { status: 400 },
        );
      }

      const payment = await prisma.paymentLog.create({
        data: {
          invoiceId: id,
          amount: `${data.amount}`,
          note: data.note,
          paymentDate: data.paymentDate,
        },
      });
      // Continue with existing COMPLETED status logic
      if (data.status === "COMPLETED") {
        await prisma.invoice.update({
          where: {
            id: id,
          },
          data: {
            status: "COMPLETED",
          },
        });
      }
      return NextResponse.json(
        { message: "Invoice Updated Successfully", payment },
        { status: 200 },
      );
    }
    //update invoice
    const invoice = await prisma.invoice.update({
      where: {
        id: id,
      },
      data: {
        ...data,
      },
      include: {
        customer: true,
        organization: true,
        payments: true,
      },
    });

    return NextResponse.json(
      { message: "Invoice Updated Successfully", invoice },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while updating invoice @/api/invoices/[id]", error);
    return NextResponse.json(
      { message: "Error while updating invoice" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const cookiedata = cookies().get("user")?.value;
    const userdata = JSON.parse(cookiedata || "{}");
    if (!userdata || !userdata.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;
    if (!id)
      return NextResponse.json({ message: "No invoice id" }, { status: 400 });
    const invoice = await prisma.invoice.findUnique({
      where: { id: id },
      select: {
        organizationId: true,
        invoiceType: true,
        invoiceNumber: true,
      },
    });
    const org = await prisma.organization.findUnique({
      where: { id: invoice?.organizationId },
      select: {
        fireWoodInvoiceCount: true,
        invoiceCount: true,
      },
    });
    // if debit invoice then reduce count
    if (invoice?.invoiceType == "DEBIT") {
      // jalau bill
      if (invoice.invoiceNumber.includes("J")) {
        let invoice_number = invoice.invoiceNumber.split("J")[0];
        if (String(invoice_number) == String(org?.fireWoodInvoiceCount)) {
          await prisma.organization.update({
            where: { id: invoice?.organizationId },
            data: {
              fireWoodInvoiceCount: { decrement: 1 },
            },
          });
        }
      } else {
        // sales invoice
        if (String(invoice.invoiceNumber) == String(org?.invoiceCount))
          await prisma.organization.update({
            where: { id: invoice?.organizationId },
            data: {
              invoiceCount: { decrement: 1 },
            },
          });
      }
    }
    await prisma.invoice.delete({
      where: { id: id },
    });
    return NextResponse.json(
      { message: "Invoice Deleted Successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while deleting invoice @/api/invoices/[id]", error);
    return NextResponse.json(
      { message: "Error while deleting invoice" },
      { status: 500 },
    );
  }
}
