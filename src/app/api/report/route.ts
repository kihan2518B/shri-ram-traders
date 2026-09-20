import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Expenses, Invoice, Prisma } from "../../../../generated/prisma";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const cookiedata = cookies().get("user")?.value;
  
  const data = JSON.parse(cookiedata || "{}");
  if (!data || !data.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const orgId = searchParams.get("orgId");
  const customerId = searchParams.get("customerId");

  const filters: Prisma.InvoiceWhereInput[] = [{ userId: data.id }];

  if (startDate && endDate) {
    filters.push({
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    });
  }

  if (orgId && orgId !== "all") {
    filters.push({ organizationId: orgId });
  }

  if (customerId && customerId !== "all") {
    filters.push({ customerId });
  }

  const organizations = await prisma.organization.findMany({
    where: { userId: data.id },
    select: {
      id: true,
      name: true,
    },
  });

  const customers = await prisma.customer.findMany({
    where: { userId: data.id },
    select: {
      id: true,
      name: true,
    },
  });

  const invoices = await prisma.invoice.findMany({
    where: { AND: filters },
    include: { customer: true, organization: true, payments: true },
    orderBy: {
      createdAt: "asc",
    },
  });

  const expenses = await prisma.expenses.findMany({
    where: {
      expenseDate:
        startDate && endDate
          ? { gte: new Date(startDate), lte: new Date(endDate) }
          : undefined,
    },
  });

  // Stock Flow aggregation by item
  const stockFlowMap: Record<string, { date: string; creditQty: number; debitQty: number; unit: string }> = {};

  invoices.forEach((inv) => {
    let items: any[] = [];
    try {
      items = typeof inv.items === "string" ? JSON.parse(inv.items) : (inv.items as any[]);
    } catch (e) {
      items = [];
    }

    const dateKey = new Date(inv.createdAt).toISOString().split("T")[0];

    if (Array.isArray(items)) {
      items.forEach((item) => {
        const itemName = item.name || "WoodenSize";
        const key = `${dateKey}_${itemName}`;
        const qty = Number(item.quantity) || 0;
        const unit = item.unit || "CBM";

        if (!stockFlowMap[key]) {
          stockFlowMap[key] = { date: dateKey, creditQty: 0, debitQty: 0, unit };
        }

        if (inv.invoiceType === "CREDIT") {
          stockFlowMap[key].creditQty += qty;
        } else {
          stockFlowMap[key].debitQty += qty;
        }
      });
    }
  });

  // Aggregations
  const debitTotal = invoices
    .filter((i: Invoice) => i.invoiceType === "DEBIT")
    .reduce((sum: number, i: Invoice) => sum + i.totalAmount, 0);

  const creditTotal = invoices
    .filter((i: Invoice) => i.invoiceType === "CREDIT")
    .reduce((sum: number, i: Invoice) => sum + i.totalAmount, 0);

  const expensesTotal = expenses.reduce(
    (sum: number, e: Expenses) => sum + e.amount,
    0
  );

  const netRevenue = debitTotal - creditTotal - expensesTotal;

  return NextResponse.json({
    debitTotal,
    creditTotal,
    expensesTotal,
    netRevenue,
    invoices,
    expenses,
    customers,
    organizations,
    stockFlow: Object.entries(stockFlowMap).map(([key, val]) => ({
      item: key.split("_")[1],
      ...val,
    })),
  });
}
