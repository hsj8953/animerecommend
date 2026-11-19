import { adminRoute } from '@/lib/admin/auth'
import { saveAnime, type SaveInput } from '@/lib/admin/data'
import { AdminError } from '@/lib/admin/env'

export const runtime = 'nodejs'

export const POST = adminRoute(async (req) => {
  const body = (await req.json().catch(() => null)) as SaveInput | null
  if (!body || !body.anime || (body.mode !== 'create' && body.mode !== 'edit')) {
    throw new AdminError('잘못된 요청이에요.')
  }
  return saveAnime(body)
})
