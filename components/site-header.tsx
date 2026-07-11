'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { SitesModal } from '@/components/sites-modal'
import { ThemeToggle } from '@/components/theme-toggle'

export function SiteHeader({
  onNavigateCollection,
  onNavigateHome,
}: {
  onNavigateCollection?: () => void
  onNavigateHome?: (target?: 'ranking' | 'search') => void
}) {
  const [scrolled, setScrolled] = useState(false)
  const [sitesOpen, setSitesOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const focusSearch = () => {
    onNavigateHome?.('search')
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-border bg-background/80 backdrop-blur-md'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigateHome?.()}
          className="font-serif text-xl text-foreground"
        >
          Ani<span className="text-primary">Pick</span>
        </button>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="주요 메뉴">
          <button
            onClick={() => onNavigateHome?.('ranking')}
            className="hidden whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
          >
            TOP 10
          </button>
          <button
            onClick={onNavigateCollection}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            컬렉션
          </button>
          <button
            onClick={() => setSitesOpen(true)}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            애니 사이트
          </button>
          <button
            onClick={focusSearch}
            aria-label="작품 검색"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Search className="size-4" aria-hidden="true" />
          </button>
          <ThemeToggle />
        </nav>
      </div>

      <SitesModal open={sitesOpen} onClose={() => setSitesOpen(false)} />
    </header>
  )
}
