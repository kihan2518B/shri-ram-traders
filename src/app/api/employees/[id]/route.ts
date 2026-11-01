import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookiedata = cookies().get("user")?.value;
    const user = JSON.parse(cookiedata || "{}");
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthYear =
      searchParams.get("monthYear") ||
      new Date().toISOString().slice(0, 7); // "YYYY-MM"

    const [yearStr, monthStr] = monthYear.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const daysInMonth = new Date(year, month, 0).getDate();
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month - 1, daysInMonth, 23, 59, 59, 999));

    const prevMonthDate = new Date(Date.UTC(year, month - 2, 1));
    const prevMonthYear = prevMonthDate.toISOString().slice(0, 7);

    if (!(prisma as any).employee) {
      return NextResponse.json(
        {
          error:
            "Prisma Client has not been generated for the new Employee models yet. Please run 'npx prisma db push && npx prisma generate' and restart your dev server.",
        },
        { status: 500 }
      );
    }

    const employee = await (prisma as any).employee.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        organization: true,
        attendances: {
          where: {
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          orderBy: { date: "asc" },
        },
        expenses: {
          where: {
            expenseDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          orderBy: { expenseDate: "desc" },
        },
        salarySlips: {
          orderBy: { monthYear: "desc" },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const monthlySalary = parseFloat(employee.monthlySalary) || 0;
    const dailySalary = daysInMonth > 0 ? monthlySalary / daysInMonth : 0;

    const totalUnitsWorked = employee.attendances.reduce(
      (sum: number, att: any) => sum + (att.units || 0),
      0
    );
    const calculatedPayable = Math.round(totalUnitsWorked * dailySalary);

    // Previous month slip for unsettled upad
    const prevSlip = employee.salarySlips.find(
      (slip: any) => slip.monthYear === prevMonthYear
    );
    const previousMonthUpad = parseFloat(prevSlip?.unsettledUpad || "0") || 0;

    // Current month expenses
    const currentMonthExpenses = employee.expenses.reduce(
      (sum: number, exp: any) => sum + (parseFloat(exp.amount) || 0),
      0
    );

    const totalUpadDrawn = previousMonthUpad + currentMonthExpenses;
    const netPayable = calculatedPayable - totalUpadDrawn;

    const currentSlip = employee.salarySlips.find(
      (slip: any) => slip.monthYear === monthYear
    );

    return NextResponse.json({
      employee: {
        ...employee,
        dailySalary: Math.round(dailySalary * 100) / 100,
        daysInMonth,
        totalUnitsWorked,
        calculatedPayable,
        previousMonthUpad,
        currentMonthExpenses,
        totalUpadDrawn,
        netPayable,
        currentSlip,
        prevSlip,
      },
      attendances: employee.attendances,
      expenses: employee.expenses,
      salarySlips: employee.salarySlips,
    });
  } catch (error) {
    console.error("Error fetching employee details:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    } = body;

    const updatedEmployee = await (prisma as any).employee.update({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        ...(name ? { name: name.trim() } : {}),
        phone: phone !== undefined ? (phone ? phone.trim() : null) : undefined,
        ...(monthlySalary !== undefined ? { monthlySalary: String(monthlySalary) } : {}),
        ...(joiningDate !== undefined ? { joiningDate: joiningDate ? new Date(joiningDate) : null } : {}),
        ...(exitDate !== undefined ? { exitDate: exitDate ? new Date(exitDate) : null } : {}),
        ...(isWorking !== undefined ? { isWorking: Boolean(isWorking) } : {}),
        ...(notes !== undefined ? { notes: notes ? notes.trim() : null } : {}),
        ...(organizationId ? { organizationId } : {}),
      },
    });

    return NextResponse.json({
      employee: updatedEmployee,
      message: "Employee updated successfully",
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookiedata = cookies().get("user")?.value;
    const user = JSON.parse(cookiedata || "{}");
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await (prisma as any).employee.delete({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}

