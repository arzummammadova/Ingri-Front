import { setRequestLocale } from "next-intl/server";
import PeerView from "./_components/PeerView";
export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <PeerView id={slug} />;
}
