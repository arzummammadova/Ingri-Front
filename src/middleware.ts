import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const publicPattern =
  /^\/(az|en|ru)\/(login|register|forgot-password|reset-password|verify-email)\/?$/;

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = pathname.split("/")[1];
  const isLocale = locale === "az" || locale === "en" || locale === "ru";
  const isPublic = publicPattern.test(pathname);
  const hasSession = request.cookies.has("accessToken") || request.cookies.has("refreshToken");

  if (isLocale && !isPublic && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (hasSession && /^\/(az|en|ru)\/(login|register|forgot-password)\/?$/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
