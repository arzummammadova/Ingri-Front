"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "./Logo";

export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  return (
    <footer className="px-4 pb-8 lg:px-8">
      <div className="glass flex flex-col gap-4 rounded-xl px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-muted-foreground">{t("note")}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/podcasts">{nav("podcasts")}</Link>
          <Link href="/grammar">{nav("grammar")}</Link>
          <Link href="/words">{nav("words")}</Link>
          <Link href="/leaderboard">{nav("leaderboard")}</Link>
        </div>
      </div>
    </footer>
  );
}
