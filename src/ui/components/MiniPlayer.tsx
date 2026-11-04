"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ytListen, ytSrc } from "@/lib/youtube";

type MiniVideo = { youtubeId: string; title: string; href: string };
type Ctx = {
  play: (v: MiniVideo) => void;
  setSlot: (el: HTMLElement | null) => void;
  fullscreen: () => void;
};

const MiniPlayerContext = createContext<Ctx | null>(null);

export function useMiniPlayer() {
  const ctx = useContext(MiniPlayerContext);
  if (!ctx) throw new Error("useMiniPlayer must be used inside MiniPlayerProvider");
  return ctx;
}

export default function MiniPlayerProvider({ children }: { children: React.ReactNode }) {
  const az = useLocale() === "az";
  const [video, setVideo] = useState<MiniVideo | null>(null);
  const [slot, setSlotState] = useState<HTMLElement | null>(null);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const play = useCallback((v: MiniVideo) => {
    setVideo((cur) => (cur && cur.youtubeId === v.youtubeId ? cur : v));
  }, []);
  const setSlot = useCallback((el: HTMLElement | null) => setSlotState(el), []);
  const fullscreen = useCallback(() => {
    const el = boxRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }, []);

  useEffect(() => {
    if (!slot) { setRect(null); return; }
    let raf = 0;
    const tick = () => {
      const r = slot.getBoundingClientRect();
      setRect((p) => (p && p.top === r.top && p.left === r.left && p.width === r.width && p.height === r.height ? p : { top: r.top, left: r.left, width: r.width, height: r.height }));
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [slot]);

  const docked = !!slot && !!rect;
  const style: React.CSSProperties = docked
    ? { position: "fixed", top: rect!.top, left: rect!.left, width: rect!.width, height: rect!.height, zIndex: 30 }
    : { position: "fixed", right: 16, bottom: 16, width: "min(340px, calc(100vw - 32px))", zIndex: 60 };

  return (
    <MiniPlayerContext.Provider value={{ play, setSlot, fullscreen }}>
      {children}
      {video && (
        <div style={style} className={docked ? "" : "overflow-hidden rounded-2xl border bg-card shadow-2xl"}>
          {!docked && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs">
              <span className="line-clamp-1 flex-1 font-semibold">{video.title}</span>
              <Link href={video.href} className="rounded px-1.5 py-0.5 hover:bg-muted" aria-label={az ? "Aç" : "Open"}>⤢</Link>
              <button type="button" onClick={() => setVideo(null)} className="rounded px-1.5 py-0.5 hover:bg-muted" aria-label={az ? "Bağla" : "Close"}>✕</button>
            </div>
          )}
          <div ref={boxRef} className={docked ? "h-full w-full overflow-hidden rounded-xl bg-ink" : "aspect-video bg-ink"}>
            <iframe
              className="h-full w-full"
              title={video.title}
              src={ytSrc(video.youtubeId)}
              onLoad={(e) => ytListen(e.currentTarget, video.youtubeId)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </MiniPlayerContext.Provider>
  );
}