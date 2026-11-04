import { setRequestLocale } from "next-intl/server";
import SpeakingPractice from "./_components/SpeakingPractice";
export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <SpeakingPractice slug={slug} />;
}
