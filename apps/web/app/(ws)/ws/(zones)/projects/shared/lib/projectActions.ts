import { normalizeDomainError } from "@/server/contracts/errors";
import type { ProjectMutationActionResult } from "../../pages/ProjectsPage/actionTypes";

export function toProjectActionResult(error: unknown): ProjectMutationActionResult {
  const domainError = normalizeDomainError(error);
  return { ok: false, code: domainError.code, message: domainError.message };
}
