'use client'

import Image from 'next/image'
import { animeList, genres } from '@/lib/anime-data'

export function Hero({
  onEnter,
  fullScreen = false,
}: {
  onEnter?: () => void
  fullScreen?: boolean
}) {
  const total = animeList.length
  const genreCount = genres.filter((g) => g !== '전체').length
  const avg = (
    animeList.reduce((sum, a) => sum + a.rating, 0) / total
  ).toFixed(1)

  const half = Math.ceil(animeList.length / 2)
  const rowOne = animeList.slice(0, half)
  const rowTwo = animeList.slice(half)

  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 flex flex-col justify-center gap-3 sm:gap-4">
        <MarqueeRow items={rowOne} direction="left" />
        <MarqueeRow items={rowTwo} direction="right" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
      </div>

      <div
        className={`relative mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 ${
          fullScreen ? 'min-h-screen' : 'min-h-[70vh]'
        }`}
      >
        <h1 className="font-serif text-4xl leading-[1.1] text-balance text-foreground sm:text-6xl lg:text-7xl">
          장르별 <span className="text-primary">애니메이션</span>
          <br />
          추천 컬렉션
        </h1>

        <div className="mt-10 flex items-center gap-5 sm:gap-8">
          <Stat value={`${total}편`} label="작품" />
          <div className="h-8 w-px bg-border" aria-hidden="true" />
          <Stat value={`${genreCount}개`} label="장르" />
          <div className="h-8 w-px bg-border" aria-hidden="true" />
          <Stat value={avg} label="평균 평점" />
        </div>

        {onEnter ? (
          <button
            onClick={onEnter}
            className="mt-10 cursor-pointer rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            작품 보러가기
          </button>
        ) : (
          <a
            href="#collection"
            className="mt-10 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            작품 보러가기
          </a>
        )}
      </div>
    </header>
  )
}

function MarqueeRow({
  items,
  direction,
}: {
  items: typeof animeList
  direction: 'left' | 'right'
}) {
  // 화면 폭보다 넓게 채우도록 한 세트를 충분히 반복한 뒤, 그 세트를 2배로 복제해
  // translateX(-50%) 순환 시 오른쪽에 빈 여백이 생기지 않도록 한다.
  const MIN_ITEMS_PER_SET = 16
  const set: typeof items = []
  while (set.length < MIN_ITEMS_PER_SET) {
    set.push(...items)
  }
  const doubled = [...set, ...set]
  return (
    <div className="flex w-full overflow-hidden" aria-hidden="true">
      <div
        className={`flex w-max shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4 ${
          direction === 'left'
            ? 'animate-hero-marquee-left'
            : 'animate-hero-marquee-right'
        }`}
      >
        {doubled.map((anime, index) => (
          <div
            key={`${anime.id}-${index}`}
            className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-lg sm:w-36 lg:w-44"
          >
            <Image
              src={anime.poster || '/placeholder.svg'}
              alt=""
              fill
              sizes="(max-width: 640px) 112px, (max-width: 1024px) 144px, 176px"
              className="object-cover opacity-80"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-serif text-2xl text-foreground sm:text-3xl">
        {value}
      </span>
      <span className="mt-1 text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
