import { setRequestLocale } from "next-intl/server";
import ListeningExercise from "./_components/ListeningExercise";
export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <ListeningExercise slug={slug} />;
}
