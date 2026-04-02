import type { Id } from "@convex/dataModel";

export type BuyerProperty = {
  id: Id<"properties"> | string;
  title: string;
  address: string;
  bankId?: Id<"banks"> | string;
  location?: string;
  area?: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  status?: string;
  media: string[];
  owner: {
    id: string;
    type: "broker" | "RED";
    name: string;
    slug: string;
    isVerified: boolean;
    description?: string;
    phone?: string;
    contactEmail?: string;
    agencyLabel?: string;
    rating?: number;
    activeListings?: number;
    establishedYear?: number;
    completedProjects?: number;
  };
  aiSummary?: string;
};

export type BuyerAssistantCard =
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
    }
  | {
      type: "broker_profile";
      title: string;
      brokerName: string;
      brokerAgency: string;
      rating: number;
      activeListings: number;
      summary: string;
    }
  | {
      type: "developer_profile";
      title: string;
      developerName: string;
      establishedYear: number;
      completedProjects: number;
      summary: string;
    }
  | {
      type: "loan_calculator";
      title: string;
      propertyPrice: number;
      downPayment: number;
      loanAmount: number;
      interestRate: number;
      years: number;
      monthlyPayment: number;
      summary: string;
    }
  | {
      type: "bank_offer";
      title: string;
      bankName: string;
      rateLabel: string;
      downPaymentPercent: number;
      monthlyEstimate: number;
      summary: string;
    };

export type BuyerAssistantMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt: number;
  properties?: BuyerProperty[];
  cards?: BuyerAssistantCard[];
  activePropertyId?: string;
  requiresAuthForHandoff?: boolean;
  suggestedPrompts?: string[];
};

export type BuyerChatSuggestion = {
  id: string;
  label: string;
  prompt: string;
};

export type BuyerThreadSummary = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  preview?: string;
};
