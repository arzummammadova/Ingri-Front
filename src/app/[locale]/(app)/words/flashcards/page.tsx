import { setRequestLocale } from "next-intl/server";
import Flashcards from "./_components/Flashcards";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Flashcards />;
}
