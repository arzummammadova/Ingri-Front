import { setRequestLocale } from "next-intl/server";
import PointsView from "./_components/PointsView";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PointsView />;
}
