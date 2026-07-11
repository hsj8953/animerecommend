'use client'

import { useMemo, useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { animeList, genres, type Anime } from '@/lib/anime-data'
import { PosterCard } from '@/components/poster-card'
import { TopTen } from '@/components/top-ten'
import { AnimeModal } from '@/components/anime-modal'

type SortKey = 'rating' | 'year' | 'title'

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'rating', label: '평점 높은순' },
  { key: 'year', label: '최신순' },
  { key: 'title', label: '가나다순' },
]

export function Showcase() {
  const [active, setActive] = useState<string>('전체')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('rating')
  const [selected, setSelected] = useState<Anime | null>(null)

  const q = query.trim().toLowerCase()

  const results = useMemo(() => {
    const filtered = animeList.filter((a) => {
      const matchGenre = active === '전체' || a.genre.includes(active)
      const matchQuery =
        q === '' ||
        a.title.toLowerCase().includes(q) ||
        a.original.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q)
      return matchGenre && matchQuery
    })

    return [...filtered].sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'year') return b.year - a.year
      return a.title.localeCompare(b.title, 'ko')
    })
  }, [active, q, sort])

  const isSearching = q !== ''

  return (
    <>
      <TopTen onSelect={setSelected} />

      <section id="collection" className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="anime-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목, 원제, 한 줄 소개로 검색"
              aria-label="작품 검색"
              className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="검색어 지우기"
                className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Genre filter + sort */}
        <div className="mb-12 flex flex-col gap-3 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="장르 필터" className="flex flex-wrap gap-2">
            {genres.map((genre) => {
              const isActive = active === genre
              return (
                <button
                  key={genre}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(genre)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {genre}
                </button>
              )
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden="true" />
            {sortOptions.map((opt) => {
              const isActive = sort === opt.key
              return (
                <button
                  key={opt.key}
                  onClick={() => setSort(opt.key)}
                  aria-pressed={isActive}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">
            {isSearching ? '검색 결과' : active === '전체' ? '전체 작품' : active}
          </h2>
          <span className="shrink-0 text-sm text-muted-foreground">{results.length}편</span>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {results.map((anime) => (
              <PosterCard key={anime.id} anime={anime} onSelect={setSelected} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <p className="font-serif text-xl text-foreground">검색 결과가 없어요</p>
            <p className="mt-2 text-sm text-muted-foreground">
              다른 키워드나 장르로 찾아보세요.
            </p>
            <button
              onClick={() => {
                setQuery('')
                setActive('전체')
              }}
              className="mt-5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              필터 초기화
            </button>
          </div>
        )}
      </section>

      <AnimeModal anime={selected} onClose={() => setSelected(null)} />
    </>
  )
}
