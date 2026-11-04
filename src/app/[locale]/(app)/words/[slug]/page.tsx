import { setRequestLocale } from "next-intl/server";
import WordDetail from "./_components/WordDetail";
export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <WordDetail slug={slug} />;
}
