// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/app/login/actions'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const result = await login(formData)
  return NextResponse.json(result)
}
