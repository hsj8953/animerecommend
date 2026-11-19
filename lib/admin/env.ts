import 'server-only'

// 관리자 기능에 필요한 환경변수. Vercel → Settings → Environment Variables 에 넣는다.
//   ADMIN_PASSWORD  관리자 페이지 비밀번호 (직접 정함)
//   GITHUB_TOKEN    이 레포에 Contents 읽기/쓰기 권한이 있는 GitHub 토큰
//   TMDB_API_KEY    TMDB v3 API 키 또는 v4 읽기 토큰
//   GITHUB_REPO     (선택) 기본값 hsj8953/animerecommend
//   GITHUB_BRANCH   (선택) 기본값 main

export class AdminError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

export function requireEnv(name: 'ADMIN_PASSWORD' | 'GITHUB_TOKEN' | 'TMDB_API_KEY'): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new AdminError(
      `Vercel 환경변수 ${name} 이(가) 없어요. 넣은 뒤 다시 배포(Redeploy)해 주세요.`,
      500,
    )
  }
  return value
}

export const githubRepo = () => process.env.GITHUB_REPO?.trim() || 'hsj8953/animerecommend'
export const githubBranch = () => process.env.GITHUB_BRANCH?.trim() || 'main'
// 테스트용으로 바꿀 수 있게 열어 둔 주소 (평소엔 건드릴 필요 없음)
export const githubApiUrl = () => process.env.GITHUB_API_URL?.trim() || 'https://api.github.com'
export const tmdbApiUrl = () => process.env.TMDB_API_URL?.trim() || 'https://api.themoviedb.org/3'
export const tmdbImageUrl = () =>
  process.env.TMDB_IMAGE_URL?.trim() || 'https://image.tmdb.org/t/p'
