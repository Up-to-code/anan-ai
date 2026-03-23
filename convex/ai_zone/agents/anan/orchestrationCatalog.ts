import {
  defineAgentConfig,
  defineModels,
  defineTools,
} from "../core/registry";
import { getLastSearchContext as getSearchLastContext } from "../team_search/anan_search/tools/getLastSearchContext";
import { getLastSearchFindings as getSearchLastFindings } from "../team_search/anan_search/tools/getLastSearchFindings";
import { smartPropertySearch } from "../team_search/anan_search/tools/smartPropertySearch";
import { browseAndExtract } from "../team_search/anan_web/tools/browseAndExtract";

import { getLastSearchContext as getPropertyLastContext } from "../team_property/tools/getLastSearchContext";
import { getLastSearchFindings as getPropertyLastFindings } from "../team_property/tools/getLastSearchFindings";
import { getMemoryContext as getPropertyMemoryContext } from "../team_property/tools/getMemoryContext";

import { estimateMortgage } from "../team_finance/tools/estimateMortgage";
import { getBankBundles } from "../team_finance/tools/getBankBundles";

import { getKnowledgePage } from "../team_knowledge/tools/getKnowledgePage";
import { getMemoryContext as getKnowledgeMemoryContext } from "../team_knowledge/tools/getMemoryContext";
import { storeInteraction } from "../team_knowledge/tools/storeInteraction";
import { storeUserPreference } from "../team_knowledge/tools/storeUserPreference";

import { getDeveloperHandbookSnippets } from "../team_platform/tools/getDeveloperHandbookSnippets";
import { suggestTrainingEntry } from "../team_trainer/tools/suggestTrainingEntry";

export const MODEL_CATALOG = defineModels({
  defaultModel: "google/gemini-2.5-flash",
  models: {
    "google/gemini-2.5-flash": {
      id: "google/gemini-2.5-flash",
      description: "Primary default model for user orchestration.",
    },
    "google/gemini-2.0-flash": {
      id: "google/gemini-2.0-flash",
      description: "Fallback model for user orchestration.",
    },
  },
});

export const TOOL_CATALOG = defineTools({
  search_smart_property: {
    key: "search_smart_property",
    description: "Search properties across internal data and portals.",
    factory: smartPropertySearch,
  },
  search_last_context: {
    key: "search_last_context",
    description: "Fetch the latest search context for the user.",
    factory: getSearchLastContext,
  },
  search_last_findings: {
    key: "search_last_findings",
    description: "Fetch the latest search findings for the user.",
    factory: getSearchLastFindings,
  },
  web_browse_extract: {
    key: "web_browse_extract",
    description: "Browse external sources and extract structured content.",
    factory: browseAndExtract,
  },
  property_last_context: {
    key: "property_last_context",
    description: "Reuse the last property search context for analysis.",
    factory: getPropertyLastContext,
  },
  property_last_findings: {
    key: "property_last_findings",
    description: "Reuse the last property search findings for comparison.",
    factory: getPropertyLastFindings,
  },
  property_memory_context: {
    key: "property_memory_context",
    description: "Retrieve preference memory for personalized recommendations.",
    factory: getPropertyMemoryContext,
  },
  finance_bank_bundles: {
    key: "finance_bank_bundles",
    description: "Fetch bank product bundles for financing analysis.",
    factory: getBankBundles,
  },
  finance_estimate_mortgage: {
    key: "finance_estimate_mortgage",
    description: "Estimate mortgage payments and affordability.",
    factory: estimateMortgage,
  },
  knowledge_get_page: {
    key: "knowledge_get_page",
    description: "Retrieve relevant knowledge base snippets (RAG).",
    factory: getKnowledgePage,
  },
  memory_get_context: {
    key: "memory_get_context",
    description: "Fetch per-user memory context.",
    factory: getKnowledgeMemoryContext,
  },
  memory_store_preference: {
    key: "memory_store_preference",
    description: "Store a user preference in memory.",
    factory: storeUserPreference,
  },
  memory_store_interaction: {
    key: "memory_store_interaction",
    description: "Store a user interaction summary in memory.",
    factory: storeInteraction,
  },
  platform_handbook_snippets: {
    key: "platform_handbook_snippets",
    description: "Fetch developer handbook snippets for platform guidance.",
    factory: getDeveloperHandbookSnippets,
  },
  trainer_suggest_entry: {
    key: "trainer_suggest_entry",
    description: "Suggest a training entry based on conversation data.",
    factory: suggestTrainingEntry,
  },
});

export const defineAgent = (input: Parameters<typeof defineAgentConfig>[1]) =>
  defineAgentConfig({ modelCatalog: MODEL_CATALOG, toolCatalog: TOOL_CATALOG }, input);
