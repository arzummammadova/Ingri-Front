import { setRequestLocale } from "next-intl/server";
import BookReader from "./_components/BookReader";
export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <BookReader slug={slug} />;
}
