'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SideNav } from '@/components/side-nav'
import { SitesModal } from '@/components/sites-modal'
import { RandomModal } from '@/components/random-modal'
import { AnimeModal } from '@/components/anime-modal'
import { Hero } from '@/components/hero'
import { Showcase } from '@/components/showcase'
import { SituationCollection } from '@/components/situation-collection'
import { animeList, getAnimeById, type Anime } from '@/lib/anime-data'
import { useUrlState } from '@/lib/use-url-state'

// 사이트 안에서 연 상세 모달은 history.state 에 표시해 두고,
// 닫을 때 뒤로가기로 되돌린다 (공유 링크로 바로 들어온 경우엔 주소만 바꾼다)
const MODAL_MARK = { anipickModal: true }

export function SiteExperience() {
  const [url, navigate] = useUrlState()
  const { entered, view } = url
  const selectedAnime = getAnimeById(url.animeId)

  const [pendingScroll, setPendingScroll] = useState<'ranking' | 'search' | null>(
    null,
  )
  const [navOpen, setNavOpen] = useState(false)
  const [sitesOpen, setSitesOpen] = useState(false)
  const [randomOpen, setRandomOpen] = useState(false)
  const lastRandomId = useRef<string | null>(null)

  // 없는 작품 id 가 주소에 있으면 조용히 지운다
  useEffect(() => {
    if (url.animeId && !selectedAnime) {
      navigate({ ...url, animeId: null }, { replace: true })
    }
  }, [url, selectedAnime, navigate])

  const prevView = useRef(view)
  useEffect(() => {
    if (prevView.current !== view && view === 'theme') {
      window.scrollTo({ top: 0 })
    }
    prevView.current = view
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
    navigate({ entered: true, view: 'home', animeId: null })
  }

  const goTheme = () => {
    navigate({ entered: true, view: 'theme', animeId: null })
  }

  const openAnime = useCallback(
    (anime: Anime) => {
      // 이미 다른 작품 모달이 열려 있으면(랜덤 다시 뽑기 등) 기록을 쌓지 않고 바꿔치기.
      // 이때 기존 기록의 표시는 그대로 둬야 공유 링크로 들어온 사람이 닫을 때 사이트를 벗어나지 않는다
      const replace = url.animeId !== null
      navigate(
        { entered: true, view, animeId: anime.id },
        { replace, data: replace ? window.history.state : MODAL_MARK },
      )
    },
    [navigate, url.animeId, view],
  )

  const closeAnime = useCallback(() => {
    const openedInSite = window.history.state?.anipickModal === true
    if (openedInSite) {
      window.history.back()
    } else {
      navigate({ entered: true, view, animeId: null }, { replace: true })
    }
  }, [navigate, view])

  const pickRandom = (genre: string) => {
    const byGenre =
      genre === '전체'
        ? animeList
        : animeList.filter((a) => a.genre.some((g) => g.includes(genre)))
    // 같은 작품이 연속으로 나오지 않도록 제외 (풀이 2개 이상일 때만)
    const pool =
      byGenre.length > 1
        ? byGenre.filter((a) => a.id !== lastRandomId.current)
        : byGenre
    if (pool.length === 0) return
    const next = pool[Math.floor(Math.random() * pool.length)]
    lastRandomId.current = next.id
    setRandomOpen(false)
    openAnime(next)
  }

  if (!entered) {
    return (
      <div className="animate-in fade-in duration-500">
        <Hero fullScreen onEnter={() => goHome()} />
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
        onCollection={goTheme}
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
      <AnimeModal anime={selectedAnime} onClose={closeAnime} onSelect={openAnime} />
    </>
  )

  if (view === 'theme') {
    return (
      <div className="animate-in fade-in duration-500">
        {chrome}
        <SituationCollection onBack={() => goHome()} onSelect={openAnime} />
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {chrome}
      <Showcase onSelect={openAnime} />
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-serif text-lg text-foreground">
              Ani<span className="text-primary">Pick</span>
            </p>
            <p className="text-xs text-muted-foreground">
              작품 정보 및 포스터 일부 출처:{' '}
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                TMDB
              </a>
              . This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
