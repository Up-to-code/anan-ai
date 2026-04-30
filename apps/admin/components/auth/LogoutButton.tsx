"use client";

import { startTransition, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import { authClient } from "@/lib/auth-client";

type LogoutButtonProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * WHY:   Admin operators need an explicit session exit action inside the console shell.
 * WHAT:  Renders a sign-out button that clears the Convex auth session and returns to `/signin`.
 * HOW:   Uses the auth react bindings with a local pending state and router replace on success.
 */
export default function LogoutButton({
  children = "Sign Out",
  className,
}: LogoutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="dark"
      className={className}
      onClick={() => {
        setPending(true);
        startTransition(() => {
          void authClient.signOut()
            .then(() => router.replace("/signin"))
            .catch(() => setPending(false));
        });
      }}
    >
      {pending ? "جاري تسجيل الخروج..." : children}
    </Button>
  );
}
