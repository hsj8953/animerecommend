import { NextResponse } from 'next/server'
import { adminRoute, checkPassword, setSessionCookie } from '@/lib/admin/auth'
import { AdminError } from '@/lib/admin/env'

export const runtime = 'nodejs'

export const POST = adminRoute(
  async (req) => {
    const body = (await req.json().catch(() => ({}))) as { password?: unknown }
    const password = typeof body.password === 'string' ? body.password : ''
    if (!checkPassword(password)) {
      // 비밀번호 무작위 대입을 느리게
      await new Promise((r) => setTimeout(r, 800))
      throw new AdminError('비밀번호가 틀렸어요.', 401)
    }
    const res = NextResponse.json({ ok: true })
    setSessionCookie(res)
    return res
  },
  { auth: false },
)
