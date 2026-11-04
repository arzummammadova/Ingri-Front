"use client";

import { ytListen, ytSrc } from "@/lib/youtube";

export default function YouTubeFrame({ id, title }: { id: string; title: string }) {
  if (!id) return null;
  return (
    <div className="aspect-video overflow-hidden rounded-xl bg-ink">
      <iframe
        className="h-full w-full"
        title={title}
        src={ytSrc(id)}
        loading="lazy"
        onLoad={(e) => ytListen(e.currentTarget, id)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
