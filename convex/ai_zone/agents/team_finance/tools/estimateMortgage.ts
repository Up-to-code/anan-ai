/**
 * estimateMortgage.ts — Mortgage calculation tool
 *
 * WHY:   Users need accurate installment estimates.
 * WHAT:  Computes monthly payment, total paid, and interest.
 * HOW:   Uses standard amortization formula.
 */
import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { ActionCtx } from "../../../../_generated/server";
import type { AgentRuntimeContext } from "../../types";

export function estimateMortgage(_ctx: ActionCtx, _runtime: AgentRuntimeContext) {
  return tool({
    description: "Estimate mortgage monthly payment and total cost.",
    inputSchema: zodSchema(z.object({
      principal: z.number().min(0),
      annualRate: z.number().min(0),
      years: z.number().min(1),
      downPayment: z.number().min(0).optional(),
    })),
    execute: async ({ principal, annualRate, years, downPayment }) => {
      const dp = downPayment ?? 0;
      const loanAmount = Math.max(0, principal - dp);
      const monthlyRate = annualRate / 12 / 100;
      const n = years * 12;
      let monthlyPayment = 0;
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / n;
      } else {
        const factor = Math.pow(1 + monthlyRate, n);
        monthlyPayment = (loanAmount * monthlyRate * factor) / (factor - 1);
      }
      const totalPaid = monthlyPayment * n;
      const totalInterest = totalPaid - loanAmount;
      return {
        loanAmount,
        monthlyPayment,
        totalPaid,
        totalInterest,
      };
    },
  });
}
