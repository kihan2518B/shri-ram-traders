import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

const ATTENDANCE_WEIGHTS: Record<string, number> = {
  FULL_DAY: 1.0,
  THREE_QUARTER: 0.75,
  HALF_DAY: 0.5,
  QUARTER_DAY: 0.25,
  ABSENT: 0.0,
};

export async function GET(req: Request) {
  try {
    const cookiedata = cookies().get("user")?.value;
    const user = JSON.parse(cookiedata || "{}");
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    const dateStr = searchParams.get("date"); // "YYYY-MM-DD"
    const monthYear = searchParams.get("monthYear"); // "YYYY-MM"

    const where: any = {
      employee: {
        userId: user.id,
      },
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (dateStr) {
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (monthYear) {
      const [yearStr, monthStr] = monthYear.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const daysInMonth = new Date(year, month, 0).getDate();
      where.date = {
        gte: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)),
        lte: new Date(Date.UTC(year, month - 1, daysInMonth, 23, 59, 59, 999)),
      };
    }

    if (!(prisma as any).attendance) {
      return NextResponse.json(
        {
          error:
            "Prisma Client has not been generated for the Attendance model yet. Please run 'npx prisma db push && npx prisma generate' and restart your dev server.",
        },
        { status: 500 }
      );
    }

    const attendances = await (prisma as any).attendance.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, monthlySalary: true, isWorking: true },
        },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ attendances });
  } catch (error) {
    console.error("Error fetching attendances:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendances" },
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
    const { employeeId, date, status, note } = body;

    if (!employeeId || !date || !status) {
      return NextResponse.json(
        { error: "Employee, Date, and Status are required" },
        { status: 400 }
      );
    }

    const emp = await (prisma as any).employee.findFirst({
      where: { id: employeeId, userId: user.id },
    });
    if (!emp) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const normalizedDateStr = date.split("T")[0];
    const dateObj = new Date(`${normalizedDateStr}T00:00:00.000Z`);

    const units =
      status in ATTENDANCE_WEIGHTS ? ATTENDANCE_WEIGHTS[status] : 1.0;

    // Upsert attendance for this employee on this date
    const attendance = await (prisma as any).attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: dateObj,
        },
      },
      update: {
        status,
        units,
        note: note ? note.trim() : null,
      },
      create: {
        employeeId,
        date: dateObj,
        status,
        units,
        note: note ? note.trim() : null,
      },
    });

    return NextResponse.json({
      attendance,
      message: "Attendance recorded successfully",
    });
  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 }
    );
  }
}

