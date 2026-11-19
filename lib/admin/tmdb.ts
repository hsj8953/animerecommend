import 'server-only'

import { AdminError, requireEnv, tmdbApiUrl, tmdbImageUrl } from '@/lib/admin/env'

// TMDB 장르 ID → 사이트 장르 (추천값일 뿐, 화면에서 고칠 수 있다)
const GENRE_MAP: Record<number, string[]> = {
  10759: ['액션', '어드벤처'], // TV: Action & Adventure
  10765: ['판타지'], // TV: Sci-Fi & Fantasy
  28: ['액션'],
  12: ['어드벤처'],
  14: ['판타지'],
  878: ['SF'],
  53: ['스릴러'],
  27: ['스릴러'],
  80: ['스릴러'],
  9648: ['미스터리'],
  10749: ['로맨스'],
  18: ['드라마'],
  35: ['코미디'],
}

async function tmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const key = requireEnv('TMDB_API_KEY')
  // v4 읽기 토큰(eyJ...)은 헤더로, v3 키는 쿼리로 보낸다
  const bearer = key.startsWith('eyJ')
  const url = new URL(`${tmdbApiUrl()}${endpoint}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  if (!bearer) url.searchParams.set('api_key', key)
  const res = await fetch(url, {
    headers: bearer ? { Authorization: `Bearer ${key}` } : {},
    cache: 'no-store',
  })
  if (res.status === 401) {
    throw new AdminError('TMDB 키가 잘못됐어요. TMDB_API_KEY 를 확인해 주세요.', 500)
  }
  if (!res.ok) throw new AdminError(`TMDB 오류 ${res.status}`, 502)
  return res.json() as Promise<T>
}

type SearchItem = {
  id: number
  media_type: string
  name?: string
  title?: string
  original_name?: string
  original_title?: string
  first_air_date?: string
  release_date?: string
  poster_path?: string | null
}

export async function searchTmdb(query: string) {
  const data = await tmdb<{ results: SearchItem[] }>('/search/multi', {
    query,
    language: 'ko-KR',
    include_adult: 'false',
  })
  return data.results
    .filter((r) => r.media_type === 'tv' || r.media_type === 'movie')
    .slice(0, 12)
    .map((r) => ({
      tmdbId: r.id,
      type: r.media_type as 'tv' | 'movie',
      title: r.name ?? r.title ?? '',
      original: r.original_name ?? r.original_title ?? '',
      year: Number((r.first_air_date ?? r.release_date ?? '').slice(0, 4)) || null,
      posterPath: r.poster_path ?? null,
    }))
}

type Detail = {
  name?: string
  title?: string
  first_air_date?: string
  release_date?: string
  overview?: string
  poster_path?: string | null
  genres?: { id: number }[]
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 30)
}

export async function tmdbDetail(type: 'tv' | 'movie', id: number) {
  const endpoint = `/${type}/${id}`
  const [ko, en] = await Promise.all([
    tmdb<Detail>(endpoint, { language: 'ko-KR' }),
    tmdb<Detail>(endpoint, { language: 'en-US' }),
  ])
  const enTitle = en.name ?? en.title ?? ''
  const genre = [...new Set((ko.genres ?? []).flatMap((g) => GENRE_MAP[g.id] ?? []))]
  if (type === 'movie') genre.push('극장판')
  return {
    id: slugify(enTitle),
    title: ko.name ?? ko.title ?? enTitle,
    original: enTitle,
    genre,
    year: Number((ko.first_air_date ?? ko.release_date ?? '').slice(0, 4)) || null,
    description: ko.overview || en.overview || '',
    posterPath: ko.poster_path ?? en.poster_path ?? null,
  }
}

export function posterPreviewUrl(posterPath: string) {
  return `${tmdbImageUrl()}/w342${posterPath}`
}

export async function downloadPoster(posterPath: string) {
  if (!/^\/[\w.-]+\.(jpg|jpeg|png|webp)$/i.test(posterPath)) {
    throw new AdminError('포스터 경로가 이상해요. 다시 검색해서 골라 주세요.')
  }
  const res = await fetch(`${tmdbImageUrl()}/w500${posterPath}`, { cache: 'no-store' })
  if (!res.ok) throw new AdminError(`포스터를 받지 못했어요 (${res.status}).`, 502)
  const ext = posterPath.split('.').pop()!.toLowerCase().replace('jpeg', 'jpg')
  return { base64: Buffer.from(await res.arrayBuffer()).toString('base64'), ext }
}
