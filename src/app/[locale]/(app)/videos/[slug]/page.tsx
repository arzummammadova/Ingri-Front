import { setRequestLocale } from "next-intl/server";
import VideoDetail from "./_components/VideoDetail";
export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <VideoDetail slug={slug} />;
}
