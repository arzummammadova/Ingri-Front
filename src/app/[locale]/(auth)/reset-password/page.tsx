import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import ResetForm from "./_components/ResetForm";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Suspense><ResetForm /></Suspense>;
}
