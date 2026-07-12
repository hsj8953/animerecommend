import Image from 'next/image'
import { Star } from 'lucide-react'
import type { Anime } from '@/lib/anime-data'

export function PosterCard({
  anime,
  onSelect,
}: {
  anime: Anime
  onSelect?: (anime: Anime) => void
}) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-border bg-card transition-transform duration-300 ease-out hover:-translate-y-1">
      <button
        onClick={() => onSelect?.(anime)}
        aria-label={`${anime.title} 상세 보기`}
        className="absolute inset-0 z-10"
      />
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={anime.poster || '/placeholder.svg'}
          alt={`${anime.title} 포스터`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Always-on bottom gradient for title legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

         {/* Top bar: genre badges (left) + rating (right) */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap gap-1">
            {anime.genre.slice(0, 2).map((g) => (
              <span
                key={g}
                className="max-w-full truncate rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[11px] font-medium text-foreground/90 backdrop-blur-sm"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Rating badge */}
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-amber-300 backdrop-blur-sm">
            <Star className="size-3 fill-amber-300 text-amber-300" aria-hidden="true" />
            {anime.rating.toFixed(1)}
          </span>
        </div>

        {/* Title block */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="font-serif text-lg leading-tight text-balance text-foreground">
            {anime.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {anime.original} · {anime.year}
          </p>

          {/* Hover reveal description */}
          <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-300 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100">
            <div className="overflow-hidden">
              <p className="mt-2 text-sm font-medium text-foreground">
                {anime.tagline}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {anime.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
