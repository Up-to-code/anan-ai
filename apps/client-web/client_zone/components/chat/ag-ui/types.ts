import type { ClientProperty } from "@/client_zone/lib/types";

export type PropertyShortlistCardProps = {
  properties: ClientProperty[];
};

export type ComparisonTableCardProps = {
  title: string;
  columns: string[];
  rows: string[][];
  summary?: string;
};

export type MortgageCheckCardProps = {
  title: string;
  estimatedEligibility: "eligible" | "review" | "insufficient_data";
  recommendedBudget?: number;
  monthlyInstallmentEstimate?: number;
  summary: string;
};

export type LoanCalculatorCardProps = {
  title: string;
  propertyPrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  years: number;
  monthlyPayment: number;
  summary: string;
};

export type RoiProjectionCardProps = {
  title: string;
  purchasePrice: number;
  annualRent: number;
  projectedValue5Years: number;
  yieldPercent: number;
  summary: string;
};

export type MarketAnalysisCardProps = {
  title: string;
  location: string;
  averagePrice: number;
  priceTrend: "up" | "flat" | "down";
  trendPercentage: number;
  summary: string;
};

export type BankOfferCardProps = {
  title: string;
  bankName: string;
  rateLabel: string;
  downPaymentPercent: number;
  monthlyEstimate: number;
  summary: string;
};

export type InsightBriefCardProps = {
  title: string;
  body: string;
  summary: string;
};

export type AccentNoteCardProps = {
  title: string;
  tone: "info" | "success" | "warning";
  summary: string;
};

export type BrokerProfileCardProps = {
  title: string;
  brokerName: string;
  brokerAgency: string;
  rating: number;
  activeListings: number;
  summary: string;
};

export type DeveloperProfileCardProps = {
  title: string;
  developerName: string;
  establishedYear: number;
  completedProjects: number;
  summary: string;
};

export type PermitStatusCardProps = {
  title: string;
  permitStatus: "verified" | "pending_review" | "not_available";
  summary: string;
};

export type ExecutionResultCardProps = {
  title: string;
  description: string;
  status: "done" | "blocked" | "info";
};

export type FollowupPromptCardProps = {
  title: string;
  summary: string;
  actionLabel: string;
};
