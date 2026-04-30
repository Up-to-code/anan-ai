"use client";

import { createConvexClientProvider } from "@anan/web-foundation/convex-provider";
import { authClient } from "@/lib/auth-client";

export default createConvexClientProvider({ authClient });
