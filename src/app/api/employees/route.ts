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
    const orgId = searchParams.get("organizationId");
    const isWorkingParam = searchParams.get("isWorking");
    const monthYear =
      searchParams.get("monthYear") ||
      new Date().toISOString().slice(0, 7); // e.g. "2026-10"

    const [yearStr, monthStr] = monthYear.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const daysInMonth = new Date(year, month, 0).getDate();
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month - 1, daysInMonth, 23, 59, 59, 999));

    // Calculate previous month string (e.g. "2026-09" from "2026-10")
    const prevMonthDate = new Date(Date.UTC(year, month - 2, 1));
    const prevMonthYear = prevMonthDate.toISOString().slice(0, 7);

    const where: any = {
      userId: user.id,
    };
    if (orgId && orgId !== "all") {
      where.organizationId = orgId;
    }
    if (isWorkingParam !== null && isWorkingParam !== undefined && isWorkingParam !== "") {
      where.isWorking = isWorkingParam === "true";
    }

    if (!(prisma as any).employee) {
      return NextResponse.json(
        {
          error:
            "Prisma Client has not been generated for the new Employee models yet. Please run 'npx prisma db push && npx prisma generate' and restart your dev server.",
        },
        { status: 500 }
      );
    }

    const employees = await (prisma as any).employee.findMany({
      where,
      include: {
        organization: {
          select: { id: true, name: true },
        },
        attendances: {
          where: {
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        },
        expenses: {
          where: {
            expenseDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        },
        salarySlips: {
          where: {
            monthYear: {
              in: [monthYear, prevMonthYear],
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    let totalMonthlyPayable = 0;
    let totalMonthlyExpenses = 0;
    let totalUnsettledUpad = 0;

    const enrichedEmployees = employees.map((emp: any) => {
      const monthlySalary = parseFloat(emp.monthlySalary) || 0;
      const dailySalary = daysInMonth > 0 ? monthlySalary / daysInMonth : 0;

      // Sum units worked in current month
      const totalUnitsWorked = emp.attendances.reduce(
        (sum: number, att: any) => sum + (att.units || 0),
        0
      );
      const calculatedPayable = Math.round(totalUnitsWorked * dailySalary);

      // Previous month slip for unsettled upad
      const prevSlip = emp.salarySlips.find(
        (slip: any) => slip.monthYear === prevMonthYear
      );
      const previousMonthUpad = parseFloat(prevSlip?.unsettledUpad || "0") || 0;

      // Current month expenses (salary advances, utilities, medical, etc.)
      const currentMonthExpenses = emp.expenses.reduce(
        (sum: number, exp: any) => sum + (parseFloat(exp.amount) || 0),
        0
      );

      const totalUpadDrawn = previousMonthUpad + currentMonthExpenses;
      const netPayable = calculatedPayable - totalUpadDrawn;

      // Current finalized slip if exists
      const currentSlip = emp.salarySlips.find(
        (slip: any) => slip.monthYear === monthYear
      );

      totalMonthlyPayable += calculatedPayable;
      totalMonthlyExpenses += currentMonthExpenses;
      totalUnsettledUpad += previousMonthUpad;

      return {
        id: emp.id,
        name: emp.name,
        phone: emp.phone,
        monthlySalary: emp.monthlySalary,
        dailySalary: Math.round(dailySalary * 100) / 100,
        joiningDate: emp.joiningDate,
        exitDate: emp.exitDate,
        isWorking: emp.isWorking,
        notes: emp.notes,
        organization: emp.organization,
        daysInMonth,
        totalUnitsWorked,
        calculatedPayable,
        previousMonthUpad,
        currentMonthExpenses,
        totalUpadDrawn,
        netPayable,
        isFinalized: !!currentSlip,
        currentSlip,
      };
    });

    return NextResponse.json({
      employees: enrichedEmployees,
      summary: {
        totalEmployees: enrichedEmployees.length,
        activeEmployees: enrichedEmployees.filter((e: any) => e.isWorking).length,
        totalMonthlyPayable: Math.round(totalMonthlyPayable),
        totalMonthlyExpenses: Math.round(totalMonthlyExpenses),
        totalUnsettledUpad: Math.round(totalUnsettledUpad),
        monthYear,
        daysInMonth,
      },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
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
      name,
      phone,
      monthlySalary,
      joiningDate,
      exitDate,
      isWorking,
      notes,
      organizationId,
      // For old employee mode
      totalPastSalary,
      // For current employee mode (optional initial expense)
      initialSalaryPaid,
    } = body;

    if (!name || !organizationId) {
      return NextResponse.json(
        { error: "Employee Name and Organization are required" },
        { status: 400 }
      );
    }

    if (!(prisma as any).employee) {
      return NextResponse.json(
        {
          error:
            "Prisma Client has not been generated for the new Employee models yet. Please run 'npx prisma db push && npx prisma generate' and restart your dev server.",
        },
        { status: 500 }
      );
    }

    const isCurrentEmployee = isWorking !== false;

    // 1. Create Employee
    const employee = await (prisma as any).employee.create({
      data: {
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        monthlySalary: String(monthlySalary || "0"),
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        exitDate: exitDate ? new Date(exitDate) : null,
        isWorking: isCurrentEmployee,
        notes: notes ? notes.trim() : null,
        organizationId,
        userId: user.id,
      },
    });

    // 2. Handle initial expense logging based on mode
    if (!isCurrentEmployee && totalPastSalary && parseFloat(totalPastSalary) > 0) {
      // Old employee mode: logs total past salary with description "Salary Given till {date}"
      const toDateStr = exitDate
        ? new Date(exitDate).toLocaleDateString("en-IN")
        : new Date().toLocaleDateString("en-IN");
      await (prisma as any).expenses.create({
        data: {
          type: "Salary",
          description: `Salary Given till ${toDateStr}`,
          amount: String(totalPastSalary),
          expenseDate: exitDate ? new Date(exitDate) : new Date(),
          organizationId,
          userId: user.id,
          employeeId: employee.id,
        },
      });
    } else if (isCurrentEmployee && initialSalaryPaid && parseFloat(initialSalaryPaid) > 0) {
      // Current employee mode: optional salary paid till now
      const joinDateStr = joiningDate
        ? new Date(joiningDate).toLocaleDateString("en-IN")
        : new Date().toLocaleDateString("en-IN");
      await (prisma as any).expenses.create({
        data: {
          type: "Salary",
          description: `Initial Salary Paid till ${joinDateStr}`,
          amount: String(initialSalaryPaid),
          expenseDate: joiningDate ? new Date(joiningDate) : new Date(),
          organizationId,
          userId: user.id,
          employeeId: employee.id,
        },
      });
    }

    return NextResponse.json(
      { employee, message: "Employee created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}

