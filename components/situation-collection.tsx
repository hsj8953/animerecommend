'use client'

import { useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  situationCategories,
  getAnimeByIds,
  type Anime,
  type SituationCategory,
} from '@/lib/anime-data'
import { PosterCard } from '@/components/poster-card'
import { AnimeModal } from '@/components/anime-modal'

function CategoryRow({
  category,
  onSelect,
}: {
  category: SituationCategory
  onSelect: (anime: Anime) => void
}) {
  const scrollerRef = useRef<HTMLUListElement>(null)
  const animes = getAnimeByIds(category.animeIds)

  const scrollBy = (dir: number) => {
    scrollerRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' })
  }

  return (
    <section aria-label={category.title}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-serif text-xl text-foreground sm:text-2xl">
            <span aria-hidden="true">{category.emoji}</span>
            <span className="text-balance">{category.title}</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => scrollBy(-1)}
            aria-label={`${category.title} 이전 보기`}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-card"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label={`${category.title} 다음 보기`}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-card"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ul
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {animes.map((anime) => (
          <li key={anime.id} className="w-40 shrink-0 snap-start sm:w-48">
            <PosterCard anime={anime} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function SituationCollection({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<Anime | null>(null)

  return (
    <>
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            홈으로
          </button>
          <p className="text-sm font-medium text-primary">상황별 추천</p>
          <h1 className="mt-1 font-serif text-3xl text-foreground text-balance sm:text-4xl">
            지금 이 순간에 딱 맞는 애니
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
            기분과 상황에 따라 골라보세요. 자기 전 잔잔한 작품부터 눈물 보장 명작까지, 상황별로
            엄선했습니다.
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-14 sm:px-6 lg:px-8">
        {situationCategories.map((category) => (
          <CategoryRow key={category.id} category={category} onSelect={setSelected} />
        ))}
      </div>

      <AnimeModal anime={selected} onClose={() => setSelected(null)} />
    </>
  )
}
