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

export async function POST(req: Request) {
  try {
    const cookiedata = cookies().get("user")?.value;
    const user = JSON.parse(cookiedata || "{}");
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { date, status, employeeIds, note } = body;

    if (!date || !status || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return NextResponse.json(
        { error: "Date, Status, and at least one Employee are required" },
        { status: 400 }
      );
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

    const normalizedDateStr = date.split("T")[0];
    const dateObj = new Date(`${normalizedDateStr}T00:00:00.000Z`);

    const units =
      status in ATTENDANCE_WEIGHTS ? ATTENDANCE_WEIGHTS[status] : 1.0;

    // Verify all employeeIds belong to this user
    const validEmployees = await (prisma as any).employee.findMany({
      where: {
        id: { in: employeeIds },
        userId: user.id,
      },
      select: { id: true },
    });

    const validIds: string[] = validEmployees.map((e: any) => e.id);

    // Upsert attendance for all valid employees in a transaction
    const operations = validIds.map((empId) =>
      (prisma as any).attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: empId,
            date: dateObj,
          },
        },
        update: {
          status,
          units,
          note: note ? note.trim() : null,
        },
        create: {
          employeeId: empId,
          date: dateObj,
          status,
          units,
          note: note ? note.trim() : null,
        },
      })
    );

    await prisma.$transaction(operations);

    return NextResponse.json({
      message: `Attendance marked for ${validIds.length} employee(s) successfully`,
      count: validIds.length,
    });
  } catch (error) {
    console.error("Error saving bulk attendance:", error);
    return NextResponse.json(
      { error: "Failed to save bulk attendance" },
      { status: 500 }
    );
  }
}

