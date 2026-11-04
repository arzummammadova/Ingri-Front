import { setRequestLocale } from "next-intl/server";
import PlanView from "./_components/PlanView";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PlanView />;
}
