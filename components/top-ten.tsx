'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { animeList, type Anime } from '@/lib/anime-data'

const topTen = [...animeList].sort((a, b) => b.rating - a.rating).slice(0, 10)

export function TopTen({ onSelect }: { onSelect: (anime: Anime) => void }) {
  const scrollerRef = useRef<HTMLOListElement>(null)

  const scrollBy = (dir: number) => {
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <section id="ranking" className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">평점 기준</p>
            <h2 className="mt-1 font-serif text-3xl text-foreground sm:text-4xl">
              TOP 10 랭킹
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="이전 랭킹 보기"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-card"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="다음 랭킹 보기"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-card"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <ol
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {topTen.map((anime, i) => (
            <li key={anime.id} className="shrink-0 snap-start">
              <button
                onClick={() => onSelect(anime)}
                aria-label={`${i + 1}위 ${anime.title} 상세 보기`}
                className="group flex w-[220px] items-end gap-2 text-left sm:w-[260px]"
              >
                <span
                  className="font-serif text-6xl font-bold leading-none text-border transition-colors group-hover:text-primary sm:text-7xl"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="relative aspect-[2/3] w-32 shrink-0 overflow-hidden rounded-lg border border-border sm:w-36">
                  <Image
                    src={anime.poster || '/placeholder.svg'}
                    alt={`${anime.title} 포스터`}
                    fill
                    sizes="144px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 right-2">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-300">
                      <Star className="size-3 fill-amber-300 text-amber-300" aria-hidden="true" />
                      {anime.rating.toFixed(1)}
                    </span>
                    <span className="mt-0.5 block truncate font-serif text-sm text-foreground">
                      {anime.title}
                    </span>
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
