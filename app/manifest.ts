import type { MetadataRoute } from 'next'

// 폰 홈 화면에 설치했을 때의 앱 정보 (PWA)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AniPick — 친구를 위한 애니메이션 명작 추천',
    short_name: 'AniPick',
    description: '직접 보고 엄선한 애니메이션 명작 추천',
    id: '/',
    // 앱으로 열면 첫 화면(히어로)을 건너뛰고 바로 작품 목록으로
    start_url: '/?view=home&source=app',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#12131A',
    theme_color: '#12131A',
    lang: 'ko',
    categories: ['entertainment'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
