"use client";

import {
  BookMarked,
  BookOpen,
  Clapperboard,
  Headphones,
  Home,
  Languages,
  ListChecks,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  LogOut,
  Mic,
  NotebookPen,
  Settings,
  Trophy,
  Tv,
  UserRound,
  Waves,
} from "lucide-react";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { bottomNav, mainNav, routes } from "@/config/routes";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "@/hooks/useAuth";
import { avatarSrc } from "@/lib/utils";
import { IngriMark, Wordmark } from "./Logo";
import { Tooltip } from "@/ui/components/Popover";
import { useSidebar } from "@/hooks/useSidebar";
import PreferencesSync from "@/ui/components/PreferencesSync";
import SoundBridge from "@/ui/components/SoundBridge";
import LanguageSwitcher from "@/ui/components/LanguageSwitcher";
import ThemeToggle from "@/ui/components/ThemeToggle";
import { ExitGuardHost } from "@/ui/components/ExitGuard";

const icons = {
  overview: Home,
  podcasts: Headphones,
  grammar: BookOpen,
  listening: Waves,
  speaking: Mic,
  words: Languages,
  videos: Tv,
  movies: Clapperboard,
  books: BookMarked,
  notes: NotebookPen,
  leaderboard: Trophy,
  plan: ListChecks,
  settings: Settings,
  profile: UserRound,
};

function NavLink({
  href,
  label,
  active,
  icon,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: keyof typeof icons;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = icons[icon];
  return (
    <Tooltip content={label} disabled={!collapsed}>
      <Link
        href={href}
        onClick={onNavigate}
        aria-label={collapsed ? label : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
          active ? "bg-lilac text-ink" : "text-sidebar-foreground/80 hover:bg-paper/10",
        )}
      >
        <Icon className="size-[1.15rem] shrink-0" />
        <span className="sidebar-label truncate">{label}</span>
      </Link>
    </Tooltip>
  );
}

