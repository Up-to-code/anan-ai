import { fetchMutation } from "convex/nextjs";
import { formsApi } from "./api";
import type { FormsRepository } from "./types";

export type { FormsRepository } from "./types";

export const convexFormsRepository: FormsRepository = {
  async submit(input) {
    return fetchMutation(formsApi.submitForm as never, input as never) as ReturnType<FormsRepository["submit"]>;
  },
};
