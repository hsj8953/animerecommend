'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  LogOut,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import { genres, type Anime, type SituationCategory } from '@/lib/anime-data'

const SITE_GENRES = genres.filter((g) => g !== '전체')

type TmdbResult = {
  tmdbId: number
  type: 'tv' | 'movie'
  title: string
  original: string
  year: number | null
  previewUrl: string | null
}

type TmdbDetail = {
  id: string
  title: string
  original: string
  genre: string[]
  year: number | null
  description: string
  posterPath: string | null
  previewUrl: string | null
}

type Form = {
  id: string
  title: string
  original: string
  genre: string[]
  year: string
  rating: string
  tagline: string
  description: string
  themeIds: string[]
  tmdbPosterPath: string | null
  previewUrl: string | null
}

type Notice = { kind: 'ok' | 'error'; text: string; link?: string } | null

async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? `요청 실패 (${res.status})`)
  return data as T
}

const emptyForm = (): Form => ({
  id: '',
  title: '',
  original: '',
  genre: [],
  year: '',
  rating: '',
  tagline: '',
  description: '',
  themeIds: [],
  tmdbPosterPath: null,
  previewUrl: null,
})

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:opacity-60'

export function AdminApp() {
  const [session, setSession] = useState<{ loggedIn: boolean; configured: boolean } | null>(null)

  const refreshSession = useCallback(() => {
    api<{ loggedIn: boolean; configured: boolean }>('/api/admin/session')
      .then(setSession)
      .catch(() => setSession({ loggedIn: false, configured: true }))
  }, [])

  useEffect(refreshSession, [refreshSession])

  return (
    <main className="min-h-screen bg-background">
      {session === null ? (
        <Centered>
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="불러오는 중" />
        </Centered>
      ) : !session.configured ? (
        <Centered>
          <div className="max-w-sm text-center">
            <p className="font-serif text-2xl text-foreground">설정이 필요해요</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Vercel 환경변수에 ADMIN_PASSWORD, GITHUB_TOKEN, TMDB_API_KEY 를 넣고 다시
              배포해 주세요.
            </p>
          </div>
        </Centered>
      ) : !session.loggedIn ? (
        <Login onDone={refreshSession} />
      ) : (
        <Dashboard onLogout={refreshSession} />
      )}
    </main>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center px-4">{children}</div>
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/api/admin/login', { password })
      onDone()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <Centered>
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <p className="font-serif text-2xl text-foreground">
          Ani<span className="text-primary">Pick</span> 관리자
        </p>
        <label className="mt-6 block text-sm font-medium text-foreground" htmlFor="admin-password">
          비밀번호
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputClass} mt-2`}
          autoFocus
        />
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          로그인
        </button>
      </form>
    </Centered>
  )
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [anime, setAnime] = useState<Anime[] | null>(null)
  const [themes, setThemes] = useState<SituationCategory[]>([])
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState<Anime | 'new' | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [query, setQuery] = useState('')

  const load = useCallback(async () => {
    setLoadError('')
    try {
      const data = await api<{ anime: Anime[]; themes: SituationCategory[] }>('/api/admin/data')
      setAnime(data.anime)
      setThemes(data.themes)
    } catch (err) {
      setLoadError((err as Error).message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const logout = async () => {
    await api('/api/admin/logout', {}).catch(() => {})
    onLogout()
  }

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const items = (anime ?? []).filter(
      (a) =>
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.original.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q),
    )
    return items.reverse() // 최근에 추가한 작품이 위로
  }, [anime, query])

  const finish = (result: Notice) => {
    setNotice(result)
    setEditing(null)
    window.scrollTo({ top: 0 })
    load()
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <p className="font-serif text-xl text-foreground sm:text-2xl">
          Ani<span className="text-primary">Pick</span> 관리자
        </p>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            사이트 <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-3.5" aria-hidden="true" /> 로그아웃
          </button>
        </div>
      </header>

      {notice && (
        <div
          role="status"
          className={`mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm ${
            notice.kind === 'ok'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/40 bg-red-500/10 text-red-300'
          }`}
        >
          <span>{notice.text}</span>
          <span className="flex items-center gap-3">
            {notice.link && (
              <a href={notice.link} target="_blank" rel="noreferrer" className="underline">
                커밋 보기
              </a>
            )}
            <button onClick={() => setNotice(null)} className="text-xs opacity-80 hover:opacity-100">
              닫기
            </button>
          </span>
        </div>
      )}

      {editing ? (
        <Editor
          key={editing === 'new' ? 'new' : editing.id}
          target={editing}
          themes={themes}
          onCancel={() => setEditing(null)}
          onDone={finish}
        />
      ) : loadError ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-300">
          <p>{loadError}</p>
          <button onClick={load} className="mt-3 underline">
            다시 시도
          </button>
        </div>
      ) : anime === null ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="불러오는 중" />
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => {
                setNotice(null)
                setEditing('new')
              }}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="size-4" aria-hidden="true" /> 새 작품 추가
            </button>
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`등록된 ${anime.length}편에서 찾기`}
                aria-label="등록된 작품 검색"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <ul className="grid gap-2 sm:grid-cols-2">
            {list.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => {
                    setNotice(null)
                    setEditing(a)
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-2 text-left transition-colors hover:border-primary"
                >
                  <PosterThumb src={a.poster} className="h-16 w-11" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {a.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {a.genre.join(' · ')} · {a.year}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 pr-2 text-xs font-semibold text-amber-300">
                    <Star className="size-3 fill-amber-300" aria-hidden="true" />
                    {a.rating.toFixed(1)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {list.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">찾는 작품이 없어요.</p>
          )}
        </>
      )}
    </div>
  )
}

// 방금 추가해서 아직 배포 전인 포스터는 사이트에 없으니 빈 칸으로 보여준다
function PosterThumb({ src, className }: { src: string | null; className: string }) {
  const [broken, setBroken] = useState(false)
  return (
    <span className={`relative shrink-0 overflow-hidden rounded-md bg-secondary ${className}`}>
      {src && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={() => setBroken(true)}
          loading="lazy"
        />
      ) : null}
    </span>
  )
}

function Editor({
  target,
  themes,
  onCancel,
  onDone,
}: {
  target: Anime | 'new'
  themes: SituationCategory[]
  onCancel: () => void
  onDone: (notice: Notice) => void
}) {
  const isNew = target === 'new'
  const [form, setForm] = useState<Form>(() =>
    isNew
      ? emptyForm()
      : {
          id: target.id,
          title: target.title,
          original: target.original,
          genre: target.genre,
          year: String(target.year),
          rating: String(target.rating),
          tagline: target.tagline,
          description: target.description,
          themeIds: themes.filter((t) => t.animeIds.includes(target.id)).map((t) => t.id),
          tmdbPosterPath: null,
          previewUrl: null,
        },
  )
  const [showSearch, setShowSearch] = useState(isNew)
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const toggle = (key: 'genre' | 'themeIds', value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }))

  const applyTmdb = (d: TmdbDetail) => {
    setForm((f) =>
      isNew
        ? {
            ...f,
            id: d.id,
            title: d.title,
            original: d.original,
            genre: d.genre,
            year: d.year ? String(d.year) : '',
            description: d.description,
            tmdbPosterPath: d.posterPath,
            previewUrl: d.previewUrl,
          }
        : // 수정할 때는 내가 쓴 내용은 두고 포스터만 바꾼다
          { ...f, tmdbPosterPath: d.posterPath, previewUrl: d.previewUrl },
    )
    setShowSearch(false)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy('save')
    setError('')
    try {
      const result = await api<{ commit: { url: string } }>('/api/admin/save', {
        mode: isNew ? 'create' : 'edit',
        anime: {
          id: form.id,
          title: form.title,
          original: form.original,
          genre: form.genre,
          year: Number(form.year),
          rating: Number(form.rating),
          tagline: form.tagline,
          description: form.description,
        },
        themeIds: form.themeIds,
        tmdbPosterPath: form.tmdbPosterPath,
      })
      onDone({
        kind: 'ok',
        text: `'${form.title}' ${isNew ? '추가' : '수정'}했어요. 1~2분 뒤 사이트에 반영돼요.`,
        link: result.commit.url,
      })
    } catch (err) {
      setError((err as Error).message)
      setBusy(null)
    }
  }

  const remove = async () => {
    if (isNew) return
    setBusy('delete')
    setError('')
    try {
      const result = await api<{ commit: { url: string } }>('/api/admin/delete', { id: target.id })
      onDone({
        kind: 'ok',
        text: `'${target.title}' 삭제했어요. 1~2분 뒤 사이트에서 사라져요.`,
        link: result.commit.url,
      })
    } catch (err) {
      setError((err as Error).message)
      setBusy(null)
      setConfirmDelete(false)
    }
  }

  const posterSrc = form.previewUrl ?? (isNew ? null : target.poster)

  return (
    <div>
      <button
        onClick={onCancel}
        className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> 목록으로
      </button>

      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">
        {isNew ? '새 작품 추가' : `'${target.title}' 수정`}
      </h1>

      {showSearch ? (
        <TmdbSearch
          title={isNew ? '1. TMDB에서 작품 찾기' : '새 포스터 고르기'}
          hint={
            isNew
              ? '고르면 제목·연도·줄거리·포스터가 자동으로 채워져요.'
              : '고른 작품의 포스터로만 바뀌고, 입력한 내용은 그대로예요.'
          }
          initialQuery={isNew ? '' : form.title}
          onPick={applyTmdb}
          onSkip={() => setShowSearch(false)}
          skipLabel={isNew ? '검색 없이 직접 입력' : '취소'}
        />
      ) : null}

      <form onSubmit={save} className="mt-6 grid gap-6 md:grid-cols-[180px_1fr]">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <PosterThumb src={posterSrc} className="aspect-[2/3] w-40 md:w-full" />
          {!showSearch && (
            <button
              type="button"
              onClick={() => setShowSearch(true)}
              className="w-40 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground md:w-full"
            >
              {isNew ? 'TMDB에서 다시 찾기' : '포스터 바꾸기'}
            </button>
          )}
          {form.tmdbPosterPath && (
            <p className="text-xs text-primary">새 포스터로 저장돼요</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {isNew && !showSearch && <p className="text-sm text-muted-foreground">2. 내용 확인하고 저장</p>}

          <Field label="id (주소에 쓰이는 영문 이름)" hint={isNew ? '영어 소문자, 숫자, - 만' : '만든 뒤에는 바꿀 수 없어요'}>
            <input
              value={form.id}
              onChange={(e) => set('id', e.target.value.toLowerCase())}
              disabled={!isNew}
              className={inputClass}
              placeholder="frieren"
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="제목">
              <input value={form.title} onChange={(e) => set('title', e.target.value)} className={inputClass} required />
            </Field>
            <Field label="원제 (영문)">
              <input value={form.original} onChange={(e) => set('original', e.target.value)} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="연도">
              <input
                value={form.year}
                onChange={(e) => set('year', e.target.value)}
                inputMode="numeric"
                className={inputClass}
                placeholder="2023"
                required
              />
            </Field>
            <Field label="내 평점 (0~10)">
              <input
                value={form.rating}
                onChange={(e) => set('rating', e.target.value)}
                inputMode="decimal"
                className={inputClass}
                placeholder="9.3"
                required
              />
            </Field>
          </div>

          <Field label="장르">
            <div className="flex flex-wrap gap-2">
              {SITE_GENRES.map((g) => (
                <Chip key={g} active={form.genre.includes(g)} onClick={() => toggle('genre', g)}>
                  {g}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="한 줄 소개">
            <input
              value={form.tagline}
              onChange={(e) => set('tagline', e.target.value)}
              className={inputClass}
              placeholder="만난 적 없는 너를 찾아서"
              required
            />
          </Field>

          <Field label="줄거리">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={5}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <Field label="테마별 추천에 넣기">
            <div className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <Chip key={t.id} active={form.themeIds.includes(t.id)} onClick={() => toggle('themeIds', t.id)}>
                  {t.emoji} {t.title}
                </Chip>
              ))}
            </div>
          </Field>

          {error && (
            <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={busy !== null}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {busy === 'save' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              저장
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={busy !== null}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50"
            >
              취소
            </button>

            {!isNew && (
              <div className="ml-auto flex items-center gap-2">
                {confirmDelete ? (
                  <>
                    <span className="text-sm text-red-300">정말 삭제할까요?</span>
                    <button
                      type="button"
                      onClick={remove}
                      disabled={busy !== null}
                      className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                    >
                      {busy === 'delete' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                      삭제
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      disabled={busy !== null}
                      className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                      아니요
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    disabled={busy !== null}
                    className="flex items-center gap-1.5 rounded-xl border border-red-500/40 px-4 py-2.5 text-sm font-medium text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="size-4" aria-hidden="true" /> 삭제
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

function TmdbSearch({
  title,
  hint,
  initialQuery,
  onPick,
  onSkip,
  skipLabel,
}: {
  title: string
  hint: string
  initialQuery: string
  onPick: (detail: TmdbDetail) => void
  onSkip: () => void
  skipLabel: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<TmdbResult[] | null>(null)
  const [busy, setBusy] = useState<'search' | number | null>(null)
  const [error, setError] = useState('')

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return
    setBusy('search')
    setError('')
    try {
      const data = await api<{ results: TmdbResult[] }>(
        `/api/admin/tmdb/search?q=${encodeURIComponent(query.trim())}`,
      )
      setResults(data.results)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const pick = async (r: TmdbResult) => {
    setBusy(r.tmdbId)
    setError('')
    try {
      onPick(await api<TmdbDetail>(`/api/admin/tmdb/detail?type=${r.type}&id=${r.tmdbId}`))
    } catch (err) {
      setError((err as Error).message)
      setBusy(null)
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      <form onSubmit={search} className="mt-3 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="예: 장송의 프리렌"
          aria-label="TMDB 검색어"
          className={inputClass}
          autoFocus
        />
        <button
          type="submit"
          disabled={busy !== null || !query.trim()}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {busy === 'search' ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="size-4" aria-hidden="true" />
          )}
          검색
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

      {results && results.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          결과가 없어요. 영어나 일본어 제목으로도 찾아보세요.
        </p>
      )}

      {results && results.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {results.map((r) => (
            <li key={`${r.type}-${r.tmdbId}`}>
              <button
                type="button"
                onClick={() => pick(r)}
                disabled={busy !== null}
                className="group relative block w-full text-left disabled:opacity-60"
              >
                <PosterThumb src={r.previewUrl} className="block aspect-[2/3] w-full" />
                {busy === r.tmdbId && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="size-5 animate-spin text-white" aria-label="불러오는 중" />
                  </span>
                )}
                <span className="mt-1.5 block truncate text-xs font-semibold text-foreground group-hover:text-primary">
                  {r.title}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {r.year ?? '?'} · {r.type === 'movie' ? '극장판' : 'TV'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button type="button" onClick={onSkip} className="mt-4 text-xs text-muted-foreground underline hover:text-foreground">
        {skipLabel}
      </button>
    </section>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}
