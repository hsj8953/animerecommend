import { adminRoute } from '@/lib/admin/auth'
import { AdminError } from '@/lib/admin/env'
import { posterPreviewUrl, searchTmdb } from '@/lib/admin/tmdb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = adminRoute(async (req) => {
  const q = new URL(req.url).searchParams.get('q')?.trim()
  if (!q) throw new AdminError('검색어를 입력해 주세요.')
  const results = await searchTmdb(q)
  return {
    results: results.map((r) => ({
      ...r,
      previewUrl: r.posterPath ? posterPreviewUrl(r.posterPath) : null,
    })),
  }
})
