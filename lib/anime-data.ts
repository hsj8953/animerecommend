import animeData from '@/data/anime.json'
import themeData from '@/data/themes.json'

export type Anime = {
  id: string
  title: string
  original: string
  genre: string[]
  // 상세 창에 보이는 세부 태그 (#이세계 #요리 ...). 비슷한 작품을 고를 때도 쓴다
  tags: string[]
  year: number
  rating: number
  tagline: string
  description: string
  poster: string
}

export const genres = [
  '전체',
  '액션', 
  '어드벤처',
  '판타지',
  '스릴러',
  '심리',
  'SF',
  '미스터리',
  '로맨스',
  '드라마',
  '코미디',
  '극장판',
] as const

export type SituationCategory = {
  id: string
  emoji: string
  title: string
  description: string
  animeIds: string[]
}

// 테마별 추천 목록은 data/themes.json 에 있다 (관리자 페이지에서 수정 가능)
export const situationCategories: SituationCategory[] = themeData

export const animeList: Anime[] = animeData

const animeById = new Map(animeList.map((a) => [a.id, a]))

export function getAnimeById(id: string | null): Anime | null {
  return (id && animeById.get(id)) || null
}

// 평점 높은순. 평점이 같으면 최신작 → 가나다순으로 한 번 더 정렬해서 순서가 항상 같게 한다
export function compareByRating(a: Anime, b: Anime): number {
  return (
    b.rating - a.rating ||
    b.year - a.year ||
    a.title.localeCompare(b.title, 'ko')
  )
}

// 최신순. 같은 해면 평점 높은순
export function compareByYear(a: Anime, b: Anime): number {
  return b.year - a.year || compareByRating(a, b)
}

export const animeByRating: Anime[] = [...animeList].sort(compareByRating)

export function getAnimeByIds(ids: string[]): Anime[] {
  return ids
    .map((id) => animeById.get(id))
    .filter((a): a is Anime => Boolean(a))
}
