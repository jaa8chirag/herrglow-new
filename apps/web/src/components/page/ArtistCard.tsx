import Link from "next/link";
import { Card } from "@herrglow/ui";
import { Photo } from "@/components/Photo";

export interface ArtistCardData {
  slug: string;
  name: string;
  photo: string | null;
  specialization: string | null;
  years: number | null;
  city: string | null;
  linked: boolean;
  kind: string;
}

/** Public artist card: photo (or designed fallback), specialty, experience, city. Never shows contact data. */
export function ArtistCard({ a }: { a: ArtistCardData }) {
  const body = (
    <Card className="group h-full overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/5]">
        <Photo
          src={a.photo}
          alt={`${a.name}, ${a.kind}`}
          kind="artist"
          seedKey={a.slug}
          sizes="(min-width: 1024px) 25vw, 72vw"
        />
      </div>
      <div className="p-5">
        <h3 className="truncate">{a.name}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-ink-soft">{a.specialization ?? a.kind}</p>
        <p className="mt-3 flex items-center justify-between text-xs text-rose-700">
          {a.years ? <span>{a.years}+ yrs experience</span> : <span />}
          {a.city && <span>{a.city}</span>}
        </p>
      </div>
    </Card>
  );
  return a.linked ? (
    <Link href={`/artists/${a.slug}`} className="block h-full">
      {body}
    </Link>
  ) : (
    <div className="h-full">{body}</div>
  );
}
