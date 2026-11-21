import { animeList, situationCategories, type Anime } from '@/lib/anime-data'

// "이거 좋았으면 이것도" 작품 고르기.
// 점수 = 겹치는 태그(드문 태그일수록 높게) + 같은 테마에 함께 들어간 횟수 + 겹치는 장르(조금)
// 같은 시리즈(제목이 이어지는 작품: 귀멸의 칼날 → 귀멸의 칼날 무한열차편)는 맨 앞에 온다.

const MIN_SCORE = 1.5

const tagWeight = (() => {
  const count = new Map<string, number>()
  for (const a of animeList) for (const t of a.tags ?? []) count.set(t, (count.get(t) ?? 0) + 1)
  const n = animeList.length
  // 많이 쓰인 태그(#배틀)는 낮게, 드문 태그(#수어)는 높게
  return (tag: string) => Math.log(n / (count.get(tag) ?? n))
})()

const themesOf = (() => {
  const map = new Map<string, Set<string>>()
  for (const t of situationCategories) {
    for (const id of t.animeIds) {
      if (!map.has(id)) map.set(id, new Set())
      map.get(id)!.add(t.id)
    }
  }
  return (id: string) => map.get(id) ?? new Set<string>()
})()

const baseTitle = (title: string) => title.replace(/[\s:：\-~]/g, '')

function sameSeries(a: Anime, b: Anime) {
  const x = baseTitle(a.title)
  const y = baseTitle(b.title)
  const [short, long] = x.length <= y.length ? [x, y] : [y, x]
  return short.length >= 2 && long.startsWith(short)
}

function score(a: Anime, b: Anime) {
  let s = 0
  const tags = new Set(a.tags ?? [])
  for (const t of b.tags ?? []) if (tags.has(t)) s += tagWeight(t)
  const themes = themesOf(a.id)
  for (const t of themesOf(b.id)) if (themes.has(t)) s += 1
  for (const g of b.genre) if (a.genre.includes(g)) s += 0.3
  if (sameSeries(a, b)) s += 10
  return s
}

const cache = new Map<string, Anime[]>()

export function getSimilarAnime(anime: Anime, limit = 6): Anime[] {
  const cached = cache.get(anime.id)
  if (cached) return cached
  const result = animeList
    .filter((b) => b.id !== anime.id)
    .map((b) => ({ b, s: score(anime, b) }))
    .filter((x) => x.s >= MIN_SCORE)
    .sort((x, y) => y.s - x.s || y.b.rating - x.b.rating)
    .slice(0, limit)
    .map((x) => x.b)
  cache.set(anime.id, result)
  return result
}
