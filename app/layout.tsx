import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_KR, Noto_Serif_KR, Playfair_Display } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
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
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
    { media: '(prefers-color-scheme: light)', color: '#fdf7f4' },
  ],
}

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
      <body className="bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
