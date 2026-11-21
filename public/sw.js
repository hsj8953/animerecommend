// AniPick 서비스 워커 — 앱(PWA)으로 설치했을 때 빠르게 열리고, 인터넷이 끊겨도 마지막 화면을 보여준다.
//
// - 빌드된 JS/CSS: 파일 이름에 버전이 붙어 있어서 한 번 받으면 계속 쓴다 (cache-first)
// - 포스터 · 아이콘: 저장본을 바로 보여주고, 뒤에서 새로 받아 둔다 (관리자 페이지에서 포스터를 바꿔도 다음번엔 반영)
// - 페이지(HTML): 항상 최신을 먼저 받고, 실패하면(오프라인) 저장해 둔 걸 보여준다 (network-first)
// - 관리자 페이지와 API 는 절대 저장하지 않는다
//
// 이 파일을 크게 바꿨을 때는 VERSION 을 올리면 예전 저장본이 지워진다.

const VERSION = 'v2'
const STATIC_CACHE = `anipick-static-${VERSION}`
const PAGE_CACHE = `anipick-pages-${VERSION}`
const MAX_STATIC_ENTRIES = 300

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([STATIC_CACHE, PAGE_CACHE])
      for (const key of await caches.keys()) {
        if (key.startsWith('anipick-') && !keep.has(key)) await caches.delete(key)
      }
      await self.clients.claim()
    })(),
  )
})

function isBuildAsset(url) {
  return url.pathname.startsWith('/_next/static/')
}

function isImage(url) {
  return (
    url.pathname === '/_next/image' || // 크기를 줄인 포스터 (?url=...&w=... 마다 따로 저장)
    url.pathname.startsWith('/posters/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/icon.svg' ||
    url.pathname === '/apple-icon.png' ||
    url.pathname === '/favicon.ico'
  )
}

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i])
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE)
  const hit = await cache.match(request)
  if (hit) return hit
  const res = await fetch(request)
  if (res.ok) {
    cache.put(request, res.clone())
    trim(STATIC_CACHE, MAX_STATIC_ENTRIES)
  }
  return res
}

async function staleWhileRevalidate(event, request) {
  const cache = await caches.open(STATIC_CACHE)
  const hit = await cache.match(request)
  const refresh = fetch(request)
    .then((res) => {
      if (res.ok) {
        cache.put(request, res.clone())
        trim(STATIC_CACHE, MAX_STATIC_ENTRIES)
      }
      return res
    })
    .catch(() => hit)
  if (hit) {
    event.waitUntil(refresh)
    return hit
  }
  return refresh
}

async function networkFirst(request) {
  const cache = await caches.open(PAGE_CACHE)
  try {
    const res = await fetch(request)
    // 화면은 주소 뒷부분(?anime=...)만 다르고 HTML 은 같으니 한 장만 저장
    if (res.ok) cache.put('/', res.clone())
    return res
  } catch (err) {
    const saved = await cache.match('/')
    if (saved) return saved
    throw err
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/')) return

  if (isBuildAsset(url)) {
    event.respondWith(cacheFirst(request))
  } else if (isImage(url)) {
    event.respondWith(staleWhileRevalidate(event, request))
  } else if (request.mode === 'navigate' && url.pathname === '/') {
    event.respondWith(networkFirst(request))
  }
})
