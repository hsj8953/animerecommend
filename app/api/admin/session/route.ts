import { NextResponse } from 'next/server'
import { isLoggedIn } from '@/lib/admin/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    loggedIn: await isLoggedIn(),
    configured: Boolean(process.env.ADMIN_PASSWORD?.trim()),
  })
}
