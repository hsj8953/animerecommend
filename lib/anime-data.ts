import animeData from '@/data/anime.json'

export type Anime = {
  id: string
  title: string
  original: string
  genre: string[]
  year: number
  rating: number
  tagline: string
  description: string
  poster: string
}

export const genres = [
  '전체',
  '액션', 
  '어드벤처',
  '판타지',
  '스릴러',
  '심리',
  'SF',
  '미스터리',
  '로맨스',
  '드라마',
  '코미디',
  '극장판',
] as const

export type SituationCategory = {
  id: string
  emoji: string
  title: string
  description: string
  animeIds: string[]
}

export const situationCategories: SituationCategory[] = [
  {
    id: 'before-sleep',
    emoji: '🌙',
    title: '자기 전에 보기 좋은 애니',
    description: '잔잔하게 하루를 마무리하기 좋은 작품들',
    animeIds: ['frieren', 'eternity', 'yourapril', 'plasticmemories', 'silentwitch'],
  },
  {
    id: 'tearjerker',
    emoji: '😭',
    title: '눈물 보장 애니',
    description: '휴지를 준비해야 하는 감동의 명작',
    animeIds: ['clannad', 'yourname', 'throughtime', 'clannadafter', 'angelbeat', 'anohana', 'yourapril', 'assassinationclassroom', 'plasticmemories', 'cyberpunk',
      'sayonaranoasa', 'violetevergarden'
    ],
  },
  {
    id: 'plot-master',
    emoji: '🧠',
    title: '떡밥 회수 GOAT',
    description: '뿌린 복선을 완벽하게 거둬들이는 서사',
    animeIds: ['steinsgate', 'attackontitan', 'deathnote', 'erased', 'neverland', 'zzang', 'summertime', 'generic'],
  },
  {
    id: 'action-king',
    emoji: '⚔️',
    title: '액션 끝판왕',
    description: '숨 막히는 작화와 압도적인 배틀',
    animeIds: ['attackontitan', 'onepunchman', 'demonslayer', 'jujutsukaisen', 'sololeveling', 'prison', 'sakamotodays'],
  },
  {
    id: 'romance-intro',
    emoji: '💖',
    title: '연애 입문작',
    description: '설레는 첫 로맨스로 딱 좋은 작품',
    animeIds: ['plasticmemories', 'yourapril', 'yamadakun', 'toreachyou', 'kisekoi', 'horimiya', 'affection', 'generic', 'aoharuride', 'nozakikun'],
  },
  {
    id: 'life-changing',
    emoji: '✨',
    title: '인생작 추천',
    description: '한 번은 꼭 봐야 할 부동의 명작',
    animeIds: ['swordartonline', 'plasticmemories', 'nogamenolife', 'overlord', 'eightysix', 'sololeveling'],
  },
  {
    id: 'philosophical',
    emoji: '🎓',
    title: '철학적인 작품',
    description: '보고 나면 오래도록 곱씹게 되는 이야기',
    animeIds: ['deathnote', 'earth'],
  },
  // {
  //   id: 'ost',  
  //   emoji: '🎼',
  //   title: 'OST가 미친 작품',
  //   description: '음악만으로도 소름이 돋는 명작',
  //   animeIds: ['your-name', 'violet-evergarden', 'weathering-with-you', 'attack-on-titan'],
  // },
  // {
  //   id: 'worldbuilding',
  //   emoji: '🏰',
  //   title: '세계관이 뛰어난 작품',
  //   description: '몰입하게 만드는 깊고 방대한 세계',
  //   animeIds: ['made-in-abyss', 'fullmetal-alchemist', 'frieren', 'attack-on-titan'],
  // },
  {
    id: 'hidden-gem',
    emoji: '👑',
    title: '숨은 명작',
    description: '덜 알려졌지만 놓치면 아까운 작품',
    animeIds: ['zzang', 'osamarank', 'uncle'],
  },
  // {
  //   id: 'one-day-binge',
  //   emoji: '📺',
  //   title: '하루만에 정주행 가능',
  //   description: '짧고 굵게 몰아보기 좋은 작품',
  //   animeIds: ['your-name', 'a-silent-voice', 'weathering-with-you', 'girl-who-leapt', 'summer-wars'],
  // },
  {
    id: 'movies',
    emoji: '🎥',
    title: '극장판 추천',
    description: '스크린을 가득 채우는 영상미의 향연',
    animeIds: ['yourname', 'weathering', 'suzume', 'reze', 'mugencastle'],
  },
]

export const animeList: Anime[] = animeData

const animeById = new Map(animeList.map((a) => [a.id, a]))

export function getAnimeByIds(ids: string[]): Anime[] {
  return ids
    .map((id) => animeById.get(id))
    .filter((a): a is Anime => Boolean(a))
}
