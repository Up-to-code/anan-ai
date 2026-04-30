import type { AdminButtonProps } from "@anan/ui/admin";
import { AdminButton } from "@anan/ui/admin";
import Link from "next/link";

type ButtonProps = AdminButtonProps & {
  href?: string;
};

export default function Button({ href, children, ...props }: ButtonProps) {
  if (href) {
    return (
      <Link href={href}>
        <AdminButton {...props}>{children}</AdminButton>
      </Link>
    );
  }

  return <AdminButton {...props}>{children}</AdminButton>;
}
