export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookiedata = cookies().get("user")?.value;
    const data = JSON.parse(cookiedata || "{}");
    if (!data || !data.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const asOfDate = searchParams.get("asOfDate");

    const dateFilter = asOfDate
      ? { lte: new Date(new Date(asOfDate).setHours(23, 59, 59, 999)) }
      : undefined;

    const orgWhere = orgId && orgId !== "all" ? { organizationId: orgId } : {};

    // 1. Fetch Invoices matching filters
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: data.id,
        ...orgWhere,
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      include: {
        customer: true,
        payments: true,
      },
    });

    // 2. Compute Accounts Receivable (Debits - Outward Sales) for PENDING invoices
    const pendingDebitInvoices = invoices.filter(
      (inv) => inv.invoiceType === "DEBIT" && inv.status === "PENDING"
    );

    const receivablesMap: Record<string, { customerName: string; amount: number; invoiceCount: number }> = {};
    let totalReceivables = 0;

    pendingDebitInvoices.forEach((inv) => {
      const name = inv.customer?.name || inv.billerName || "Unknown Customer";
      const paid = inv.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const pendingAmount = Math.max(0, inv.grandTotal - paid);

      if (pendingAmount > 0) {
        if (!receivablesMap[name]) {
          receivablesMap[name] = { customerName: name, amount: 0, invoiceCount: 0 };
        }
        receivablesMap[name].amount += pendingAmount;
        receivablesMap[name].invoiceCount += 1;
        totalReceivables += pendingAmount;
      }
    });

    // 3. Compute Accounts Payable (Credits - Inward Purchases) for PENDING invoices
    const pendingCreditInvoices = invoices.filter(
      (inv) => inv.invoiceType === "CREDIT" && inv.status === "PENDING"
    );

    const payablesMap: Record<string, { customerName: string; amount: number; invoiceCount: number }> = {};
    let totalPayables = 0;

    pendingCreditInvoices.forEach((inv) => {
      const name = inv.customer?.name || inv.billerName || "Vendor/Supplier";
      const paid = inv.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const pendingAmount = Math.max(0, inv.grandTotal - paid);

      if (pendingAmount > 0) {
        if (!payablesMap[name]) {
          payablesMap[name] = { customerName: name, amount: 0, invoiceCount: 0 };
        }
        payablesMap[name].amount += pendingAmount;
        payablesMap[name].invoiceCount += 1;
        totalPayables += pendingAmount;
      }
    });

    // 4. Compute Stock on Hand Valuation
    // Stock Qty per Item = sum(CREDIT Qty) - sum(DEBIT Qty)
    // If remainingQty >= 0, value using Avg Purchase (Cost) Rate.
    // If remainingQty < 0, value using Avg Selling (Debit) Rate to allow negative amount adjustment.
    const stockQtyMap: Record<
      string,
      {
        unit: string;
        creditQty: number;
        creditTotalCost: number;
        debitQty: number;
        debitTotalRevenue: number;
      }
    > = {};

    invoices.forEach((inv) => {
      let items: any[] = [];
      try {
        items = typeof inv.items === "string" ? JSON.parse(inv.items) : (inv.items as any[]);
      } catch (e) {
        items = [];
      }

      if (Array.isArray(items)) {
        items.forEach((item) => {
          const itemName = item.name || "Default Item";
          const qty = Number(item.quantity) || 0;
          const price = Number(item.price) || 0;
          const unit = item.unit || "Units";

          if (!stockQtyMap[itemName]) {
            stockQtyMap[itemName] = {
              unit,
              creditQty: 0,
              creditTotalCost: 0,
              debitQty: 0,
              debitTotalRevenue: 0,
            };
          }

          if (inv.invoiceType === "CREDIT") {
            stockQtyMap[itemName].creditQty += qty;
            stockQtyMap[itemName].creditTotalCost += qty * price;
          } else {
            stockQtyMap[itemName].debitQty += qty;
            stockQtyMap[itemName].debitTotalRevenue += qty * price;
          }
        });
      }
    });

    const stockOnHandItems: {
      name: string;
      unit: string;
      remainingQty: number;
      avgCostPrice: number;
      avgSellingPrice: number;
      valuationRate: number;
      totalValuation: number;
    }[] = [];
    let totalStockValuation = 0;

    Object.entries(stockQtyMap).forEach(([name, data]) => {
      const remainingQty = data.creditQty - data.debitQty;
      const avgCostPrice =
        data.creditQty > 0 ? data.creditTotalCost / data.creditQty : 0;
      const avgSellingPrice =
        data.debitQty > 0 ? data.debitTotalRevenue / data.debitQty : 0;

      // Rate selection:
      // Positive or zero stock -> use average purchase price (fallback to avg selling price if no purchases)
      // Negative stock -> use average selling price (fallback to avg cost price if no sales)
      let valuationRate = 0;
      if (remainingQty < 0) {
        valuationRate = avgSellingPrice > 0 ? avgSellingPrice : avgCostPrice;
      } else {
        valuationRate = avgCostPrice > 0 ? avgCostPrice : avgSellingPrice;
      }

      const totalValuation = remainingQty * valuationRate;

      stockOnHandItems.push({
        name,
        unit: data.unit,
        remainingQty: Math.round(remainingQty * 1000) / 1000,
        avgCostPrice: Math.round(avgCostPrice * 100) / 100,
        avgSellingPrice: Math.round(avgSellingPrice * 100) / 100,
        valuationRate: Math.round(valuationRate * 100) / 100,
        totalValuation: Math.round(totalValuation * 100) / 100,
      });

      totalStockValuation += totalValuation;
    });

    // 5. Net Assets calculation
    const netAssets = totalStockValuation + totalReceivables - totalPayables;

    return NextResponse.json({
      receivables: Object.values(receivablesMap),
      payables: Object.values(payablesMap),
      totalReceivables: Math.round(totalReceivables * 100) / 100,
      totalPayables: Math.round(totalPayables * 100) / 100,
      stockOnHandItems,
      totalStockValuation: Math.round(totalStockValuation * 100) / 100,
      netAssets: Math.round(netAssets * 100) / 100,
    });
  } catch (error) {
    console.error("Error generating Balance Sheet:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

