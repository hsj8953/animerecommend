import { adminRoute } from '@/lib/admin/auth'
import { loadLatest } from '@/lib/admin/data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = adminRoute(async () => {
  const { anime, themes } = await loadLatest()
  return { anime, themes }
})
