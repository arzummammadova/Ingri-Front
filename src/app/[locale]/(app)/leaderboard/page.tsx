import { setRequestLocale } from "next-intl/server";
import LeaderboardView from "./_components/LeaderboardView";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LeaderboardView />;
}
