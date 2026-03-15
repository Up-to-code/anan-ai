import { agentFactory } from "../../core";
import { AGENT_REGISTRY } from "../../anan/orchestrationConfig";

export const ananRecommenderDefinition = AGENT_REGISTRY.anan_recommender;
export const ananRecommender = agentFactory.create(ananRecommenderDefinition);
