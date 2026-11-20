"use client";

import { Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge, Card, cn } from "@herrglow/ui";
import { Photo } from "@/components/Photo";

export interface BlogItem { slug: string; title: string; excerpt: string | null; image: string | null; date: string; topic: string; minutes: number }

/** Featured post + topic chips + image grid. All cards are server-rendered; chips only hide cards. */
export function BlogExplorer({ posts }: { posts: BlogItem[] }) {
  const [topic, setTopic] = useState("All");
  const topics = ["All", ...new Set(posts.map((p) => p.topic))];
  const [featured, ...rest] = posts;
  return (
    <div>
      {featured && (
        <Link href={`/blog/${featured.slug}`} className="group mb-12 grid overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-soft transition-shadow hover:shadow-lift md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[20rem]"><Photo src={featured.image} alt={featured.title} kind="blog" seedKey={featured.slug} priority sizes="(min-width: 768px) 50vw, 100vw" /></div>
          <div className="flex flex-col justify-center p-7 sm:p-10">
            <Badge tone="gold" className="self-start">Featured</Badge>
            <h2 className="mt-4 !text-3xl group-hover:text-rose-700 sm:!text-4xl">{featured.title}</h2>
            {featured.excerpt && <p className="mt-3 line-clamp-3 text-ink-soft">{featured.excerpt}</p>}
            <p className="mt-5 flex items-center gap-3 text-sm text-ink-soft">{featured.date}<span className="flex items-center gap-1"><Clock className="size-3.5" />{featured.minutes} min read</span></p>
          </div>
        </Link>
      )}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="tablist" aria-label="Filter articles">
        {topics.map((t) => <button key={t} type="button" role="tab" aria-selected={topic === t} onClick={() => setTopic(t)} className={cn("min-h-10 shrink-0 rounded-full border px-4 text-sm transition", topic === t ? "border-plum-700 bg-plum-700 text-ivory" : "border-line bg-white text-plum-800 hover:bg-blush-100")}>{t}</button>)}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((b) => (
          <Link key={b.slug} href={`/blog/${b.slug}`} className={cn("group block", topic !== "All" && b.topic !== topic && "hidden")}>
            <Card className="h-full overflow-hidden transition-transform duration-300 group-hover:-translate-y-1">
              <div className="relative aspect-[16/10]"><Photo src={b.image} alt={b.title} kind="blog" seedKey={b.slug} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" /></div>
              <div className="p-6">
                <p className="flex items-center gap-3 text-xs text-rose-700"><span>{b.topic}</span><span aria-hidden>·</span><span>{b.date}</span></p>
                <h2 className="mt-2 line-clamp-2 !text-xl group-hover:text-rose-700">{b.title}</h2>
                {b.excerpt && <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{b.excerpt}</p>}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
