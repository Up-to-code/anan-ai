export type AIPanelResult =
  | {
      type: "roi_summary";
      title: string;
      purchasePrice: number;
      estimatedAnnualRent: number;
      grossYieldPercent: number;
      summary: string;
    }
  | {
      type: "payment_plan";
      title: string;
      downPayment: number;
      monthlyInstallment: number;
      durationMonths: number;
      summary: string;
    }
  | {
      type: "mortgage_check";
      title: string;
      estimatedEligibility: "eligible" | "review" | "insufficient_data";
      recommendedBudget?: number;
      monthlyInstallmentEstimate?: number;
      summary: string;
    }
  | {
      type: "permit_status";
      title: string;
      permitStatus: "verified" | "pending_review" | "not_available";
      summary: string;
    }
  | {
      type: "comparison_table";
      title: string;
      columns: string[];
      rows: string[][];
      summary: string;
    }
  | {
      type: "broker_handoff";
      title: string;
      handoffStatus: "qualified" | "needs_more_info";
      summary: string;
    };
