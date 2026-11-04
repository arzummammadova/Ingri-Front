import { setRequestLocale } from "next-intl/server";
import SpeakingList from "./_components/SpeakingList";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SpeakingList />;
}
