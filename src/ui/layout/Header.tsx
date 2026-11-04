"use client";

import LanguageSwitcher from "@/ui/components/LanguageSwitcher";
import ThemeToggle from "@/ui/components/ThemeToggle";
import Logo from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import LevelSwitcher from "@/ui/components/LevelSwitcher";
import StreakBadge from "@/ui/components/StreakBadge";

export default function Header({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-header px-3 pt-3 sm:px-4 sm:pt-4 lg:px-8">
      <div className="glass flex min-w-0 items-center gap-2 rounded-xl px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        <div className={compact ? "min-w-0" : "min-w-0 lg:hidden"}>
          <Logo size={compact ? "lg" : "md"} hideWordmarkOnTiny={!compact} />
        </div>
        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
          {user && !compact && <StreakBadge />}
          {!compact && <LevelSwitcher />}
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
