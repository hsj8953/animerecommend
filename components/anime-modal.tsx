'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Star, X, Calendar, Tag } from 'lucide-react'
import type { Anime } from '@/lib/anime-data'
import { getSimilarAnime } from '@/lib/similar'
import { useModal } from '@/lib/use-modal'

export function AnimeModal({
  anime,
  onClose,
  onSelect,
}: {
  anime: Anime | null
  onClose: () => void
  // 비슷한 작품을 눌렀을 때 (없으면 비슷한 작품 줄을 숨긴다)
  onSelect?: (anime: Anime) => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useModal(Boolean(anime), onClose, closeRef)

  // 비슷한 작품으로 넘어가면 창 맨 위부터 보이게
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 })
  }, [anime?.id])

  if (!anime || !mounted) return null

  const similar = onSelect ? getSimilarAnime(anime) : []

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${anime.title} 상세 정보`}
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
    >
      <button
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl"
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <div className="grid gap-0 sm:grid-cols-[240px_1fr]">
          <div className="relative aspect-[2/3] sm:aspect-auto sm:min-h-[360px]">
            <Image
              src={anime.poster || '/placeholder.svg'}
              alt={`${anime.title} 포스터`}
              fill
              sizes="240px"
              className="object-cover"
            />
            {/* <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent sm:bg-gradient-to-l" /> */}
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              {anime.genre.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                >
                  <Tag className="size-3" aria-hidden="true" />
                  {g}
                </span>
              ))}
            </div>

            <h2 className="mt-4 font-serif text-3xl leading-tight text-balance text-foreground">
              {anime.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{anime.original}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-300">
                <Star className="size-4 fill-amber-300 text-amber-300" aria-hidden="true" />
                {anime.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="size-4" aria-hidden="true" />
                {anime.year}
              </span>
            </div>

            {anime.tags?.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1" aria-label="태그">
                {anime.tags.map((t) => (
                  <li key={t} className="text-sm font-medium text-primary">
                    #{t.replace(/\s+/g, '')}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-6 font-serif text-lg text-foreground text-pretty">
              {anime.tagline}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {anime.description}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  anime.original + ' anime',
                )}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                더 알아보기
              </a>
              <button
                onClick={onClose}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                닫기
              </button>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <section
            aria-label="비슷한 작품"
            className="border-t border-border px-6 pb-7 pt-6 sm:px-8"
          >
            <h3 className="text-sm font-semibold text-foreground">
              이거 좋았으면 이것도
            </h3>
            <ul className="-mx-1 mt-3 flex gap-3 overflow-x-auto px-1 pb-1">
              {similar.map((s) => (
                <li key={s.id} className="w-24 shrink-0 sm:w-28">
                  <button
                    onClick={() => onSelect?.(s)}
                    className="group block w-full text-left"
                  >
                    <span className="relative block aspect-[2/3] overflow-hidden rounded-lg bg-secondary">
                      <Image
                        src={s.poster || '/placeholder.svg'}
                        alt=""
                        fill
                        sizes="112px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </span>
                    <span className="mt-1.5 line-clamp-2 text-xs font-medium leading-snug text-foreground group-hover:text-primary">
                      {s.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>,
    document.body,
  )
}
