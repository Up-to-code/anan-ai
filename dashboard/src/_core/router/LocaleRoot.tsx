import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { DEFAULT_LOCALE, getDirection, isSupportedLocale, stripLocalePrefix } from "@/shared_logic/i18n/config";
import { useEffect } from "react";

export default function LocaleRoot() {
  const params = useParams<{ lang?: string }>();
  const location = useLocation();
  const lang = params.lang;

  if (lang && !isSupportedLocale(lang)) {
    return <Navigate to={stripLocalePrefix(location.pathname)} replace />;
  }

  const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
  }, [locale]);

  return <Outlet />;
}
