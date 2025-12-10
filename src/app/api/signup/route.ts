import { NextRequest, NextResponse } from 'next/server'
import { signup } from '@/app/login/actions'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const result = await signup(formData)
  return NextResponse.json(result)
}
