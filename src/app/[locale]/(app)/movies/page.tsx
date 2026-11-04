import { setRequestLocale } from "next-intl/server";
import MovieList from "./_components/MovieList";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MovieList />;
}
