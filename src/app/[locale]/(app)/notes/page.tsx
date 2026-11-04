import { setRequestLocale } from "next-intl/server";
import NotesView from "./_components/NotesView";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NotesView />;
}
