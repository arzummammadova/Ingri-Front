"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Align = "start" | "end";

/**
 * Floating panel rendered in a portal (document.body) with position: fixed,
 * so opening it never changes the layout of the header / toolbar it is anchored to.
 */
export function Popover({
  anchorRef,
  open,
  onClose,
  align = "start",
  minWidth,
  className,
  children,
  role = "dialog",
  label,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  align?: Align;
  minWidth?: number;
  className?: string;
  children: ReactNode;
  role?: string;
  label?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; up: boolean } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.max(minWidth || 0, r.width);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = align === "end" ? r.right - width : r.left;
      left = Math.min(Math.max(8, left), vw - width - 8);
      const panelH = panelRef.current?.offsetHeight || 240;
      const up = r.bottom + panelH + 12 > vh && r.top > panelH + 12;
      setPos({ top: up ? r.top - panelH - 6 : r.bottom + 6, left, width, up });
    };
    place();
    const raf = requestAnimationFrame(place);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, anchorRef, align, minWidth]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        anchorRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div
      ref={panelRef}
      role={role}
      aria-label={label}
      style={{ position: "fixed", top: pos?.top ?? -9999, left: pos?.left ?? -9999, minWidth: pos?.width, visibility: pos ? "visible" : "hidden" }}
      className={cn(
        "z-[90] max-h-[min(22rem,70vh)] overflow-y-auto rounded-xl border border-border bg-card p-1 text-foreground shadow-soft motion-safe:animate-[ingri-pop_0.16s_ease-out]",
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}

/** Hover / focus tooltip rendered in a portal (never clipped by overflow containers). */
export function Tooltip({ content, children, side = "right", disabled }: { content: ReactNode; children: ReactNode; side?: "right" | "bottom"; disabled?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const show = () => !disabled && ref.current && setRect(ref.current.getBoundingClientRect());
  const hide = () => setRect(null);
  useEffect(() => {
    if (disabled) setRect(null);
  }, [disabled]);
  return (
    <span ref={ref} className="contents" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {rect && typeof document !== "undefined" &&
        createPortal(
          <span
            role="tooltip"
            style={
              side === "right"
                ? { position: "fixed", top: rect.top + rect.height / 2, left: rect.right + 10, transform: "translateY(-50%)" }
                : { position: "fixed", top: rect.bottom + 8, left: rect.left + rect.width / 2, transform: "translateX(-50%)" }
            }
            className="pointer-events-none z-[95] whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-semibold text-white shadow-soft dark:bg-white dark:text-ink"
          >
            {content}
          </span>,
          document.body,
        )}
    </span>
  );
}
