"use client";

import { startTransition, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import Button from "@/components/shared/Button";

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
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="dark"
      className={className}
      onClick={() => {
        setPending(true);
        startTransition(() => {
          void signOut()
            .then(() => router.replace("/signin"))
            .catch(() => setPending(false));
        });
      }}
    >
      {pending ? "Signing out..." : children}
    </Button>
  );
}
