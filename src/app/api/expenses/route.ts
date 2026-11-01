import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookiedata = cookies().get("user")?.value;
    const user = JSON.parse(cookiedata || "{}");
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    const orgId = searchParams.get("organizationId");
    const type = searchParams.get("type");
    const monthYear = searchParams.get("monthYear"); // "YYYY-MM"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {
      userId: user.id,
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }
    if (orgId && orgId !== "all") {
      where.organizationId = orgId;
    }
    if (type && type !== "all") {
      where.type = type;
    }

    if (startDate && endDate) {
      where.expenseDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (monthYear) {
      const [yearStr, monthStr] = monthYear.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const daysInMonth = new Date(year, month, 0).getDate();
      where.expenseDate = {
        gte: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)),
        lte: new Date(Date.UTC(year, month - 1, daysInMonth, 23, 59, 59, 999)),
      };
    }

    const expenses = await (prisma as any).expenses.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, phone: true },
        },
        organization: {
          select: { id: true, name: true },
        },
      },
      orderBy: { expenseDate: "desc" },
    });

    const totalAmount = expenses.reduce(
      (sum: number, exp: any) => sum + (parseFloat(exp.amount) || 0),
      0
    );

    return NextResponse.json({
      expenses,
      totalAmount: Math.round(totalAmount * 100) / 100,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookiedata = cookies().get("user")?.value;
    const user = JSON.parse(cookiedata || "{}");
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      amount,
      description,
      expenseDate,
      employeeId,
      organizationId,
    } = body;

    if (!type || amount === undefined || amount === null || !description) {
      return NextResponse.json(
        { error: "Type, Amount, and Description are required" },
        { status: 400 }
      );
    }

    let finalOrgId = organizationId;
    if (employeeId && !finalOrgId) {
      const emp = await (prisma as any).employee.findFirst({
        where: { id: employeeId, userId: user.id },
        select: { organizationId: true },
      });
      if (emp) {
        finalOrgId = emp.organizationId;
      }
    }

    const expense = await (prisma as any).expenses.create({
      data: {
        type: type.trim(),
        amount: String(amount),
        description: description.trim(),
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        userId: user.id,
        organizationId: finalOrgId || null,
        employeeId: employeeId || null,
      },
      include: {
        employee: {
          select: { id: true, name: true },
        },
        organization: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(
      { expense, message: "Expense logged successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}

