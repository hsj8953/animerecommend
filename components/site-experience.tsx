'use client'

import { useEffect, useState } from 'react'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { Showcase } from '@/components/showcase'
import { SituationCollection } from '@/components/situation-collection'

export function SiteExperience() {
  const [entered, setEntered] = useState(false)
  const [view, setView] = useState<'home' | 'collection'>('home')
  const [pendingScroll, setPendingScroll] = useState<'ranking' | 'search' | null>(
    null,
  )

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

  if (!entered) {
    return (
      <div className="animate-in fade-in duration-500">
        <Hero fullScreen onEnter={() => setEntered(true)} />
      </div>
    )
  }

  if (view === 'collection') {
    return (
      <div className="animate-in fade-in duration-500">
        <SiteHeader
          onNavigateCollection={() => setView('collection')}
          onNavigateHome={goHome}
        />
        <SituationCollection onBack={() => setView('home')} />
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SiteHeader
        onNavigateCollection={() => setView('collection')}
        onNavigateHome={goHome}
      />
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
