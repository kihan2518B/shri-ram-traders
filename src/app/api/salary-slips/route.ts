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
    const monthYear = searchParams.get("monthYear");

    const where: any = {
      employee: {
        userId: user.id,
      },
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }
    if (monthYear) {
      where.monthYear = monthYear;
    }

    if (!(prisma as any).salarySlip) {
      return NextResponse.json(
        {
          error:
            "Prisma Client has not been generated for the SalarySlip model yet. Please run 'npx prisma db push && npx prisma generate' and restart your dev server.",
        },
        { status: 500 }
      );
    }

    const slips = await (prisma as any).salarySlip.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, monthlySalary: true },
        },
        expenses: {
          select: { id: true, type: true, amount: true, description: true, expenseDate: true },
        },
      },
      orderBy: { monthYear: "desc" },
    });

    return NextResponse.json({ slips });
  } catch (error) {
    console.error("Error fetching salary slips:", error);
    return NextResponse.json(
      { error: "Failed to fetch salary slips" },
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
      employeeId,
      monthYear,
      decidedSalary,
      payoutAmount,
      notes,
    } = body;

    if (!employeeId || !monthYear || decidedSalary === undefined || decidedSalary === null) {
      return NextResponse.json(
        { error: "Employee, Month-Year, and Decided Salary are required" },
        { status: 400 }
      );
    }

    const employee = await (prisma as any).employee.findFirst({
      where: { id: employeeId, userId: user.id },
    });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const [yearStr, monthStr] = monthYear.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const daysInMonth = new Date(year, month, 0).getDate();
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month - 1, daysInMonth, 23, 59, 59, 999));

    // Previous month string
    const prevMonthDate = new Date(Date.UTC(year, month - 2, 1));
    const prevMonthYear = prevMonthDate.toISOString().slice(0, 7);

    // Get previous month's salary slip
    const prevSlip = await (prisma as any).salarySlip.findUnique({
      where: {
        employeeId_monthYear: {
          employeeId,
          monthYear: prevMonthYear,
        },
      },
    });
    const previousMonthUpad = parseFloat(prevSlip?.unsettledUpad || "0") || 0;

    // Get attendances for this month
    const attendances = await (prisma as any).attendance.findMany({
      where: {
        employeeId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const totalUnitsWorked = attendances.reduce(
      (sum: number, att: any) => sum + (att.units || 0),
      0
    );
    const monthlySalary = parseFloat(employee.monthlySalary) || 0;
    const dailySalary = daysInMonth > 0 ? monthlySalary / daysInMonth : 0;
    const calculatedPayable = Math.round(totalUnitsWorked * dailySalary);

    // If extra payout is logged right now, create an expense for it
    if (payoutAmount && parseFloat(payoutAmount) > 0) {
      await (prisma as any).expenses.create({
        data: {
          type: "Salary",
          description: `Salary Payout Settlement for ${monthYear}`,
          amount: String(payoutAmount),
          expenseDate: new Date(),
          organizationId: employee.organizationId,
          userId: user.id,
          employeeId: employee.id,
        },
      });
    }

    // Now fetch all expenses for this employee in this month
    const monthExpenses = await (prisma as any).expenses.findMany({
      where: {
        employeeId,
        expenseDate: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const currentMonthExpenses = monthExpenses.reduce(
      (sum: number, exp: any) => sum + (parseFloat(exp.amount) || 0),
      0
    );

    // Total employee draw: previous upad + current month expenses
    const totalDrawn = previousMonthUpad + currentMonthExpenses;
    const decidedNum = parseFloat(decidedSalary) || 0;

    // If total drawn exceeds decided salary, the excess rolls forward as unsettled upad!
    const unsettledUpad = Math.max(0, totalDrawn - decidedNum);

    // Upsert SalarySlip
    const salarySlip = await (prisma as any).salarySlip.upsert({
      where: {
        employeeId_monthYear: {
          employeeId,
          monthYear,
        },
      },
      update: {
        daysInMonth,
        totalUnitsWorked,
        calculatedPayable: String(calculatedPayable),
        decidedSalary: String(decidedNum),
        previousMonthUpad: String(previousMonthUpad),
        currentMonthExpenses: String(currentMonthExpenses),
        payoutAmount: String(payoutAmount || "0"),
        unsettledUpad: String(unsettledUpad),
        status: "FINALIZED",
        notes: notes ? notes.trim() : null,
      },
      create: {
        employeeId,
        monthYear,
        daysInMonth,
        totalUnitsWorked,
        calculatedPayable: String(calculatedPayable),
        decidedSalary: String(decidedNum),
        previousMonthUpad: String(previousMonthUpad),
        currentMonthExpenses: String(currentMonthExpenses),
        payoutAmount: String(payoutAmount || "0"),
        unsettledUpad: String(unsettledUpad),
        status: "FINALIZED",
        notes: notes ? notes.trim() : null,
      },
    });

    // Link this month's expenses to the salary slip
    await (prisma as any).expenses.updateMany({
      where: {
        employeeId,
        expenseDate: { gte: startOfMonth, lte: endOfMonth },
      },
      data: {
        salarySlipId: salarySlip.id,
      },
    });

    return NextResponse.json({
      salarySlip,
      summary: {
        decidedSalary: decidedNum,
        previousMonthUpad,
        currentMonthExpenses,
        totalDrawn,
        unsettledUpad,
      },
      message: "Month-end salary settlement finalized successfully",
    });
  } catch (error) {
    console.error("Error finalizing salary slip:", error);
    return NextResponse.json(
      { error: "Failed to finalize salary slip" },
      { status: 500 }
    );
  }
}

