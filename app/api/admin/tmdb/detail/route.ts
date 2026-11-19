import { adminRoute } from '@/lib/admin/auth'
import { AdminError } from '@/lib/admin/env'
import { posterPreviewUrl, tmdbDetail } from '@/lib/admin/tmdb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = adminRoute(async (req) => {
  const params = new URL(req.url).searchParams
  const type = params.get('type')
  const id = Number(params.get('id'))
  if ((type !== 'tv' && type !== 'movie') || !Number.isInteger(id)) {
    throw new AdminError('잘못된 요청이에요.')
  }
  const detail = await tmdbDetail(type, id)
  return {
    ...detail,
    previewUrl: detail.posterPath ? posterPreviewUrl(detail.posterPath) : null,
  }
})
