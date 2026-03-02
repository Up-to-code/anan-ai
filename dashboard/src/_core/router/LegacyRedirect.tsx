import { Navigate } from "react-router-dom";
import { useLocale } from "@/shared_logic/i18n/useLocale";

export default function LegacyRedirect({ to }: { to: string }) {
  const { localizePath } = useLocale();
  return <Navigate to={localizePath(to)} replace />;
}
