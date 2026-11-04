import { setRequestLocale } from "next-intl/server";
import GrammarQuiz from "./_components/GrammarQuiz";

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <GrammarQuiz slug={slug} />;
}
