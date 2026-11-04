export function BookScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" className={className} aria-hidden="true">
      <ellipse cx="120" cy="158" rx="70" ry="10" className="fill-ink/10" />
      <path d="M48 40c28 8 44 8 72 0v96c-28 8-44 8-72 0Z" className="fill-lilac" />
      <path d="M120 40c28 8 44 8 72 0v96c-28 8-44 8-72 0Z" className="fill-lilac-deep" />
      <path d="M114 36h12v104h-12Z" className="fill-peach" />
      <path d="M64 62h40M64 78h32M136 62h40M136 78h28" className="stroke-ink/30" strokeWidth="4" strokeLinecap="round" />
      <circle cx="176" cy="48" r="16" className="fill-mint" />
    </svg>
  );
}

export function HeadphonesScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" className={className} aria-hidden="true">
      <ellipse cx="120" cy="160" rx="64" ry="10" className="fill-ink/10" />
      <path d="M58 96c0-40 28-68 62-68s62 28 62 68" fill="none" className="stroke-ink" strokeWidth="12" strokeLinecap="round" />
      <rect x="40" y="88" width="34" height="48" rx="16" className="fill-mint" />
      <rect x="166" y="88" width="34" height="48" rx="16" className="fill-peach" />
      <circle cx="168" cy="46" r="14" className="fill-lilac" />
    </svg>
  );
}

export function ChatScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" className={className} aria-hidden="true">
      <ellipse cx="120" cy="160" rx="60" ry="10" className="fill-ink/10" />
      <rect x="46" y="36" width="148" height="96" rx="28" className="fill-aqua" />
      <path d="M78 132l-8 22 32-22Z" className="fill-aqua" />
      <circle cx="92" cy="84" r="8" className="fill-lilac-deep" />
      <circle cx="120" cy="84" r="8" className="fill-mint-deep" />
      <circle cx="148" cy="84" r="8" className="fill-peach" />
    </svg>
  );
}

export function OrbitDecor() {
  return (
    <>
      <span className="orbit left-8 top-8 size-40 opacity-70" />
      <span className="orbit right-10 top-16 size-24" />
      <span className="blob -left-8 top-24 size-40 bg-lilac/70" />
      <span className="blob right-0 bottom-0 size-48 bg-mint/70" />
    </>
  );
}
