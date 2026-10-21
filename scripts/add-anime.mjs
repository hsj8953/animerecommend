// 사용법: npm run add-anime -- "장송의 프리렌"
// TMDB에서 포스터·연도·줄거리를 가져오고, 평점과 한 줄 소개는 직접 입력해서 data/anime.json에 추가한다.
// 필요: .env.local 에 TMDB_API_KEY=... (v3 API 키 또는 v4 읽기 토큰)

import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_FILE = path.join(ROOT, 'data', 'anime.json')
const POSTER_DIR = path.join(ROOT, 'public', 'posters')

// lib/anime-data.ts 의 genres 와 맞춰야 한다
const SITE_GENRES = ['액션', '어드벤처', '판타지', '스릴러', '심리', 'SF', '미스터리', '로맨스', '드라마', '코미디', '극장판']

// TMDB 장르 ID → 사이트 장르 (추천값일 뿐, 입력 단계에서 고칠 수 있다)
const GENRE_MAP = {
  10759: ['액션', '어드벤처'], // TV: Action & Adventure
  10765: ['판타지'], // TV: Sci-Fi & Fantasy
  28: ['액션'],
  12: ['어드벤처'],
  14: ['판타지'],
  878: ['SF'],
  53: ['스릴러'],
  27: ['스릴러'],
  80: ['스릴러'],
  9648: ['미스터리'],
  10749: ['로맨스'],
  18: ['드라마'],
  35: ['코미디'],
}

function loadApiKey() {
  if (process.env.TMDB_API_KEY) return process.env.TMDB_API_KEY
  const envFile = path.join(ROOT, '.env.local')
  if (fs.existsSync(envFile)) {
    const match = fs.readFileSync(envFile, 'utf8').match(/^TMDB_API_KEY\s*=\s*"?([^"\r\n]+)"?/m)
    if (match) return match[1].trim()
  }
  console.error('TMDB_API_KEY 가 없습니다. .env.local 에 TMDB_API_KEY=... 를 추가하세요.')
  process.exit(1)
}

const API_KEY = loadApiKey()
// v4 읽기 토큰(eyJ...)은 헤더로, v3 키는 쿼리로 보낸다
const useBearer = API_KEY.startsWith('eyJ')

