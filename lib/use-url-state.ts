'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

// 화면 상태를 주소(쿼리스트링)에 담는다.
//   /                         → 첫 화면(히어로)
//   /?view=home               → 전체 작품
//   /?view=theme              → 테마별 추천
//   /?view=home&anime=frieren → 작품 상세 모달이 열린 상태 (이 링크를 친구에게 공유 가능)
// 새로고침·뒤로가기·링크 공유가 모두 이 주소를 기준으로 동작한다.

export type View = 'home' | 'theme'

export type UrlState = {
  entered: boolean
  view: View
  animeId: string | null
}

// pushState/replaceState 는 popstate 를 발생시키지 않으므로 직접 알린다
const CHANGE_EVENT = 'anipick:urlchange'

function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback)
  window.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}

const getSnapshot = () => window.location.search
// 서버에서는 주소를 알 수 없으니 첫 화면 기준으로 그린다
const getServerSnapshot = () => ''

export function parseUrlState(search: string): UrlState {
  const params = new URLSearchParams(search)
  const animeId = params.get('anime') || null
  return {
    entered: params.has('view') || animeId !== null,
    view: params.get('view') === 'theme' ? 'theme' : 'home',
    animeId,
  }
}

function toSearch(state: UrlState): string {
  if (!state.entered) return ''
  const params = new URLSearchParams()
  params.set('view', state.view)
  if (state.animeId) params.set('anime', state.animeId)
  return `?${params.toString()}`
}

export type NavigateOptions = {
  replace?: boolean
  // history.state 에 남길 값 (예: 사이트 안에서 연 모달인지 표시)
  data?: Record<string, unknown>
}

export function useUrlState() {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const state = useMemo(() => parseUrlState(search), [search])

  const navigate = useCallback((next: UrlState, options: NavigateOptions = {}) => {
    const url = window.location.pathname + toSearch(next)
    const current = window.location.pathname + window.location.search
    if (url === current) return
    if (options.replace) {
      window.history.replaceState(options.data ?? null, '', url)
    } else {
      window.history.pushState(options.data ?? null, '', url)
    }
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  return [state, navigate] as const
}
