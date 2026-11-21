'use client'

import { useSyncExternalStore } from 'react'

// 앱(PWA) 설치 상태를 한곳에서 관리한다.
// 크롬(안드로이드·PC)은 설치 가능할 때 beforeinstallprompt 를 한 번 보내는데,
// 메뉴가 열리기 전(첫 화면)에 올 수 있어서 페이지가 열리자마자 받아 둔다.

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type Platform = 'ios' | 'samsung' | 'android' | 'desktop'

type PwaState = {
  canPrompt: boolean
  installed: boolean
  platform: Platform
}

let deferred: InstallPromptEvent | null = null
let state: PwaState = { canPrompt: false, installed: false, platform: 'desktop' }
const SERVER_STATE: PwaState = state
const listeners = new Set<() => void>()
let started = false

function set(next: Partial<PwaState>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  if (/iPhone|iPad|iPod/.test(ua) || iPadOs) return 'ios'
  if (/SamsungBrowser/.test(ua)) return 'samsung'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function startPwa() {
  if (started || typeof window === 'undefined') return
  started = true
  set({ platform: detectPlatform(), installed: isStandalone() })

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // 브라우저 기본 배너 대신 메뉴의 버튼으로 띄운다
    deferred = e as InstallPromptEvent
    set({ canPrompt: true })
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    set({ canPrompt: false, installed: true })
  })

  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // 서비스 워커가 안 돼도 사이트는 그대로 동작한다
    })
  }
}

/** 설치 팝업을 띄운다. 띄울 수 없으면 false (설치 방법 안내를 보여주면 된다) */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  const e = deferred
  deferred = null
  set({ canPrompt: false })
  await e.prompt()
  const { outcome } = await e.userChoice
  if (outcome === 'accepted') set({ installed: true })
  return true
}

export function usePwa(): PwaState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => SERVER_STATE,
  )
}
