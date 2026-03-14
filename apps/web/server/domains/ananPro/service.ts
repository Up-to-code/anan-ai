import { requireSessionContext } from "@/server/auth/session";
import {
  convexAnanProRepository,
  type AnanProRepository,
} from "@/server/infrastructure/convex/ananProRepository";
import type { SendAnanProMessageInput } from "@/server/contracts/ananPro";

type AnanProServiceDependencies = {
  requireSession: typeof requireSessionContext;
  repository: AnanProRepository;
};

const defaultDependencies: AnanProServiceDependencies = {
  requireSession: requireSessionContext,
  repository: convexAnanProRepository,
};

export async function getAnanProThread(
  threadId?: string,
  dependencies: AnanProServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.getThread(session.token, threadId);
}

export async function listAnanProThreads(
  limit = 6,
  dependencies: AnanProServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.listThreads(session.token, limit);
}

export async function sendAnanProMessage(
  input: SendAnanProMessageInput,
  dependencies: AnanProServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.sendMessage(session.token, input);
}
