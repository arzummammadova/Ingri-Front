import { setRequestLocale } from "next-intl/server";
import PodcastPlayer from "./_components/PodcastPlayer";

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <PodcastPlayer slug={slug} />;
}
