export type ChatCapabilityId =
  | "search"
  | "properties"
  | "loans"
  | "roi"
  | "compare"
  | "booking";

export type ChatCapability = {
  id: ChatCapabilityId;
  label: string;
  hint: string;
  prompt: string;
};

export type PropertyPreview = {
  id: string;
  title: string;
  propertyType: "apartment" | "villa" | "duplex" | "townhouse" | "studio";
  city: string;
  area: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  heroImage: string;
  gallery: string[];
  ownerName: string;
  ownerType: "broker" | "RED";
  isVerified: boolean;
  summary: string;
  annualRentEstimate: number;
  permitStatus: "verified" | "pending_review" | "not_available";
  paymentMonths: number;
  downPaymentRate: number;
};

export type CapabilityResultCard =
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
      type: "roi_projection";
      title: string;
      purchasePrice: number;
      annualRent: number;
      projectedValue5Years: number;
      yieldPercent: number;
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
      type: "market_analysis";
      title: string;
      location: string;
      averagePrice: number;
      priceTrend: "up" | "down" | "stable";
      trendPercentage: number;
      summary: string;
    };

export type JourneyAction =
  | {
      type: "open_property";
      label: string;
      propertyId: string;
    }
  | {
      type: "book_viewing";
      label: string;
      propertyId: string;
    }
  | {
      type: "advisor_handoff";
      label: string;
      propertyId?: string;
    }
  | {
      type: "confirm_details";
      label: string;
    }
  | {
      type: "edit_preferences";
      label: string;
    }
  | {
      type: "add_requirement";
      label: string;
    };

export type ConversationMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  capability?: ChatCapabilityId;
  properties?: PropertyPreview[];
  cards?: CapabilityResultCard[];
  actions?: JourneyAction[];
};
