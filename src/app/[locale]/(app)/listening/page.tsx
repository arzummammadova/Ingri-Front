import { setRequestLocale } from "next-intl/server";
import ListeningList from "./_components/ListeningList";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ListeningList />;
}
