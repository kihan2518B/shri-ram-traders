// app/api/backup/full/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // ← your Prisma client import

// Optional: protect this route (uncomment if needed)
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';

export async function POST() {
  // Optional: protect route
  // const session = await getServerSession(authOptions);
  // if (!session?.user) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    // List all your model names here (case-sensitive!)
    const models = [
      "user",
      "organization",
      "customer",
      "invoice",
      "expenses",
      "PaymentLog",
      "subscription",
    ] as const;

    type ModelName = (typeof models)[number];

    const backup: Record<string, any[]> = {};

    // Fetch all records from each table
    await Promise.all(
      models.map(async (model) => {
        try {
          // @ts-expect-error - dynamic model access
          const records = await prisma[model].findMany({
            orderBy: { id: "asc" }, // or createdAt: 'desc' if you prefer
            // You can add include/select if needed (relations)
            // include: { customer: true } // example
          });

          backup[model] = records;
        } catch (e) {
          console.error(`Failed to backup model ${model}:`, e);
          backup[model] = [];
        }
      }),
    );

    return NextResponse.json(
      { backup },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Backup failed:", error);
    return NextResponse.json(
      { message: "Failed to generate backup" },
      { status: 500 },
    );
  }
}
