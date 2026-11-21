import 'server-only'

import { genres, type Anime, type SituationCategory } from '@/lib/anime-data'
import { AdminError } from '@/lib/admin/env'
import { commitFiles, getHead, readJsonFile, type FileChange } from '@/lib/admin/github'
import { downloadPoster } from '@/lib/admin/tmdb'

const ANIME_FILE = 'data/anime.json'
const THEME_FILE = 'data/themes.json'
const SITE_GENRES: string[] = genres.filter((g) => g !== '전체')

const toJson = (value: unknown) => JSON.stringify(value, null, 2) + '\n'

// 배포된 사이트가 아니라 GitHub 의 최신 데이터를 읽는다 (방금 저장한 것도 바로 보이게)
export async function loadLatest() {
  const head = await getHead()
  const [anime, themes] = await Promise.all([
    readJsonFile<Anime[]>(ANIME_FILE, head.commitSha),
    readJsonFile<SituationCategory[]>(THEME_FILE, head.commitSha),
  ])
  return { head, anime, themes }
}

export type SaveInput = {
  mode: 'create' | 'edit'
  anime: Omit<Anime, 'poster'>
  themeIds: string[]
  tmdbPosterPath?: string | null
}

function clean(input: SaveInput['anime'], mode: SaveInput['mode']): Omit<Anime, 'poster'> {
  const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const id = text(input.id)
  if (!id) throw new AdminError('id 를 입력해 주세요.')
  if (mode === 'create' && !/^[a-z0-9-]+$/.test(id)) {
    throw new AdminError('id 는 영어 소문자, 숫자, - 만 쓸 수 있어요.')
  }
  const title = text(input.title)
  if (!title) throw new AdminError('제목을 입력해 주세요.')
  const genre = [...new Set(Array.isArray(input.genre) ? input.genre : [])]
  if (genre.length === 0) throw new AdminError('장르를 하나 이상 골라 주세요.')
  const unknown = genre.filter((g) => !SITE_GENRES.includes(g))
  if (unknown.length) throw new AdminError(`모르는 장르: ${unknown.join(', ')}`)
  const year = Number(input.year)
  if (!Number.isInteger(year) || year < 1950 || year > 2100) {
    throw new AdminError('연도는 4자리 숫자로 입력해 주세요.')
  }
  const rating = Number(input.rating)
  if (!Number.isFinite(rating) || rating < 0 || rating > 10) {
    throw new AdminError('평점은 0~10 사이로 입력해 주세요.')
  }
  const tags = [
    ...new Set(
      (Array.isArray(input.tags) ? input.tags : [])
        .map((t) => text(t).replace(/^#/, ''))
        .filter(Boolean),
    ),
  ]
  if (tags.some((t) => t.length > 12)) throw new AdminError('태그는 12자 이하로 써 주세요.')
  if (tags.length > 6) throw new AdminError('태그는 6개까지 달 수 있어요.')
  const tagline = text(input.tagline)
  if (!tagline) throw new AdminError('한 줄 소개를 입력해 주세요.')
  return {
    id,
    title,
    original: text(input.original),
    genre,
    tags,
    year,
    rating: Math.round(rating * 10) / 10,
    tagline,
    description: text(input.description),
  }
}

// 다른 작품이 같이 쓰지 않는 포스터 파일이면 지운다
function posterCleanup(anime: Anime[], oldPoster: string | undefined, keep?: string): FileChange[] {
  if (!oldPoster || !oldPoster.startsWith('/posters/') || oldPoster === keep) return []
  if (anime.some((a) => a.poster === oldPoster)) return []
  return [{ path: `public${oldPoster}`, delete: true }]
}

export async function saveAnime(input: SaveInput) {
  const fields = clean(input.anime, input.mode)
  const { head, anime, themes } = await loadLatest()

  const index = anime.findIndex((a) => a.id === fields.id)
  if (input.mode === 'create' && index !== -1) {
    throw new AdminError(`id "${fields.id}" 는 이미 있어요. 다른 id 를 써 주세요.`)
  }
  if (input.mode === 'edit' && index === -1) {
    throw new AdminError('수정하려는 작품을 찾지 못했어요. 새로고침해 주세요.', 404)
  }
  const previous = index === -1 ? undefined : anime[index]

  const changes: FileChange[] = []
  let poster = previous?.poster ?? '/placeholder.svg'
  if (input.tmdbPosterPath) {
    const file = await downloadPoster(input.tmdbPosterPath)
    // 포스터를 바꿀 때마다 파일 이름을 새로 만든다. 이름이 같으면 이미지 캐시(31일)와
    // 앱 저장본이 예전 포스터를 계속 보여줄 수 있어서.
    poster = `/posters/${fields.id}-${Date.now().toString(36)}.${file.ext}`
    changes.push({ path: `public${poster}`, base64: file.base64 })
  }

  const next: Anime = { ...fields, poster }
  const nextList = [...anime]
  if (index === -1) nextList.push(next)
  else nextList[index] = next
  changes.push(...posterCleanup(nextList, previous?.poster, poster))

  const wanted = new Set(Array.isArray(input.themeIds) ? input.themeIds : [])
  const nextThemes = themes.map((t) => {
    const has = t.animeIds.includes(fields.id)
    if (wanted.has(t.id) && !has) return { ...t, animeIds: [...t.animeIds, fields.id] }
    if (!wanted.has(t.id) && has) return { ...t, animeIds: t.animeIds.filter((x) => x !== fields.id) }
    return t
  })

  changes.push({ path: ANIME_FILE, text: toJson(nextList) })
  if (JSON.stringify(nextThemes) !== JSON.stringify(themes)) {
    changes.push({ path: THEME_FILE, text: toJson(nextThemes) })
  }

  const verb = input.mode === 'create' ? '추가' : '수정'
  const commit = await commitFiles(head, changes, `관리자: '${fields.title}' ${verb}`)
  return { commit, anime: next }
}

export async function deleteAnime(id: string) {
  const { head, anime, themes } = await loadLatest()
  const target = anime.find((a) => a.id === id)
  if (!target) throw new AdminError('이미 지워졌거나 없는 작품이에요.', 404)

  const nextList = anime.filter((a) => a.id !== id)
  const nextThemes = themes.map((t) =>
    t.animeIds.includes(id) ? { ...t, animeIds: t.animeIds.filter((x) => x !== id) } : t,
  )
  const changes: FileChange[] = [
    { path: ANIME_FILE, text: toJson(nextList) },
    ...posterCleanup(nextList, target.poster),
  ]
  if (JSON.stringify(nextThemes) !== JSON.stringify(themes)) {
    changes.push({ path: THEME_FILE, text: toJson(nextThemes) })
  }
  const commit = await commitFiles(head, changes, `관리자: '${target.title}' 삭제`)
  return { commit }
}
