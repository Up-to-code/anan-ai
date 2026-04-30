"use client";

import type { RouteTab } from "@anan/ui/admin";
import { RouteTabs as SharedRouteTabs, type RouteTabsLinkProps } from "@anan/ui/admin";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NextRouteTabLink({ href, children, ...props }: RouteTabsLinkProps) {
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}

export default function RouteTabs({
  tabs,
  className,
  mode = "segmented",
}: {
  tabs: RouteTab[];
  className?: string;
  mode?: "segmented" | "subnav";
}) {
  return (
    <SharedRouteTabs
      tabs={tabs}
      activePath={usePathname()}
      className={className}
      mode={mode}
      LinkComponent={NextRouteTabLink}
    />
  );
}
