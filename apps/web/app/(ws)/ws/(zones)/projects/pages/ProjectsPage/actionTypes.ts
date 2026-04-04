export type ProjectMutationActionResult =
  | { ok: true }
  | {
      ok: false;
      code: string;
      message: string;
    };
