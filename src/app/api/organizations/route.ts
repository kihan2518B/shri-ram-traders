import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, gstNumber, address, bankName, accountNumber, ifscCode, userId, logo } = body
  console.log("body: ", user);

  try {
    const organization = await prisma.organization.create({
      data: {
        name,
        userId: user.id,
        gstNumber,
        address,
        bankName,
        accountNumber,
        ifscCode,
        logo: logo || ""
      },
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log(user)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizations = await prisma.organization.findMany({
      where: { userId: user.id }
    })
    return NextResponse.json({ message: "Success", organizations }, { status: 200 })
  } catch (error) {
    console.log("Error while getting organizations @/api/organizations", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}