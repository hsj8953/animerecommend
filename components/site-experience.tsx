'use client'

import { useEffect, useState } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SideNav } from '@/components/side-nav'
import { SitesModal } from '@/components/sites-modal'
import { RandomModal } from '@/components/random-modal'
import { AnimeModal } from '@/components/anime-modal'
import { Hero } from '@/components/hero'
import { Showcase } from '@/components/showcase'
import { SituationCollection } from '@/components/situation-collection'
import { animeList, type Anime } from '@/lib/anime-data'

export function SiteExperience() {
  const [entered, setEntered] = useState(false)
  const [view, setView] = useState<'home' | 'collection'>('home')
  const [pendingScroll, setPendingScroll] = useState<'ranking' | 'search' | null>(
    null,
  )
  const [navOpen, setNavOpen] = useState(false)
  const [sitesOpen, setSitesOpen] = useState(false)
  const [randomOpen, setRandomOpen] = useState(false)
  const [randomAnime, setRandomAnime] = useState<Anime | null>(null)

  useEffect(() => {
    if (view === 'collection') {
      window.scrollTo({ top: 0 })
    }
  }, [view])

  useEffect(() => {
    if (view !== 'home' || !pendingScroll) return
    const id = pendingScroll === 'ranking' ? 'ranking' : 'collection'
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      if (pendingScroll === 'search') {
        setTimeout(() => {
          const input = document.getElementById(
            'anime-search',
          ) as HTMLInputElement | null
          input?.focus()
        }, 500)
      }
      setPendingScroll(null)
    })
  }, [view, pendingScroll])

  const goHome = (target?: 'ranking' | 'search') => {
    if (!target) window.scrollTo({ top: 0, behavior: 'smooth' })
    setPendingScroll(target ?? null)
    setView('home')
  }

  const pickRandom = (genre: string) => {
    const byGenre =
      genre === '전체'
        ? animeList
        : animeList.filter((a) => a.genre.some((g) => g.includes(genre)))
    // 같은 작품이 연속으로 나오지 않도록 제외 (풀이 2개 이상일 때만)
    const pool =
      byGenre.length > 1
        ? byGenre.filter((a) => a.id !== randomAnime?.id)
        : byGenre
    if (pool.length === 0) return
    const next = pool[Math.floor(Math.random() * pool.length)]
    setRandomOpen(false)
    setRandomAnime(next)
  }

  if (!entered) {
    return (
      <div className="animate-in fade-in duration-500">
        <Hero fullScreen onEnter={() => setEntered(true)} />
      </div>
    )
  }

  const chrome = (
    <>
      <SiteHeader onMenuClick={() => setNavOpen(true)} onNavigateHome={goHome} />
      <SideNav
        open={navOpen}
        onClose={() => setNavOpen(false)}
        onHome={() => goHome()}
        onCollection={() => setView('collection')}
        onRandom={() => setRandomOpen(true)}
        onSearch={() => goHome('search')}
        onSites={() => setSitesOpen(true)}
      />
      <SitesModal open={sitesOpen} onClose={() => setSitesOpen(false)} />
      <RandomModal
        open={randomOpen}
        onClose={() => setRandomOpen(false)}
        onPick={pickRandom}
      />
      <AnimeModal anime={randomAnime} onClose={() => setRandomAnime(null)} />
    </>
  )

  if (view === 'collection') {
    return (
      <div className="animate-in fade-in duration-500">
        {chrome}
        <SituationCollection onBack={() => setView('home')} />
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {chrome}
      <Showcase />
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start">
            <p className="font-serif text-lg text-foreground">
              Ani<span className="text-primary">Pick</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
