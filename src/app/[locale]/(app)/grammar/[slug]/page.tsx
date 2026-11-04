import { setRequestLocale } from "next-intl/server";
import GrammarLesson from "./_components/GrammarLesson";

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <GrammarLesson slug={slug} />;
}
