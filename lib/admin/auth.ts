import 'server-only'

import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AdminError, requireEnv } from '@/lib/admin/env'

export const ADMIN_COOKIE = 'anipick_admin'
const MAX_AGE = 60 * 60 * 24 * 30 // 30일

// 쿠키에는 비밀번호 자체가 아니라 비밀번호로 만든 서명값만 넣는다.
// 비밀번호를 바꾸면 기존 로그인은 모두 풀린다.
function sessionToken(password: string) {
  return createHmac('sha256', password).update('anipick-admin-v1').digest('hex')
}

function safeEqual(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function checkPassword(input: string) {
  return safeEqual(input, requireEnv('ADMIN_PASSWORD'))
}

export async function isLoggedIn() {
  const password = process.env.ADMIN_PASSWORD?.trim()
  if (!password) return false
  const value = (await cookies()).get(ADMIN_COOKIE)?.value
  return Boolean(value) && safeEqual(value!, sessionToken(password))
}

export async function requireAdmin() {
  if (!(await isLoggedIn())) throw new AdminError('로그인이 필요해요.', 401)
}

export function setSessionCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, sessionToken(requireEnv('ADMIN_PASSWORD')), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, '', { path: '/', maxAge: 0 })
}

// 모든 관리자 API 공통: 로그인 확인 + 오류를 JSON 으로 돌려준다
export function adminRoute<T>(handler: (req: Request) => Promise<T>, opts = { auth: true }) {
  return async (req: Request) => {
    try {
      if (opts.auth) {
        await requireAdmin()
        // 다른 사이트에서 보낸 요청 차단 (쿠키가 strict 라 이중 안전장치)
        if (req.method !== 'GET' && !req.headers.get('content-type')?.includes('application/json')) {
          throw new AdminError('잘못된 요청이에요.', 400)
        }
      }
      const result = await handler(req)
      return result instanceof NextResponse ? result : NextResponse.json(result)
    } catch (err) {
      const status = err instanceof AdminError ? err.status : 500
      const message =
        err instanceof AdminError ? err.message : `서버 오류: ${(err as Error).message}`
      if (!(err instanceof AdminError)) console.error('[admin]', err)
      return NextResponse.json({ error: message }, { status })
    }
  }
}
