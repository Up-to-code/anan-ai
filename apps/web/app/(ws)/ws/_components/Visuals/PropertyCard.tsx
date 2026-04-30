import Link from "next/link";
import {
  WorkspacePropertyCardContent,
  type WorkspacePropertyCardContentProps,
} from "@anan/ui/workspace";

type PropertyCardProps = WorkspacePropertyCardContentProps & {
  href?: string;
};

export default function PropertyCard({ href, ...props }: PropertyCardProps) {
  const content = <WorkspacePropertyCardContent {...props} />;

  if (!href) return content;
  return <Link href={href} className="block">{content}</Link>;
}
