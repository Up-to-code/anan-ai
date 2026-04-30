"use client";

import { AuthProvider } from "@anan/auth-sdk/react";
import type { AuthSdkSessionResponse } from "@anan/auth-sdk/server";

export default function AuthSdkWorkspaceProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: AuthSdkSessionResponse;
}) {
  return (
    <AuthProvider initialSession={initialSession}>
      {children}
    </AuthProvider>
  );
}
