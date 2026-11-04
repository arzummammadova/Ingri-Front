import { setRequestLocale } from "next-intl/server";
import WordList from "./_components/WordList";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WordList />;
}
