'use client'

import { useEffect, useRef, useState } from 'react'
import { Shuffle, X } from 'lucide-react'
import { genres } from '@/lib/anime-data'
import { useModal } from '@/lib/use-modal'

export function RandomModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean
  onClose: () => void
  onPick: (genre: string) => void
}) {
  const [selected, setSelected] = useState<string>('전체')
  const closeRef = useRef<HTMLButtonElement>(null)

  useModal(open, onClose, closeRef)

  useEffect(() => {
    if (open) setSelected('전체')
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        aria-label="랜덤 추천 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="랜덤 추천 장르 선택"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shuffle className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground">랜덤 추천</h2>
              <p className="text-xs text-muted-foreground">장르를 고르면 그 안에서 골라줄게요</p>
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="닫기"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="mb-3 text-sm font-medium text-foreground">장르 선택</p>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => {
              const active = selected === g
              return (
                <button
                  key={g}
                  onClick={() => setSelected(g)}
                  aria-pressed={active}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {g}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => onPick(selected)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Shuffle className="size-4" aria-hidden="true" />
            {selected === '전체' ? '전체에서 랜덤 추천받기' : `'${selected}'에서 랜덤 추천받기`}
          </button>
        </div>
      </div>
    </div>
  )
}
