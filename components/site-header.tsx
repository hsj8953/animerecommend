'use client'

import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function SiteHeader({
  onMenuClick,
  onNavigateHome,
}: {
  onMenuClick: () => void
  onNavigateHome?: (target?: 'ranking' | 'search') => void
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-border bg-background/80 backdrop-blur-md'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onMenuClick}
            aria-label="메뉴 열기"
            className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <button
            onClick={() => onNavigateHome?.()}
            className="font-serif text-xl text-foreground"
          >
            Ani<span className="text-primary">Pick</span>
          </button>
        </div>

        <ThemeToggle />
      </div>
    </header>
  )
}
