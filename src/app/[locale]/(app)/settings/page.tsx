import { setRequestLocale } from "next-intl/server";
import SettingsView from "./_components/SettingsView";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SettingsView />;
}
