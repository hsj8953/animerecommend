'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useModal } from '@/lib/use-modal'
import { usePwa, type Platform } from '@/lib/pwa'

// 설치 팝업을 바로 띄울 수 없는 브라우저(아이폰, 삼성 인터넷 등)에서 보여주는 설치 방법
const GUIDES: Record<Platform, { title: string; steps: string[] }> = {
  ios: {
    title: '아이폰 · 아이패드',
    steps: [
      'Safari로 이 사이트를 열어요. (크롬 앱이면 주소창 오른쪽 공유 버튼을 써요)',
      '화면 아래(또는 위)의 공유 버튼(네모에 화살표)을 눌러요.',
      '목록을 내려서 「홈 화면에 추가」를 누르고, 오른쪽 위 「추가」를 눌러요.',
    ],
  },
  samsung: {
    title: '삼성 인터넷',
    steps: [
      '화면 아래 메뉴 버튼(≡)을 눌러요.',
      '「현재 페이지 추가」 → 「홈 화면」을 눌러요.',
      '주소창에 설치 아이콘(↓)이 보이면 그걸 눌러도 돼요.',
    ],
  },
  android: {
    title: '안드로이드',
    steps: [
      '오른쪽 위 메뉴 버튼(⋮)을 눌러요.',
      '「앱 설치」 또는 「홈 화면에 추가」를 눌러요.',
      '안 보이면 크롬으로 이 사이트를 열어서 다시 해 봐요.',
    ],
  },
  desktop: {
    title: '컴퓨터',
    steps: [
      '크롬이나 엣지로 이 사이트를 열어요.',
      '주소창 오른쪽 끝의 설치 아이콘(모니터에 ↓)을 눌러요.',
      '안 보이면 메뉴(⋮) → 「AniPick 설치」 또는 「앱 → 이 사이트를 앱으로 설치」를 눌러요.',
    ],
  },
}

export function InstallGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)
  const { platform } = usePwa()

  useEffect(() => {
    setMounted(true)
  }, [])

  useModal(open, onClose, closeRef)

  if (!open || !mounted) return null
  const guide = GUIDES[platform]

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="앱 설치 방법"
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
    >
      <button aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-black/80" />

      <div className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-card p-6 shadow-2xl sm:rounded-2xl sm:p-8">
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-background/85 text-foreground transition-colors hover:bg-background"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <p className="text-sm font-medium text-primary">{guide.title}</p>
        <h2 className="mt-1 font-serif text-2xl text-foreground">앱으로 설치하기</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          홈 화면에 AniPick 아이콘이 생기고, 주소창 없이 앱처럼 열려요.
        </p>

        <ol className="mt-6 flex flex-col gap-4">
          {guide.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed text-foreground">{step}</span>
            </li>
          ))}
        </ol>

        <button
          onClick={onClose}
          className="mt-8 w-full rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary"
        >
          확인
        </button>
      </div>
    </div>,
    document.body,
  )
}
