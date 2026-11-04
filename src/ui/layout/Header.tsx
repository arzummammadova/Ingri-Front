"use client";

import LanguageSwitcher from "@/ui/components/LanguageSwitcher";
import ThemeToggle from "@/ui/components/ThemeToggle";
import Logo from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import LevelSwitcher from "@/ui/components/LevelSwitcher";
import StreakBadge from "@/ui/components/StreakBadge";
import { Settings } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routes } from "@/config/routes";
import { avatarSrc } from "@/lib/utils";

export default function Header({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-header px-3 pt-3 sm:px-4 sm:pt-4 lg:px-8">
      <div className="glass flex min-w-0 items-center gap-2 rounded-xl px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        {!compact && user ? (
          <Link href={routes.profile} aria-label="Profile" className="shrink-0 lg:hidden">
            <img src={avatarSrc(user)} alt="" className="size-10 rounded-full object-cover ring-2 ring-lilac/70" />
          </Link>
        ) : (
          <div className={compact ? "min-w-0" : "min-w-0 lg:hidden"}>
            <Logo size={compact ? "lg" : "md"} hideWordmarkOnTiny={!compact} />
          </div>
        )}
        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
          {user && !compact && <StreakBadge />}
          {!compact && <LevelSwitcher />}
          {/* Language lives in the mobile "more" menu; header shows it from md up. */}
          <div className="hidden md:block"><LanguageSwitcher /></div>
          <ThemeToggle />
          {!compact && user && (
            <Link href={routes.settings} aria-label="Settings" className="grid size-10 place-items-center rounded-full border border-border/60 bg-card/60 transition hover:bg-lilac lg:hidden">
              <Settings className="size-[1.1rem]" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
