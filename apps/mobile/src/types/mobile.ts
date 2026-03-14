import { AIPanelResult } from "@/types/assistant";

export type MobilePropertyFeedItem = {
  id: string;
  title: string;
  address: string;
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
  };
  aiSummary?: string;
  recommendedPrompts: string[];
  demoPreviewCard: AIPanelResult;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text?: string;
  properties?: MobilePropertyFeedItem[];
  cards?: AIPanelResult[];
  isThinking?: boolean;
  reasoningSteps?: string[];
  isStreaming?: boolean;
};
