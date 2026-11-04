import { setRequestLocale } from "next-intl/server";
import SecurityView from "./_components/SecurityView";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SecurityView />;
}