async function tmdb(endpoint, params = {}) {
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  if (!useBearer) url.searchParams.set('api_key', API_KEY)
  const res = await fetch(url, { headers: useBearer ? { Authorization: `Bearer ${API_KEY}` } : {} })
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${await res.text()}`)
  return res.json()
}

// "1,3" / "판타지 드라마" / "판타지，드라마" / "sf" 모두 받는다. 모르는 값은 그대로 돌려줘서 다시 묻게 한다
function parseGenres(input) {
  return input
    .normalize('NFC')
    .replace(/[​-‍﻿]/g, '')
    .split(/[\s,，、/]+/)
    .filter(Boolean)
    .map((token) => {
      if (/^\d+$/.test(token)) return SITE_GENRES[Number(token) - 1] ?? token
      return SITE_GENRES.find((g) => g.toLowerCase() === token.toLowerCase()) ?? token
    })
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 30)
}

async function main() {
  const query = process.argv.slice(2).join(' ').trim()
  if (!query) {
    console.error('사용법: npm run add-anime -- "작품 제목"')
    process.exit(1)
  }

  const list = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  const rl = readline.createInterface({ input: stdin, output: stdout })
  // 질문 전에 들어온 줄도 버리지 않도록 줄 단위로 버퍼링해서 읽는다
  const lines = rl[Symbol.asyncIterator]()
  const ask = async (q, def = '') => {
    stdout.write(def ? `${q} [${def}]: ` : `${q}: `)
    const { value, done } = await lines.next()
    if (done) throw new Error('\n입력이 끝나 중단했습니다.')
    return value.trim() || def
  }

  try {
    const search = await tmdb('/search/multi', { query, language: 'ko-KR', include_adult: 'false' })
    const results = search.results.filter((r) => r.media_type === 'tv' || r.media_type === 'movie').slice(0, 10)
    if (results.length === 0) {
      console.log('검색 결과가 없습니다. 다른 제목(영어/일본어)으로 시도해 보세요.')
      return
    }

    results.forEach((r, i) => {
      const title = r.name ?? r.title
      const date = r.first_air_date ?? r.release_date ?? ''
      const kind = r.media_type === 'movie' ? '극장판' : 'TV'
      console.log(`${i + 1}) ${title} (${date.slice(0, 4) || '?'}, ${kind}) — ${r.original_name ?? r.original_title}`)
    })
    const pick = Number(await ask('번호 선택', '1'))
    const hit = results[pick - 1]
    if (!hit) throw new Error('잘못된 번호입니다.')

    const isMovie = hit.media_type === 'movie'
    const endpoint = `/${hit.media_type}/${hit.id}`
    const [ko, en] = await Promise.all([tmdb(endpoint, { language: 'ko-KR' }), tmdb(endpoint, { language: 'en-US' })])

    const koTitle = ko.name ?? ko.title
    const enTitle = en.name ?? en.title
    const year = Number((ko.first_air_date ?? ko.release_date ?? '').slice(0, 4)) || undefined

    const suggestedGenres = [...new Set(ko.genres.flatMap((g) => GENRE_MAP[g.id] ?? []))]
    if (isMovie) suggestedGenres.push('극장판')

    console.log('\n— 가져온 정보를 확인하세요 (엔터 = 그대로 사용) —')
    console.log(`장르 선택지 (번호나 이름으로 입력): ${SITE_GENRES.map((g, i) => `${i + 1}.${g}`).join('  ')}`)

    let id = await ask('id (영문 소문자)', slugify(enTitle) || slugify(ko.original_name ?? ''))
    while (!/^[a-z0-9-]+$/.test(id) || list.some((a) => a.id === id)) {
      id = await ask(list.some((a) => a.id === id) ? `"${id}" 는 이미 있습니다. 다른 id` : 'id 는 영문 소문자/숫자/- 만 가능')
    }

    const title = await ask('제목', koTitle)
    const original = await ask('원제(영문)', enTitle)

    let genre
    for (;;) {
      genre = [...new Set(parseGenres(await ask('장르 (예: 3,9)', suggestedGenres.join(','))))]
      const unknown = genre.filter((g) => !SITE_GENRES.includes(g))
      if (genre.length > 0 && unknown.length === 0) break
      console.log(`알 수 없는 장르: ${unknown.join(', ') || '(비어 있음)'} — 번호(1~${SITE_GENRES.length})로 입력해 보세요.`)
    }

    let yearInput
    for (;;) {
      yearInput = Number(await ask('연도', year ? String(year) : ''))
      if (Number.isInteger(yearInput) && yearInput >= 1950 && yearInput <= 2100) break
      console.log('4자리 연도를 입력하세요.')
    }

    let rating
    for (;;) {
      rating = Number(await ask('내 평점 (0~10)'))
      if (!Number.isNaN(rating) && rating >= 0 && rating <= 10) break
      console.log('0~10 사이 숫자를 입력하세요.')
    }

    let tagline = ''
    while (!tagline) tagline = await ask('한 줄 소개')

    const overview = ko.overview || en.overview || ''
    console.log(`\n줄거리 (TMDB):\n${overview || '(없음)'}\n`)
    let description = await ask('줄거리 — 엔터=위 내용 사용, 직접 쓰려면 입력')
    if (!description) description = overview

    const anime = {
      id,
      title,
      original,
      genre,
      year: yearInput,
      rating: Math.round(rating * 10) / 10,
      tagline,
      description,
      poster: ko.poster_path ? `/posters/${id}.jpg` : '/placeholder.svg',
    }

    console.log('\n' + JSON.stringify(anime, null, 2))
    if ((await ask('이대로 추가할까요? (y/n)', 'y')).toLowerCase() !== 'y') {
      console.log('취소했습니다.')
      return
    }

    if (ko.poster_path) {
      const res = await fetch(`https://image.tmdb.org/t/p/w780${ko.poster_path}`)
      if (!res.ok) throw new Error(`포스터 다운로드 실패: ${res.status}`)
      fs.writeFileSync(path.join(POSTER_DIR, `${id}.jpg`), Buffer.from(await res.arrayBuffer()))
      console.log(`✔ 포스터 저장: public/posters/${id}.jpg`)
    } else {
      console.log('! TMDB에 포스터가 없어 placeholder 를 사용합니다. 직접 넣고 poster 경로를 고치세요.')
    }

    list.push(anime)
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2) + '\n')
    console.log(`✔ data/anime.json 에 추가했습니다 (총 ${list.length}편)`)
    console.log(`  상황별 테마에 넣으려면 lib/anime-data.ts 의 animeIds 에 '${id}' 를 추가하세요.`)
  } finally {
    rl.close()
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
