import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import webPush from "@/lib/wep-push";

type inputBody = {
  customerId: string;
  organizationId: string;
  items: item[];
  totalAmount: number;
  gstAmount: number;
  grandTotal: number;
  vehicalNumber: string;
  gstPercentage: number;
  invoiceType: string;
  referenceInvoiceNumber: string;
  uplak?: string;
};

type item = {
  name: string;
  unit: string;
  price: string;
  amount: string;
  hsncode: string;
  quantity: string;
};

export async function POST(request: Request) {
  const cookiedata = cookies().get("user")?.value;
  const data = JSON.parse(cookiedata || "{}");
  if (!data) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as inputBody;
  const {
    referenceInvoiceNumber,
    customerId,
    organizationId,
    items,
    totalAmount,
    gstAmount,
    grandTotal,
    gstPercentage,
    uplak,
    vehicalNumber,
    invoiceType,
  } = body;

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }
    const isFireWood = items.some((item) => item.name === "FireWood");
    const invNumber = `${
      referenceInvoiceNumber
        ? referenceInvoiceNumber
        : isFireWood
        ? `${organization.fireWoodInvoiceCount + 1} J`
        : organization.invoiceCount + 1
    }`;
    const invoice = await prisma.invoice.create({
      data: {
        userId: data.id,
        invoiceNumber: invNumber,
        customerId,
        organizationId,
        items,
        gstPercentage,
        totalAmount,
        grandTotal,
        gstAmount,
        uplak,
        vehicalNumber,
        status: "PENDING",
        invoiceType,
      },
    });

    if (invoice.invoiceType == "DEBIT") {
      if (isFireWood) {
        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            fireWoodInvoiceCount: organization.fireWoodInvoiceCount + 1,
          },
        });
      } else {
        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            invoiceCount: organization.invoiceCount + 1,
          },
        });
      }
    }
    const payload = JSON.stringify({
      title: "Bill Created",
      body: `Bill #${invNumber} for ₹${grandTotal} created`,
      url: `/dashboard/bills/${invoice.id}`,
    });
    const subscription = await prisma.subscription.findFirst();
    if (subscription) {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload
        );
      } catch (err) {
        console.error("Push failed", err);
      }
    }

    return NextResponse.json(
      { message: "Invoice created successfully", invoice },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const cookiedata = cookies().get("user")?.value;
  const data = JSON.parse(cookiedata || "{}");
  if (!data || !data.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const getorgandcustid = searchParams.get("getorgandcust");
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    if (startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      // Ensure endDate covers the entire day
      endDate.setHours(23, 59, 59, 999);

      const invoices = await prisma.invoice.findMany({
        where: {
          userId: data?.id,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          customer: true,
          organization: true,
          payments: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!invoices) throw new Error("Error while getting invoices");

      return NextResponse.json(
        { message: "success", invoices },
        { status: 200 }
      );
    }

    if (getorgandcustid) {
      const user = await prisma.user.findUnique({
        where: { id: data?.id },
        include: { Organization: true, customers: true },
      });
      if (!user)
        return NextResponse.json(
          { message: "Failed to get user" },
          { status: 500 }
        );
      return NextResponse.json(
        {
          message: "success",
          organizations: user.Organization,
          customers: user.customers,
        },
        {
          status: 200,
        }
      );
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { customer: true, organization: true, payments: true },
      }),
      prisma.invoice.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      invoices,
      page,
      totalPages,
      total,
      nextCursor: page < totalPages ? page + 1 : null,
    });
  } catch (error) {
    console.error("Error while getting invoices", error);
    return NextResponse.json(
      { message: "Failed to get invoices" },
      { status: 500 }
    );
  }
}
