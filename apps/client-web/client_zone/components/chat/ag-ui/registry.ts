import { AccentNoteCard } from "./cards/AccentNoteCard";
import { BankOfferCard } from "./cards/BankOfferCard";
import { BrokerProfileCard } from "./cards/BrokerProfileCard";
import { ComparisonTableCard } from "./cards/ComparisonTableCard";
import { DeveloperProfileCard } from "./cards/DeveloperProfileCard";
import { ExecutionResultCard } from "./cards/ExecutionResultCard";
import { FollowupPromptCard } from "./cards/FollowupPromptCard";
import { InsightBriefCard } from "./cards/InsightBriefCard";
import { LoanCalculatorCard } from "./cards/LoanCalculatorCard";
import { MarketAnalysisCard } from "./cards/MarketAnalysisCard";
import { MortgageCheckCard } from "./cards/MortgageCheckCard";
import { PermitStatusCard } from "./cards/PermitStatusCard";
import { PropertyShortlistCard } from "./cards/PropertyShortlistCard";
import { RoiProjectionCard } from "./cards/RoiProjectionCard";

/**
 * WHY:   Client AG UI cards need a stable component lookup table that mirrors the workspace `componentId` flow.
 * WHAT:  Exports the client-safe component registry for assistant turn rendering.
 * HOW:   Keeps the mapping declarative so future live cards can be added without touching the shell renderer.
 */
export const CLIENT_AG_UI_REGISTRY = {
  property_shortlist: PropertyShortlistCard,
  comparison_table: ComparisonTableCard,
  mortgage_check: MortgageCheckCard,
  loan_calculator: LoanCalculatorCard,
  roi_projection: RoiProjectionCard,
  market_analysis: MarketAnalysisCard,
  bank_offer: BankOfferCard,
  insight_brief: InsightBriefCard,
  accent_note: AccentNoteCard,
  broker_profile: BrokerProfileCard,
  developer_profile: DeveloperProfileCard,
  permit_status: PermitStatusCard,
  execution_result: ExecutionResultCard,
  followup_prompt: FollowupPromptCard,
};
