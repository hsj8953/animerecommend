'use client'

import { useEffect, useRef } from 'react'
import { Home, LayoutGrid, Shuffle, Search, Globe, X } from 'lucide-react'

type NavAction = {
  key: string
  label: string
  description: string
  icon: typeof Home
  onClick: () => void
}

export function SideNav({
  open,
  onClose,
  onHome,
  onCollection,
  onRandom,
  onSearch,
  onSites,
}: {
  open: boolean
  onClose: () => void
  onHome: () => void
  onCollection: () => void
  onRandom: () => void
  onSearch: () => void
  onSites: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

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

  const run = (fn: () => void) => () => {
    onClose()
    fn()
  }

  const primary: NavAction[] = [
    { key: 'home', label: '홈', description: '메인으로 돌아가기', icon: Home, onClick: run(onHome) },
    { key: 'collection', label: '컬렉션', description: '상황별 추천 모음', icon: LayoutGrid, onClick: run(onCollection) },
    { key: 'random', label: '랜덤 추천', description: '장르별로 골라줄게요', icon: Shuffle, onClick: run(onRandom) },
  ]

  const secondary: NavAction[] = [
    { key: 'search', label: '작품 검색', description: '제목·원제·소개로 찾기', icon: Search, onClick: run(onSearch) },
    { key: 'sites', label: '애니 사이트', description: '정식 스트리밍 바로가기', icon: Globe, onClick: run(onSites) },
  ]

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        aria-label="메뉴 닫기"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="사이트 메뉴"
        className={`absolute inset-y-0 left-0 flex w-[280px] max-w-[82vw] transform-gpu flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-out will-change-transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <span className="font-serif text-xl text-foreground">
            Ani<span className="text-primary">Pick</span>
          </span>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="메뉴 닫기"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="주요 메뉴">
          <ul className="flex flex-col gap-1">
            {primary.map((item) => (
              <li key={item.key}>
                <NavItem item={item} />
              </li>
            ))}
          </ul>

          <div className="my-4 border-t border-border" />

          <ul className="flex flex-col gap-1">
            {secondary.map((item) => (
              <li key={item.key}>
                <NavItem item={item} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

function NavItem({ item }: { item: NavAction }) {
  const Icon = item.icon
  return (
    <button
      onClick={item.onClick}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-secondary"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{item.label}</span>
        <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
      </span>
    </button>
  )
}
