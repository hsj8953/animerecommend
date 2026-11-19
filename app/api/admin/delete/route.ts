import { adminRoute } from '@/lib/admin/auth'
import { deleteAnime } from '@/lib/admin/data'
import { AdminError } from '@/lib/admin/env'

export const runtime = 'nodejs'

export const POST = adminRoute(async (req) => {
  const body = (await req.json().catch(() => null)) as { id?: unknown } | null
  if (!body || typeof body.id !== 'string') throw new AdminError('잘못된 요청이에요.')
  return deleteAnime(body.id)
})
