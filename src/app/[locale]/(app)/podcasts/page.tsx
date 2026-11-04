import { setRequestLocale } from "next-intl/server";
import PodcastList from "./_components/PodcastList";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PodcastList />;
}
