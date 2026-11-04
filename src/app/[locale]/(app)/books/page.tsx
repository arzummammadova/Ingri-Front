import { setRequestLocale } from "next-intl/server";
import BookList from "./_components/BookList";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BookList />;
}
