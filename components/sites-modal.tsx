'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ExternalLink } from 'lucide-react'

// 여기에 애니 사이트 링크를 추가하세요.
// 예: { name: '라프텔', url: 'https://laftel.net', description: '국내 애니 스트리밍' }
export const animeSites: { name: string; url: string; description?: string }[] = [
  { name: '라프텔', url: 'https://laftel.net', description: '국내 애니 전문 스트리밍' },
  { name: '넷플릭스', url: 'https://www.netflix.com', description: '글로벌 스트리밍 · 애니 카테고리' },
  { name: '애니라이프', url: 'https://anilife.app/home', description: '국내 애니 전문 스트리밍' },
  { name: '링크애니', url: 'https://www.linkkf.net/view/lang/TV/', description: '국내 애니 전문 스트리밍' },
]

export function SitesModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || !mounted) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="애니 사이트 목록"
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
    >
      <button
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-6 shadow-2xl sm:rounded-2xl sm:p-8">
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <p className="text-sm font-medium text-primary">바로가기</p>
        <h2 className="mt-1 font-serif text-2xl text-foreground sm:text-3xl">
          애니 사이트
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          작품을 감상할 수 있는 사이트 모음입니다.
        </p>

        {animeSites.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-background/40 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              아직 등록된 사이트가 없습니다.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              components/sites-modal.tsx 의 animeSites 배열에 링크를 추가하세요.
            </p>
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {animeSites.map((site) => (
              <li key={site.url}>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-background/40 px-4 py-3 transition-colors hover:border-primary hover:bg-secondary"
                >
                  <div>
                    <p className="font-medium text-foreground">{site.name}</p>
                    {site.description ? (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {site.description}
                      </p>
                    ) : null}
                  </div>
                  <ExternalLink
                    className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>,
    document.body,
  )
}
