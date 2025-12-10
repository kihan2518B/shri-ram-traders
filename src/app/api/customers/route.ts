import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, address, gstNumber } = await request.json()
  console.log("name, address, gstNumber: ", name, address, gstNumber)
  if (!name || !address || !gstNumber) return NextResponse.json({ message: "Missing required fields" }, { status: 500 })
  try {
    const customer = await prisma.customer.create({
      data: {
        name,
        address,
        gstNumber: String(gstNumber).toUpperCase(),
        userId: user.id,
      }
    })

    return NextResponse.json({ customer, message: "Customer created successfully" }, {
      status: 201
    })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const customers = await prisma.customer.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({ message: "Customers fetched successfully", customers }, {
      status: 200
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

