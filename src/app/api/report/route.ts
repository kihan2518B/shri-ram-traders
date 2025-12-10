import { NextResponse } from "next/server";
import { Expenses, Invoice, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const orgId = searchParams.get("orgId");
  const customerId = searchParams.get("customerId");

  const filters: Prisma.InvoiceWhereInput[] = [];

  if (startDate && endDate) {
    filters.push({
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    });
  }

  if (orgId) {
    filters.push({ organizationId: orgId });
  }

  if (customerId) {
    filters.push({ customerId });
  }
  const organizations = await prisma.organization.findMany({
    where: { userId: data.user.id },
    select: {
      id: true,
      name: true,
    },
  });
  const customers = await prisma.customer.findMany({
    where: { userId: data.user.id },
    select: {
      id: true,
      name: true,
    },
  });

  const invoices = await prisma.invoice.findMany({
    where: { AND: filters },
    include: { customer: true, organization: true, payments: true },
    orderBy: {
      createdAt: 'asc'
    }
  });

  const expenses = await prisma.expenses.findMany({
    where: {
      expenseDate:
        startDate && endDate
          ? { gte: new Date(startDate), lte: new Date(endDate) }
          : undefined,
    },
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
  });
}