function SidebarBrand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/" aria-label="Ingri" className="flex items-center justify-center gap-2.5 self-stretch py-1">
      <IngriMark className="size-12" />
      <Wordmark className={cn("sidebar-label text-[2rem] text-[#f5f6fb]", collapsed && "hidden")} />
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const menuOpen = useUiStore((state) => state.menuOpen);
  const setMenuOpen = useUiStore((state) => state.setMenuOpen);
  const { user, logout } = useAuth();
  const router = useRouter();
  const { collapsed, toggle } = useSidebar();
  useEffect(() => {
    if (user && user.placementCompleted === false && pathname !== routes.onboarding) {
      router.replace(routes.onboarding);
    }
  }, [user, pathname, router]);
  useEffect(() => setMenuOpen(false), [pathname, setMenuOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, setMenuOpen]);
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const toggleLabel = collapsed ? t("expandSidebar") : t("collapseSidebar");

  return (
    <div className="min-h-screen">
      <PreferencesSync />
      <SoundBridge />
      <ExitGuardHost />
      <aside
        data-collapsed={collapsed || undefined}
        className="ingri-sidebar fixed inset-y-4 left-4 z-header hidden flex-col overflow-y-auto overflow-x-hidden rounded-xl bg-sidebar p-3 text-sidebar-foreground shadow-soft lg:flex"
      >
        <SidebarBrand collapsed={collapsed} />
        <div className="mt-3 flex justify-center">
          <Tooltip content={toggleLabel}>
            <button
              type="button"
              onClick={toggle}
              aria-label={toggleLabel}
              aria-expanded={!collapsed}
              className="sidebar-toggle flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold text-sidebar-foreground/70 transition hover:bg-paper/10 hover:text-sidebar-foreground"
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              <span className="sidebar-label">{toggleLabel}</span>
            </button>
          </Tooltip>
        </div>
        <nav aria-label={t("mainNav")} className="mt-4 flex flex-1 flex-col gap-1">
          {mainNav.map((item) => (
            <NavLink key={item.href} href={item.href} label={t(item.key)} active={active(item.href)} icon={item.key} collapsed={collapsed} />
          ))}
        </nav>
        {user && (
          <div className="sidebar-user mt-4 flex items-center gap-3 rounded-lg bg-paper/10 p-2.5">
            <img src={avatarSrc(user)} alt="" className="size-10 shrink-0 rounded-full object-cover" />
            <div className="sidebar-label min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <button type="button" onClick={() => logout.mutate()} className="min-w-fit text-xs text-sidebar-foreground/70">
                {t("logout")}
              </button>
            </div>
          </div>
        )}
      </aside>
      <div className="ingri-main">
        <Header />
        <main className="px-4 pb-28 pt-6 lg:px-8 lg:pb-10">{children}</main>
        <Footer />
      </div>
      <nav className="fixed inset-x-3 bottom-3 z-nav grid grid-cols-5 gap-1 rounded-xl bg-sidebar p-2 text-sidebar-foreground shadow-soft lg:hidden">
        {bottomNav.map((item) => {
          const Icon = icons[item.key as keyof typeof icons];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-semibold",
                active(item.href) && "bg-lilac text-ink",
              )}
            >
              <Icon className="size-4" />
              {t(item.key)}
            </Link>
          );
        })}
        <button type="button" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-label={t("more")} className={cn("flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-semibold", menuOpen && "bg-lilac text-ink")}>
          <MoreHorizontal className="size-5" />
          {t("more")}
        </button>
      </nav>
      {/* Mobile full-screen "more" menu (items in the bottom nav are not repeated) */}
      {menuOpen && (
        <div role="dialog" aria-modal="true" aria-label={t("mainNav")} className="fixed inset-0 z-overlay flex flex-col overflow-y-auto bg-background/95 backdrop-blur-xl lg:hidden menu-item-in" style={{ paddingTop: "env(safe-area-inset-top)" }}>
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-3">
              {user && <img src={avatarSrc(user)} alt="" className="size-11 rounded-full object-cover ring-2 ring-lilac" />}
              <div className="min-w-0">
                <p className="truncate font-semibold">{user?.name || "Ingri"}</p>
                {user && <p className="text-xs text-muted-foreground">{user.level}</p>}
              </div>
            </div>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label={t("close")} className="grid size-11 place-items-center rounded-full bg-muted transition hover:bg-lilac">
              <X className="size-5" />
            </button>
          </div>
          <nav className="grid grid-cols-3 gap-3 px-5 pt-6">
            {[...mainNav.filter((item) => !bottomNav.some((b) => b.href === item.href)), { key: "flashcards", href: routes.flashcards }].map((item, i) => {
              const Icon = icons[(item.key in icons ? item.key : "words") as keyof typeof icons];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{ animationDelay: `${40 + i * 25}ms` }}
                  className={cn(
                    "menu-item-in flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card p-2 text-center text-xs font-semibold shadow-sm transition active:scale-95",
                    active(item.href) && "border-transparent bg-lilac text-ink",
                  )}
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-muted/70"><Icon className="size-5" /></span>
                  <span className="line-clamp-2">{t(item.key as "overview")}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mx-5 mt-6 grid gap-2 rounded-2xl border border-border/60 bg-card p-3">
            <div className="flex items-center justify-between gap-3 px-1"><span className="text-sm font-semibold">{t("language")}</span><LanguageSwitcher /></div>
            <div className="flex items-center justify-between gap-3 px-1"><span className="text-sm font-semibold">{t("theme")}</span><ThemeToggle /></div>
          </div>
          {user && (
            <button type="button" onClick={() => { setMenuOpen(false); logout.mutate(); }} className="mx-5 mb-28 mt-4 flex items-center justify-center gap-2 rounded-2xl bg-muted p-3 text-sm font-semibold text-danger">
              <LogOut className="size-4" />
              {t("logout")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
