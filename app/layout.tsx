import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_KR, Noto_Serif_KR, Playfair_Display } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { PwaStart } from '@/components/pwa-start'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

// 한글 글꼴: 영문은 Inter/Playfair, 한글은 Noto로 표시
const notoSansKr = Noto_Sans_KR({
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
  preload: false,
})

const notoSerifKr = Noto_Serif_KR({
  weight: ['400', '600'],
  variable: '--font-noto-serif-kr',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: 'AniPick — 친구를 위한 애니메이션 명작 추천',
  description:
    '직접 보고 엄선한 애니메이션 명작들을 장르별 포스터로 소개하고 추천하는 큐레이션 페이지',
  generator: 'v0.app',
  // 아이폰에서 홈 화면에 추가했을 때 앱처럼 열리게
  appleWebApp: { capable: true, title: 'AniPick', statusBarStyle: 'black' },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
    { media: '(prefers-color-scheme: light)', color: '#fdf7f4' },
  ],
}

// 주소에 ?view= 나 ?anime= 가 있으면(앱으로 열기, 공유 링크) 첫 화면(히어로)을 건너뛴다.
// 서버는 주소의 ? 뒷부분을 모른 채 첫 화면을 그려 보내기 때문에, 그대로 두면 잠깐 첫 화면이
// 보이고 그 뒤 배경 포스터 30장(약 2MB)까지 받게 된다. 화면을 그리기 전에 표시만 해 두고
// CSS 로 첫 화면을 숨긴다 (숨긴 이미지는 내려받지 않음). 표시는 site-experience 가 지운다.
const DEEP_LINK_SCRIPT = `if(/[?&](view|anime)=/.test(location.search))document.documentElement.classList.add('deep-link')`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${playfair.variable} ${notoSansKr.variable} ${notoSerifKr.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: DEEP_LINK_SCRIPT }} />
      </head>
      <body className="bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <PwaStart />
        </ThemeProvider>
      </body>
    </html>
  )
}
