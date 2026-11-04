import { setRequestLocale } from "next-intl/server";
import VideoList from "./_components/VideoList";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <VideoList />;
}
