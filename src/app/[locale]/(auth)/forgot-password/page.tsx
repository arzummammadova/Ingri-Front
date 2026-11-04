import { setRequestLocale } from "next-intl/server";
import ForgotForm from "./_components/ForgotForm";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ForgotForm />;
}
