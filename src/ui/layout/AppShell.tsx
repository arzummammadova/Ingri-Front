"use client";

import {
  BookMarked,
  BookOpen,
  Clapperboard,
  Headphones,
  Home,
  Languages,
  ListChecks,
  Menu,
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
        <button type="button" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} className="flex flex-col items-center gap-1 py-2 text-[10px] font-semibold">
          <Menu className="size-4" />
          {t("menu")}
        </button>
      </nav>
      {/* Mobile off-canvas drawer */}
      <div
        className={cn("fixed inset-0 z-overlay lg:hidden", menuOpen ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!menuOpen}
      >
        <div
          className={cn("absolute inset-0 bg-ink/40 transition-opacity duration-300", menuOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setMenuOpen(false)}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={t("mainNav")}
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col overflow-y-auto bg-sidebar p-4 text-sidebar-foreground shadow-soft transition-transform duration-300 ease-fluid",
            menuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1"><SidebarBrand /></div>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label={t("close")} className="grid size-10 place-items-center rounded-full hover:bg-paper/10">
              <X className="size-5" />
            </button>
          </div>
          <nav className="mt-6 flex flex-1 flex-col gap-1">
            {mainNav.map((item) => (
              <NavLink key={item.href} href={item.href} label={t(item.key)} active={active(item.href)} icon={item.key} onNavigate={() => setMenuOpen(false)} />
            ))}
            <NavLink href={routes.flashcards} label={t("flashcards")} active={active(routes.flashcards)} icon="words" onNavigate={() => setMenuOpen(false)} />
          </nav>
          {user && (
            <button type="button" onClick={() => logout.mutate()} className="mt-4 flex items-center gap-3 rounded-lg bg-paper/10 p-3 text-sm font-semibold">
              <LogOut className="size-4" />
              {t("logout")}
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
