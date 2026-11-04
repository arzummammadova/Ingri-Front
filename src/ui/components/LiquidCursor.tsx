"use client";

import { useEffect, useRef } from "react";

export default function LiquidCursor() {
  const cursor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = cursor.current;
    if (!element) return;
    const media = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let visible = false;
    const animate = () => {
      const dx = targetX - x;
      const dy = targetY - y;
      x += dx * 0.22;
      y += dy * 0.22;
      const stretch = Math.min(Math.hypot(dx, dy) / 180, 0.35);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale(${1 + stretch}, ${1 - stretch * 0.5})`;
      frame = Math.abs(dx) + Math.abs(dy) > 0.1 ? requestAnimationFrame(animate) : 0;
    };
    const hide = () => {
      visible = false;
      element.dataset.visible = "false";
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const move = (event: PointerEvent) => {
      if (!media.matches || event.pointerType !== "mouse") return hide();
      targetX = event.clientX;
      targetY = event.clientY;
      if (!visible) {
        x = targetX;
        y = targetY;
      }
      visible = true;
      element.dataset.visible = "true";
      const target = event.target instanceof Element ? event.target : null;
      element.dataset.interactive = String(!!target?.closest("a,button,input,textarea,select"));
      if (!frame) frame = requestAnimationFrame(animate);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", () => {
      element.dataset.pressed = "true";
    });
    window.addEventListener("pointerup", () => {
      element.dataset.pressed = "false";
    });
    window.addEventListener("blur", hide);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", hide);
    };
  }, []);

  return (
    <div ref={cursor} className="liquid-cursor" aria-hidden="true">
      <span />
    </div>
  );
}
