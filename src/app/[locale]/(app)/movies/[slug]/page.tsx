import { setRequestLocale } from "next-intl/server";
import MovieDetail from "./_components/MovieDetail";
export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <MovieDetail slug={slug} />;
}
