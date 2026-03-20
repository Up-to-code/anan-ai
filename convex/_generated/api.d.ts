/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _core_oauth_consentRouting from "../_core/oauth/consentRouting.js";
import type * as _core_oauth_constants from "../_core/oauth/constants.js";
import type * as _core_oauth_crypto from "../_core/oauth/crypto.js";
import type * as _core_oauth_http from "../_core/oauth/http.js";
import type * as _core_oauth_httpAuthHandlers from "../_core/oauth/httpAuthHandlers.js";
import type * as _core_oauth_httpDelegatedHandlers from "../_core/oauth/httpDelegatedHandlers.js";
import type * as _core_oauth_httpMetadataHandlers from "../_core/oauth/httpMetadataHandlers.js";
import type * as _core_oauth_httpShared from "../_core/oauth/httpShared.js";
import type * as _core_oauth_httpTokenHandlers from "../_core/oauth/httpTokenHandlers.js";
import type * as _core_oauth_jwt from "../_core/oauth/jwt.js";
import type * as _core_schema_admin from "../_core/schema/admin.js";
import type * as _core_schema_agencies from "../_core/schema/agencies.js";
import type * as _core_schema_ai from "../_core/schema/ai.js";
import type * as _core_schema_auth from "../_core/schema/auth.js";
import type * as _core_schema_contact from "../_core/schema/contact.js";
import type * as _core_schema_crm from "../_core/schema/crm.js";
import type * as _core_schema_forms from "../_core/schema/forms.js";
import type * as _core_schema_knowledge from "../_core/schema/knowledge.js";
import type * as _core_schema_offers from "../_core/schema/offers.js";
import type * as _core_schema_properties from "../_core/schema/properties.js";
import type * as _core_schema_sales from "../_core/schema/sales.js";
import type * as _core_schema_search from "../_core/schema/search.js";
import type * as _core_schema_uploadedFiles from "../_core/schema/uploadedFiles.js";
import type * as _core_schema_users from "../_core/schema/users.js";
import type * as _core_schema_workspace from "../_core/schema/workspace.js";
import type * as _core_security_accessPolicy from "../_core/security/accessPolicy.js";
import type * as _core_security_authConfig from "../_core/security/authConfig.js";
import type * as _core_security_authIssuer from "../_core/security/authIssuer.js";
import type * as _core_security_authProviderErrors from "../_core/security/authProviderErrors.js";
import type * as _core_security_authRedirects from "../_core/security/authRedirects.js";
import type * as _core_security_channelAuth from "../_core/security/channelAuth.js";
import type * as _core_security_delegatedAccess from "../_core/security/delegatedAccess.js";
import type * as _core_security_identity from "../_core/security/identity.js";
import type * as _core_security_migrations from "../_core/security/migrations.js";
import type * as _core_security_profileLookup from "../_core/security/profileLookup.js";
import type * as _core_security_providers from "../_core/security/providers.js";
import type * as admin_zone_RED from "../admin_zone/RED.js";
import type * as admin_zone_activities from "../admin_zone/activities.js";
import type * as admin_zone_analytics from "../admin_zone/analytics.js";
import type * as admin_zone_banks from "../admin_zone/banks.js";
import type * as admin_zone_charts from "../admin_zone/charts.js";
import type * as admin_zone_compliance from "../admin_zone/compliance.js";
import type * as admin_zone_compliance_defaults from "../admin_zone/compliance/defaults.js";
import type * as admin_zone_developers from "../admin_zone/developers.js";
import type * as admin_zone_knowledge from "../admin_zone/knowledge.js";
import type * as admin_zone_notifications from "../admin_zone/notifications.js";
import type * as admin_zone_orders from "../admin_zone/orders.js";
import type * as admin_zone_organizations from "../admin_zone/organizations.js";
import type * as admin_zone_organizations_detail_conversations from "../admin_zone/organizations/detail/conversations.js";
import type * as admin_zone_organizations_detail_offers from "../admin_zone/organizations/detail/offers.js";
import type * as admin_zone_organizations_getOrganizationDetail from "../admin_zone/organizations/getOrganizationDetail.js";
import type * as admin_zone_organizations_helpers from "../admin_zone/organizations/helpers.js";
import type * as admin_zone_organizations_listBrokerOrganizations from "../admin_zone/organizations/listBrokerOrganizations.js";
import type * as admin_zone_organizations_listDeveloperOrganizations from "../admin_zone/organizations/listDeveloperOrganizations.js";
import type * as admin_zone_organizations_listOrganizationInvites from "../admin_zone/organizations/listOrganizationInvites.js";
import type * as admin_zone_organizations_listOrganizationMemberships from "../admin_zone/organizations/listOrganizationMemberships.js";
import type * as admin_zone_organizations_listOrganizationSummaries from "../admin_zone/organizations/listOrganizationSummaries.js";
import type * as admin_zone_overview from "../admin_zone/overview.js";
import type * as admin_zone_properties from "../admin_zone/properties.js";
import type * as admin_zone_services_propertiesService from "../admin_zone/services/propertiesService.js";
import type * as admin_zone_services_usersService from "../admin_zone/services/usersService.js";
import type * as admin_zone_tenantsMigration from "../admin_zone/tenantsMigration.js";
import type * as admin_zone_tenantsMigration_helpers from "../admin_zone/tenantsMigration/helpers.js";
import type * as admin_zone_tenantsMigration_memberInviteProfileSteps from "../admin_zone/tenantsMigration/memberInviteProfileSteps.js";
import type * as admin_zone_tenantsMigration_migrateFromLegacy from "../admin_zone/tenantsMigration/migrateFromLegacy.js";
import type * as admin_zone_threads from "../admin_zone/threads.js";
import type * as admin_zone_users from "../admin_zone/users.js";
import type * as admin_zone_users_detail_activity from "../admin_zone/users/detail/activity.js";
import type * as admin_zone_users_detail_conversations from "../admin_zone/users/detail/conversations.js";
import type * as admin_zone_users_detail_identity from "../admin_zone/users/detail/identity.js";
import type * as admin_zone_users_detail_offers from "../admin_zone/users/detail/offers.js";
import type * as admin_zone_users_detail_relevant from "../admin_zone/users/detail/relevant.js";
import type * as admin_zone_users_detail_sources from "../admin_zone/users/detail/sources.js";
import type * as admin_zone_users_getAdminUserDetailHandler from "../admin_zone/users/getAdminUserDetailHandler.js";
import type * as admin_zone_users_helpers from "../admin_zone/users/helpers.js";
import type * as admin_zone_users_listAdminMemberships from "../admin_zone/users/listAdminMemberships.js";
import type * as admin_zone_users_listAdminProfiles from "../admin_zone/users/listAdminProfiles.js";
import type * as admin_zone_users_listAdminUserVerification from "../admin_zone/users/listAdminUserVerification.js";
import type * as admin_zone_users_listAdminUsers from "../admin_zone/users/listAdminUsers.js";
import type * as admin_zone_users_tenantMembership from "../admin_zone/users/tenantMembership.js";
import type * as admin_zone_verifications from "../admin_zone/verifications.js";
import type * as ai_zone_agents_AnanAgent from "../ai_zone/agents/AnanAgent.js";
import type * as ai_zone_agents_anan_index from "../ai_zone/agents/anan/index.js";
import type * as ai_zone_agents_anan_intentAnalyzer from "../ai_zone/agents/anan/intentAnalyzer.js";
import type * as ai_zone_agents_anan_orchestrate from "../ai_zone/agents/anan/orchestrate.js";
import type * as ai_zone_agents_anan_orchestrationAgentsKnowledge from "../ai_zone/agents/anan/orchestrationAgentsKnowledge.js";
import type * as ai_zone_agents_anan_orchestrationAgentsSearchFinance from "../ai_zone/agents/anan/orchestrationAgentsSearchFinance.js";
import type * as ai_zone_agents_anan_orchestrationCatalog from "../ai_zone/agents/anan/orchestrationCatalog.js";
import type * as ai_zone_agents_anan_orchestrationConfig from "../ai_zone/agents/anan/orchestrationConfig.js";
import type * as ai_zone_agents_anan_resultMerger from "../ai_zone/agents/anan/resultMerger.js";
import type * as ai_zone_agents_anan_teamRegistry from "../ai_zone/agents/anan/teamRegistry.js";
import type * as ai_zone_agents_anan_types from "../ai_zone/agents/anan/types.js";
import type * as ai_zone_agents_anan_workspace_index from "../ai_zone/agents/anan_workspace/index.js";
import type * as ai_zone_agents_anan_workspace_intentAnalyzer from "../ai_zone/agents/anan_workspace/intentAnalyzer.js";
import type * as ai_zone_agents_anan_workspace_orchestrate from "../ai_zone/agents/anan_workspace/orchestrate.js";
import type * as ai_zone_agents_anan_workspace_orchestrationConfig from "../ai_zone/agents/anan_workspace/orchestrationConfig.js";
import type * as ai_zone_agents_anan_workspace_resultMerger from "../ai_zone/agents/anan_workspace/resultMerger.js";
import type * as ai_zone_agents_anan_workspace_teamRegistry from "../ai_zone/agents/anan_workspace/teamRegistry.js";
import type * as ai_zone_agents_anan_workspace_types from "../ai_zone/agents/anan_workspace/types.js";
import type * as ai_zone_agents_config from "../ai_zone/agents/config.js";
import type * as ai_zone_agents_core_AgentFactory from "../ai_zone/agents/core/AgentFactory.js";
import type * as ai_zone_agents_core_BaseConfiguredAgent from "../ai_zone/agents/core/BaseConfiguredAgent.js";
import type * as ai_zone_agents_core_index from "../ai_zone/agents/core/index.js";
import type * as ai_zone_agents_core_promptPolicy from "../ai_zone/agents/core/promptPolicy.js";
import type * as ai_zone_agents_core_registry from "../ai_zone/agents/core/registry.js";
import type * as ai_zone_agents_core_toolRegistry from "../ai_zone/agents/core/toolRegistry.js";
import type * as ai_zone_agents_core_types from "../ai_zone/agents/core/types.js";
import type * as ai_zone_agents_shared_errorHandler from "../ai_zone/agents/shared/errorHandler.js";
import type * as ai_zone_agents_shared_orchestrationTracker from "../ai_zone/agents/shared/orchestrationTracker.js";
import type * as ai_zone_agents_shared_orchestrationTrackerActions from "../ai_zone/agents/shared/orchestrationTrackerActions.js";
import type * as ai_zone_agents_shared_ragActions from "../ai_zone/agents/shared/ragActions.js";
import type * as ai_zone_agents_shared_ragInstances from "../ai_zone/agents/shared/ragInstances.js";
import type * as ai_zone_agents_shared_tokenTracker from "../ai_zone/agents/shared/tokenTracker.js";
import type * as ai_zone_agents_shared_tokenTrackerActions from "../ai_zone/agents/shared/tokenTrackerActions.js";
import type * as ai_zone_agents_shared_workflows from "../ai_zone/agents/shared/workflows.js";
import type * as ai_zone_agents_team_finance_anan_banks_config from "../ai_zone/agents/team_finance/anan_banks/config.js";
import type * as ai_zone_agents_team_finance_anan_finance_config from "../ai_zone/agents/team_finance/anan_finance/config.js";
import type * as ai_zone_agents_team_finance_tools_estimateMortgage from "../ai_zone/agents/team_finance/tools/estimateMortgage.js";
import type * as ai_zone_agents_team_finance_tools_getBankBundles from "../ai_zone/agents/team_finance/tools/getBankBundles.js";
import type * as ai_zone_agents_team_knowledge_anan_knowledge_config from "../ai_zone/agents/team_knowledge/anan_knowledge/config.js";
import type * as ai_zone_agents_team_knowledge_anan_memory_config from "../ai_zone/agents/team_knowledge/anan_memory/config.js";
import type * as ai_zone_agents_team_knowledge_tools_getKnowledgePage from "../ai_zone/agents/team_knowledge/tools/getKnowledgePage.js";
import type * as ai_zone_agents_team_knowledge_tools_getMemoryContext from "../ai_zone/agents/team_knowledge/tools/getMemoryContext.js";
import type * as ai_zone_agents_team_knowledge_tools_storeInteraction from "../ai_zone/agents/team_knowledge/tools/storeInteraction.js";
import type * as ai_zone_agents_team_knowledge_tools_storeUserPreference from "../ai_zone/agents/team_knowledge/tools/storeUserPreference.js";
import type * as ai_zone_agents_team_platform_anan_platform_docs_config from "../ai_zone/agents/team_platform/anan_platform_docs/config.js";
import type * as ai_zone_agents_team_platform_tools_getDeveloperHandbookSnippets from "../ai_zone/agents/team_platform/tools/getDeveloperHandbookSnippets.js";
import type * as ai_zone_agents_team_property_anan_property_config from "../ai_zone/agents/team_property/anan_property/config.js";
import type * as ai_zone_agents_team_property_anan_recommender_config from "../ai_zone/agents/team_property/anan_recommender/config.js";
import type * as ai_zone_agents_team_property_tools_getLastSearchContext from "../ai_zone/agents/team_property/tools/getLastSearchContext.js";
import type * as ai_zone_agents_team_property_tools_getLastSearchFindings from "../ai_zone/agents/team_property/tools/getLastSearchFindings.js";
import type * as ai_zone_agents_team_property_tools_getMemoryContext from "../ai_zone/agents/team_property/tools/getMemoryContext.js";
import type * as ai_zone_agents_team_search_anan_search_config from "../ai_zone/agents/team_search/anan_search/config.js";
import type * as ai_zone_agents_team_search_anan_search_tools_getLastSearchContext from "../ai_zone/agents/team_search/anan_search/tools/getLastSearchContext.js";
import type * as ai_zone_agents_team_search_anan_search_tools_getLastSearchFindings from "../ai_zone/agents/team_search/anan_search/tools/getLastSearchFindings.js";
import type * as ai_zone_agents_team_search_anan_search_tools_serperSearch from "../ai_zone/agents/team_search/anan_search/tools/serperSearch.js";
import type * as ai_zone_agents_team_search_anan_search_tools_smartPropertySearch from "../ai_zone/agents/team_search/anan_search/tools/smartPropertySearch.js";
import type * as ai_zone_agents_team_search_anan_web_config from "../ai_zone/agents/team_search/anan_web/config.js";
import type * as ai_zone_agents_team_search_anan_web_tools_browseAndExtract from "../ai_zone/agents/team_search/anan_web/tools/browseAndExtract.js";
import type * as ai_zone_agents_team_search_anan_web_tools_genericScraper from "../ai_zone/agents/team_search/anan_web/tools/genericScraper.js";
import type * as ai_zone_agents_team_search_anan_web_tools_scrapingConfig from "../ai_zone/agents/team_search/anan_web/tools/scrapingConfig.js";
import type * as ai_zone_agents_team_search_anan_web_tools_stagehand from "../ai_zone/agents/team_search/anan_web/tools/stagehand.js";
import type * as ai_zone_agents_team_trainer_anan_trainer_config from "../ai_zone/agents/team_trainer/anan_trainer/config.js";
import type * as ai_zone_agents_team_trainer_tools_suggestTrainingEntry from "../ai_zone/agents/team_trainer/tools/suggestTrainingEntry.js";
import type * as ai_zone_agents_team_workspace_crm_anan_workspace_crm_config from "../ai_zone/agents/team_workspace_crm/anan_workspace_crm/config.js";
import type * as ai_zone_agents_team_workspace_inbox_anan_workspace_inbox_config from "../ai_zone/agents/team_workspace_inbox/anan_workspace_inbox/config.js";
import type * as ai_zone_agents_team_workspace_offers_anan_workspace_offers_config from "../ai_zone/agents/team_workspace_offers/anan_workspace_offers/config.js";
import type * as ai_zone_agents_team_workspace_org_anan_workspace_org_config from "../ai_zone/agents/team_workspace_org/anan_workspace_org/config.js";
import type * as ai_zone_agents_team_workspace_projects_anan_workspace_projects_config from "../ai_zone/agents/team_workspace_projects/anan_workspace_projects/config.js";
import type * as ai_zone_agents_types from "../ai_zone/agents/types.js";
import type * as ai_zone_assistant from "../ai_zone/assistant.js";
import type * as ai_zone_assistantPro from "../ai_zone/assistantPro.js";
import type * as ai_zone_assistantWorkspace from "../ai_zone/assistantWorkspace.js";
import type * as ai_zone_channels_rules_index from "../ai_zone/channels/rules/index.js";
import type * as ai_zone_channels_whatsapp_actions from "../ai_zone/channels/whatsapp/actions.js";
import type * as ai_zone_channels_whatsapp_api from "../ai_zone/channels/whatsapp/api.js";
import type * as ai_zone_channels_whatsapp_preprocess_index from "../ai_zone/channels/whatsapp/preprocess/index.js";
import type * as ai_zone_channels_whatsapp_preprocess_textPipeline from "../ai_zone/channels/whatsapp/preprocess/textPipeline.js";
import type * as ai_zone_channels_whatsapp_preprocess_voicePipeline from "../ai_zone/channels/whatsapp/preprocess/voicePipeline.js";
import type * as ai_zone_channels_whatsapp_service from "../ai_zone/channels/whatsapp/service.js";
import type * as ai_zone_channels_whatsapp_webhook from "../ai_zone/channels/whatsapp/webhook.js";
import type * as ai_zone_services_agUi from "../ai_zone/services/agUi.js";
import type * as ai_zone_services_agUi_types from "../ai_zone/services/agUi/types.js";
import type * as ai_zone_services_assistantService from "../ai_zone/services/assistantService.js";
import type * as ai_zone_services_assistantService_handleAssistantMessage from "../ai_zone/services/assistantService/handleAssistantMessage.js";
import type * as ai_zone_services_assistantService_owner from "../ai_zone/services/assistantService/owner.js";
import type * as ai_zone_services_assistantService_persistence from "../ai_zone/services/assistantService/persistence.js";
import type * as ai_zone_services_assistantService_promptComposer from "../ai_zone/services/assistantService/promptComposer.js";
import type * as ai_zone_services_assistantService_streamSync from "../ai_zone/services/assistantService/streamSync.js";
import type * as ai_zone_services_assistantService_threads from "../ai_zone/services/assistantService/threads.js";
import type * as ai_zone_services_assistantService_types from "../ai_zone/services/assistantService/types.js";
import type * as ai_zone_services_assistantService_utils from "../ai_zone/services/assistantService/utils.js";
import type * as ai_zone_services_assistantService_workspaceContext from "../ai_zone/services/assistantService/workspaceContext.js";
import type * as ai_zone_services_assistantService_workspaceParsing from "../ai_zone/services/assistantService/workspaceParsing.js";
import type * as ai_zone_services_assistantService_workspaceProjectAction from "../ai_zone/services/assistantService/workspaceProjectAction.js";
import type * as ai_zone_services_assistantService_workspaceStream from "../ai_zone/services/assistantService/workspaceStream.js";
import type * as ai_zone_services_assistantService_workspaceUi from "../ai_zone/services/assistantService/workspaceUi.js";
import type * as ai_zone_services_voiceTranscriptionService from "../ai_zone/services/voiceTranscriptionService.js";
import type * as ai_zone_workflows_index from "../ai_zone/workflows/index.js";
import type * as auditLog from "../auditLog.js";
import type * as auth from "../auth.js";
import type * as authz from "../authz.js";
import type * as broker_zone_overview from "../broker_zone/overview.js";
import type * as broker_zone_properties from "../broker_zone/properties.js";
import type * as broker_zone_repositories_overviewRepository from "../broker_zone/repositories/overviewRepository.js";
import type * as broker_zone_repositories_propertiesRepository from "../broker_zone/repositories/propertiesRepository.js";
import type * as cascading from "../cascading.js";
import type * as http from "../http.js";
import type * as public_zone_contact from "../public_zone/contact.js";
import type * as public_zone_forms from "../public_zone/forms.js";
import type * as red_zone_overview from "../red_zone/overview.js";
import type * as red_zone_properties from "../red_zone/properties.js";
import type * as red_zone_repositories_overviewRepository from "../red_zone/repositories/overviewRepository.js";
import type * as red_zone_repositories_propertiesRepository from "../red_zone/repositories/propertiesRepository.js";
import type * as seed from "../seed.js";
import type * as shared_logic_agencies_repositories from "../shared_logic/agencies/repositories.js";
import type * as shared_logic_agencies_repositories_apiKeys from "../shared_logic/agencies/repositories/apiKeys.js";
import type * as shared_logic_agencies_repositories_core from "../shared_logic/agencies/repositories/core.js";
import type * as shared_logic_agencies_repositories_directory from "../shared_logic/agencies/repositories/directory.js";
import type * as shared_logic_agencies_repositories_index from "../shared_logic/agencies/repositories/index.js";
import type * as shared_logic_agencies_repositories_invites from "../shared_logic/agencies/repositories/invites.js";
import type * as shared_logic_agencies_repositories_membership from "../shared_logic/agencies/repositories/membership.js";
import type * as shared_logic_agencies_repositories_membershipRoleEvents from "../shared_logic/agencies/repositories/membershipRoleEvents.js";
import type * as shared_logic_agencies_repositories_organization from "../shared_logic/agencies/repositories/organization.js";
import type * as shared_logic_banks_queries from "../shared_logic/banks/queries.js";
import type * as shared_logic_batch_index from "../shared_logic/batch/index.js";
import type * as shared_logic_compliance_index from "../shared_logic/compliance/index.js";
import type * as shared_logic_compliance_utils from "../shared_logic/compliance/utils.js";
import type * as shared_logic_content_queries from "../shared_logic/content/queries.js";
import type * as shared_logic_crm_repositories from "../shared_logic/crm/repositories.js";
import type * as shared_logic_developerHandbook_index from "../shared_logic/developerHandbook/index.js";
import type * as shared_logic_files from "../shared_logic/files.js";
import type * as shared_logic_inbox from "../shared_logic/inbox.js";
import type * as shared_logic_inbox_collaborationEvents from "../shared_logic/inbox/collaborationEvents.js";
import type * as shared_logic_inbox_conversations from "../shared_logic/inbox/conversations.js";
import type * as shared_logic_inbox_index from "../shared_logic/inbox/index.js";
import type * as shared_logic_inbox_mutationHelpers from "../shared_logic/inbox/mutationHelpers.js";
import type * as shared_logic_inbox_mutations from "../shared_logic/inbox/mutations.js";
import type * as shared_logic_inbox_offerEvents from "../shared_logic/inbox/offerEvents.js";
import type * as shared_logic_inbox_profiles from "../shared_logic/inbox/profiles.js";
import type * as shared_logic_inbox_queries from "../shared_logic/inbox/queries.js";
import type * as shared_logic_inbox_types from "../shared_logic/inbox/types.js";
import type * as shared_logic_inbox_utils from "../shared_logic/inbox/utils.js";
import type * as shared_logic_knowledge_index from "../shared_logic/knowledge/index.js";
import type * as shared_logic_lib_constants from "../shared_logic/lib/constants.js";
import type * as shared_logic_lib_core_errors from "../shared_logic/lib/core/errors.js";
import type * as shared_logic_lib_core_index from "../shared_logic/lib/core/index.js";
import type * as shared_logic_lib_core_logger from "../shared_logic/lib/core/logger.js";
import type * as shared_logic_lib_core_utilities from "../shared_logic/lib/core/utilities.js";
import type * as shared_logic_lib_httpFetch from "../shared_logic/lib/httpFetch.js";
import type * as shared_logic_lib_language from "../shared_logic/lib/language.js";
import type * as shared_logic_lib_middleware_channelDetect from "../shared_logic/lib/middleware/channelDetect.js";
import type * as shared_logic_lib_middleware_guard from "../shared_logic/lib/middleware/guard.js";
import type * as shared_logic_lib_middleware_index from "../shared_logic/lib/middleware/index.js";
import type * as shared_logic_lib_middleware_rateLimit from "../shared_logic/lib/middleware/rateLimit.js";
import type * as shared_logic_lib_profile from "../shared_logic/lib/profile.js";
import type * as shared_logic_lib_providers from "../shared_logic/lib/providers.js";
import type * as shared_logic_lib_retry from "../shared_logic/lib/retry.js";
import type * as shared_logic_lib_storage from "../shared_logic/lib/storage.js";
import type * as shared_logic_lib_toon from "../shared_logic/lib/toon.js";
import type * as shared_logic_llmCache from "../shared_logic/llmCache.js";
import type * as shared_logic_market from "../shared_logic/market.js";
import type * as shared_logic_market_analytics from "../shared_logic/market/analytics.js";
import type * as shared_logic_market_analytics_aggregate from "../shared_logic/market/analytics/aggregate.js";
import type * as shared_logic_market_analytics_charts from "../shared_logic/market/analytics/charts.js";
import type * as shared_logic_market_analytics_keywords from "../shared_logic/market/analytics/keywords.js";
import type * as shared_logic_market_analytics_latestUpdate from "../shared_logic/market/analytics/latestUpdate.js";
import type * as shared_logic_market_analytics_normalize from "../shared_logic/market/analytics/normalize.js";
import type * as shared_logic_market_analytics_opportunities from "../shared_logic/market/analytics/opportunities.js";
import type * as shared_logic_market_analytics_sellingPoints from "../shared_logic/market/analytics/sellingPoints.js";
import type * as shared_logic_market_analytics_snapshot from "../shared_logic/market/analytics/snapshot.js";
import type * as shared_logic_market_analytics_types from "../shared_logic/market/analytics/types.js";
import type * as shared_logic_market_analytics_utils from "../shared_logic/market/analytics/utils.js";
import type * as shared_logic_market_normalizers from "../shared_logic/market/normalizers.js";
import type * as shared_logic_memory_repository from "../shared_logic/memory/repository.js";
import type * as shared_logic_memory_repository_getRelevantContextInternal from "../shared_logic/memory/repository/getRelevantContextInternal.js";
import type * as shared_logic_memory_repository_getRelevantMemoriesByQuery from "../shared_logic/memory/repository/getRelevantMemoriesByQuery.js";
import type * as shared_logic_memory_repository_shared from "../shared_logic/memory/repository/shared.js";
import type * as shared_logic_notifications from "../shared_logic/notifications.js";
import type * as shared_logic_notificationsNode from "../shared_logic/notificationsNode.js";
import type * as shared_logic_oauth_index from "../shared_logic/oauth/index.js";
import type * as shared_logic_oauth_internal from "../shared_logic/oauth/internal.js";
import type * as shared_logic_oauth_internal_audit from "../shared_logic/oauth/internal/audit.js";
import type * as shared_logic_oauth_internal_authorizations from "../shared_logic/oauth/internal/authorizations.js";
import type * as shared_logic_oauth_internal_authorize from "../shared_logic/oauth/internal/authorize.js";
import type * as shared_logic_oauth_internal_consent from "../shared_logic/oauth/internal/consent.js";
import type * as shared_logic_oauth_internal_delegated from "../shared_logic/oauth/internal/delegated.js";
import type * as shared_logic_oauth_internal_helpers from "../shared_logic/oauth/internal/helpers.js";
import type * as shared_logic_oauth_internal_subjects from "../shared_logic/oauth/internal/subjects.js";
import type * as shared_logic_oauth_internal_tokens from "../shared_logic/oauth/internal/tokens.js";
import type * as shared_logic_oauth_internal_tokens_accessLifecycle from "../shared_logic/oauth/internal/tokens/accessLifecycle.js";
import type * as shared_logic_oauth_internal_tokens_common from "../shared_logic/oauth/internal/tokens/common.js";
import type * as shared_logic_offers from "../shared_logic/offers.js";
import type * as shared_logic_offers_access from "../shared_logic/offers/access.js";
import type * as shared_logic_offers_index from "../shared_logic/offers/index.js";
import type * as shared_logic_offers_mutations from "../shared_logic/offers/mutations.js";
import type * as shared_logic_offers_mutations_apply from "../shared_logic/offers/mutations/apply.js";
import type * as shared_logic_offers_mutations_create from "../shared_logic/offers/mutations/create.js";
import type * as shared_logic_offers_mutations_index from "../shared_logic/offers/mutations/index.js";
import type * as shared_logic_offers_mutations_publish from "../shared_logic/offers/mutations/publish.js";
import type * as shared_logic_offers_mutations_respond from "../shared_logic/offers/mutations/respond.js";
import type * as shared_logic_offers_mutations_sideEffects from "../shared_logic/offers/mutations/sideEffects.js";
import type * as shared_logic_offers_mutations_types from "../shared_logic/offers/mutations/types.js";
import type * as shared_logic_offers_queries from "../shared_logic/offers/queries.js";
import type * as shared_logic_offers_recipients from "../shared_logic/offers/recipients.js";
import type * as shared_logic_properties_cache from "../shared_logic/properties/cache.js";
import type * as shared_logic_properties_history from "../shared_logic/properties/history.js";
import type * as shared_logic_properties_search from "../shared_logic/properties/search.js";
import type * as shared_logic_properties_searchText from "../shared_logic/properties/searchText.js";
import type * as shared_logic_subscriptions_index from "../shared_logic/subscriptions/index.js";
import type * as shared_logic_uploadthing from "../shared_logic/uploadthing.js";
import type * as shared_logic_users_index from "../shared_logic/users/index.js";
import type * as shared_logic_users_session from "../shared_logic/users/session.js";
import type * as shared_logic_users_whatsapp from "../shared_logic/users/whatsapp.js";
import type * as shared_logic_verifications_index from "../shared_logic/verifications/index.js";
import type * as shared_logic_workspaceWorkflows from "../shared_logic/workspaceWorkflows.js";
import type * as tenants from "../tenants.js";
import type * as uploadthing from "../uploadthing.js";
import type * as user_zone_mobile_assistant from "../user_zone/mobile/assistant.js";
import type * as user_zone_mobile_contracts from "../user_zone/mobile/contracts.js";
import type * as user_zone_mobile_feed from "../user_zone/mobile/feed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "_core/oauth/consentRouting": typeof _core_oauth_consentRouting;
  "_core/oauth/constants": typeof _core_oauth_constants;
  "_core/oauth/crypto": typeof _core_oauth_crypto;
  "_core/oauth/http": typeof _core_oauth_http;
  "_core/oauth/httpAuthHandlers": typeof _core_oauth_httpAuthHandlers;
  "_core/oauth/httpDelegatedHandlers": typeof _core_oauth_httpDelegatedHandlers;
  "_core/oauth/httpMetadataHandlers": typeof _core_oauth_httpMetadataHandlers;
  "_core/oauth/httpShared": typeof _core_oauth_httpShared;
  "_core/oauth/httpTokenHandlers": typeof _core_oauth_httpTokenHandlers;
  "_core/oauth/jwt": typeof _core_oauth_jwt;
  "_core/schema/admin": typeof _core_schema_admin;
  "_core/schema/agencies": typeof _core_schema_agencies;
  "_core/schema/ai": typeof _core_schema_ai;
  "_core/schema/auth": typeof _core_schema_auth;
  "_core/schema/contact": typeof _core_schema_contact;
  "_core/schema/crm": typeof _core_schema_crm;
  "_core/schema/forms": typeof _core_schema_forms;
  "_core/schema/knowledge": typeof _core_schema_knowledge;
  "_core/schema/offers": typeof _core_schema_offers;
  "_core/schema/properties": typeof _core_schema_properties;
  "_core/schema/sales": typeof _core_schema_sales;
  "_core/schema/search": typeof _core_schema_search;
  "_core/schema/uploadedFiles": typeof _core_schema_uploadedFiles;
  "_core/schema/users": typeof _core_schema_users;
  "_core/schema/workspace": typeof _core_schema_workspace;
  "_core/security/accessPolicy": typeof _core_security_accessPolicy;
  "_core/security/authConfig": typeof _core_security_authConfig;
  "_core/security/authIssuer": typeof _core_security_authIssuer;
  "_core/security/authProviderErrors": typeof _core_security_authProviderErrors;
  "_core/security/authRedirects": typeof _core_security_authRedirects;
  "_core/security/channelAuth": typeof _core_security_channelAuth;
  "_core/security/delegatedAccess": typeof _core_security_delegatedAccess;
  "_core/security/identity": typeof _core_security_identity;
  "_core/security/migrations": typeof _core_security_migrations;
  "_core/security/profileLookup": typeof _core_security_profileLookup;
  "_core/security/providers": typeof _core_security_providers;
  "admin_zone/RED": typeof admin_zone_RED;
  "admin_zone/activities": typeof admin_zone_activities;
  "admin_zone/analytics": typeof admin_zone_analytics;
  "admin_zone/banks": typeof admin_zone_banks;
  "admin_zone/charts": typeof admin_zone_charts;
  "admin_zone/compliance": typeof admin_zone_compliance;
  "admin_zone/compliance/defaults": typeof admin_zone_compliance_defaults;
  "admin_zone/developers": typeof admin_zone_developers;
  "admin_zone/knowledge": typeof admin_zone_knowledge;
  "admin_zone/notifications": typeof admin_zone_notifications;
  "admin_zone/orders": typeof admin_zone_orders;
  "admin_zone/organizations": typeof admin_zone_organizations;
  "admin_zone/organizations/detail/conversations": typeof admin_zone_organizations_detail_conversations;
  "admin_zone/organizations/detail/offers": typeof admin_zone_organizations_detail_offers;
  "admin_zone/organizations/getOrganizationDetail": typeof admin_zone_organizations_getOrganizationDetail;
  "admin_zone/organizations/helpers": typeof admin_zone_organizations_helpers;
  "admin_zone/organizations/listBrokerOrganizations": typeof admin_zone_organizations_listBrokerOrganizations;
  "admin_zone/organizations/listDeveloperOrganizations": typeof admin_zone_organizations_listDeveloperOrganizations;
  "admin_zone/organizations/listOrganizationInvites": typeof admin_zone_organizations_listOrganizationInvites;
  "admin_zone/organizations/listOrganizationMemberships": typeof admin_zone_organizations_listOrganizationMemberships;
  "admin_zone/organizations/listOrganizationSummaries": typeof admin_zone_organizations_listOrganizationSummaries;
  "admin_zone/overview": typeof admin_zone_overview;
  "admin_zone/properties": typeof admin_zone_properties;
  "admin_zone/services/propertiesService": typeof admin_zone_services_propertiesService;
  "admin_zone/services/usersService": typeof admin_zone_services_usersService;
  "admin_zone/tenantsMigration": typeof admin_zone_tenantsMigration;
  "admin_zone/tenantsMigration/helpers": typeof admin_zone_tenantsMigration_helpers;
  "admin_zone/tenantsMigration/memberInviteProfileSteps": typeof admin_zone_tenantsMigration_memberInviteProfileSteps;
  "admin_zone/tenantsMigration/migrateFromLegacy": typeof admin_zone_tenantsMigration_migrateFromLegacy;
  "admin_zone/threads": typeof admin_zone_threads;
  "admin_zone/users": typeof admin_zone_users;
  "admin_zone/users/detail/activity": typeof admin_zone_users_detail_activity;
  "admin_zone/users/detail/conversations": typeof admin_zone_users_detail_conversations;
  "admin_zone/users/detail/identity": typeof admin_zone_users_detail_identity;
  "admin_zone/users/detail/offers": typeof admin_zone_users_detail_offers;
  "admin_zone/users/detail/relevant": typeof admin_zone_users_detail_relevant;
  "admin_zone/users/detail/sources": typeof admin_zone_users_detail_sources;
  "admin_zone/users/getAdminUserDetailHandler": typeof admin_zone_users_getAdminUserDetailHandler;
  "admin_zone/users/helpers": typeof admin_zone_users_helpers;
  "admin_zone/users/listAdminMemberships": typeof admin_zone_users_listAdminMemberships;
  "admin_zone/users/listAdminProfiles": typeof admin_zone_users_listAdminProfiles;
  "admin_zone/users/listAdminUserVerification": typeof admin_zone_users_listAdminUserVerification;
  "admin_zone/users/listAdminUsers": typeof admin_zone_users_listAdminUsers;
  "admin_zone/users/tenantMembership": typeof admin_zone_users_tenantMembership;
  "admin_zone/verifications": typeof admin_zone_verifications;
  "ai_zone/agents/AnanAgent": typeof ai_zone_agents_AnanAgent;
  "ai_zone/agents/anan/index": typeof ai_zone_agents_anan_index;
  "ai_zone/agents/anan/intentAnalyzer": typeof ai_zone_agents_anan_intentAnalyzer;
  "ai_zone/agents/anan/orchestrate": typeof ai_zone_agents_anan_orchestrate;
  "ai_zone/agents/anan/orchestrationAgentsKnowledge": typeof ai_zone_agents_anan_orchestrationAgentsKnowledge;
  "ai_zone/agents/anan/orchestrationAgentsSearchFinance": typeof ai_zone_agents_anan_orchestrationAgentsSearchFinance;
  "ai_zone/agents/anan/orchestrationCatalog": typeof ai_zone_agents_anan_orchestrationCatalog;
  "ai_zone/agents/anan/orchestrationConfig": typeof ai_zone_agents_anan_orchestrationConfig;
  "ai_zone/agents/anan/resultMerger": typeof ai_zone_agents_anan_resultMerger;
  "ai_zone/agents/anan/teamRegistry": typeof ai_zone_agents_anan_teamRegistry;
  "ai_zone/agents/anan/types": typeof ai_zone_agents_anan_types;
  "ai_zone/agents/anan_workspace/index": typeof ai_zone_agents_anan_workspace_index;
  "ai_zone/agents/anan_workspace/intentAnalyzer": typeof ai_zone_agents_anan_workspace_intentAnalyzer;
  "ai_zone/agents/anan_workspace/orchestrate": typeof ai_zone_agents_anan_workspace_orchestrate;
  "ai_zone/agents/anan_workspace/orchestrationConfig": typeof ai_zone_agents_anan_workspace_orchestrationConfig;
  "ai_zone/agents/anan_workspace/resultMerger": typeof ai_zone_agents_anan_workspace_resultMerger;
  "ai_zone/agents/anan_workspace/teamRegistry": typeof ai_zone_agents_anan_workspace_teamRegistry;
  "ai_zone/agents/anan_workspace/types": typeof ai_zone_agents_anan_workspace_types;
  "ai_zone/agents/config": typeof ai_zone_agents_config;
  "ai_zone/agents/core/AgentFactory": typeof ai_zone_agents_core_AgentFactory;
  "ai_zone/agents/core/BaseConfiguredAgent": typeof ai_zone_agents_core_BaseConfiguredAgent;
  "ai_zone/agents/core/index": typeof ai_zone_agents_core_index;
  "ai_zone/agents/core/promptPolicy": typeof ai_zone_agents_core_promptPolicy;
  "ai_zone/agents/core/registry": typeof ai_zone_agents_core_registry;
  "ai_zone/agents/core/toolRegistry": typeof ai_zone_agents_core_toolRegistry;
  "ai_zone/agents/core/types": typeof ai_zone_agents_core_types;
  "ai_zone/agents/shared/errorHandler": typeof ai_zone_agents_shared_errorHandler;
  "ai_zone/agents/shared/orchestrationTracker": typeof ai_zone_agents_shared_orchestrationTracker;
  "ai_zone/agents/shared/orchestrationTrackerActions": typeof ai_zone_agents_shared_orchestrationTrackerActions;
  "ai_zone/agents/shared/ragActions": typeof ai_zone_agents_shared_ragActions;
  "ai_zone/agents/shared/ragInstances": typeof ai_zone_agents_shared_ragInstances;
  "ai_zone/agents/shared/tokenTracker": typeof ai_zone_agents_shared_tokenTracker;
  "ai_zone/agents/shared/tokenTrackerActions": typeof ai_zone_agents_shared_tokenTrackerActions;
  "ai_zone/agents/shared/workflows": typeof ai_zone_agents_shared_workflows;
  "ai_zone/agents/team_finance/anan_banks/config": typeof ai_zone_agents_team_finance_anan_banks_config;
  "ai_zone/agents/team_finance/anan_finance/config": typeof ai_zone_agents_team_finance_anan_finance_config;
  "ai_zone/agents/team_finance/tools/estimateMortgage": typeof ai_zone_agents_team_finance_tools_estimateMortgage;
  "ai_zone/agents/team_finance/tools/getBankBundles": typeof ai_zone_agents_team_finance_tools_getBankBundles;
  "ai_zone/agents/team_knowledge/anan_knowledge/config": typeof ai_zone_agents_team_knowledge_anan_knowledge_config;
  "ai_zone/agents/team_knowledge/anan_memory/config": typeof ai_zone_agents_team_knowledge_anan_memory_config;
  "ai_zone/agents/team_knowledge/tools/getKnowledgePage": typeof ai_zone_agents_team_knowledge_tools_getKnowledgePage;
  "ai_zone/agents/team_knowledge/tools/getMemoryContext": typeof ai_zone_agents_team_knowledge_tools_getMemoryContext;
  "ai_zone/agents/team_knowledge/tools/storeInteraction": typeof ai_zone_agents_team_knowledge_tools_storeInteraction;
  "ai_zone/agents/team_knowledge/tools/storeUserPreference": typeof ai_zone_agents_team_knowledge_tools_storeUserPreference;
  "ai_zone/agents/team_platform/anan_platform_docs/config": typeof ai_zone_agents_team_platform_anan_platform_docs_config;
  "ai_zone/agents/team_platform/tools/getDeveloperHandbookSnippets": typeof ai_zone_agents_team_platform_tools_getDeveloperHandbookSnippets;
  "ai_zone/agents/team_property/anan_property/config": typeof ai_zone_agents_team_property_anan_property_config;
  "ai_zone/agents/team_property/anan_recommender/config": typeof ai_zone_agents_team_property_anan_recommender_config;
  "ai_zone/agents/team_property/tools/getLastSearchContext": typeof ai_zone_agents_team_property_tools_getLastSearchContext;
  "ai_zone/agents/team_property/tools/getLastSearchFindings": typeof ai_zone_agents_team_property_tools_getLastSearchFindings;
  "ai_zone/agents/team_property/tools/getMemoryContext": typeof ai_zone_agents_team_property_tools_getMemoryContext;
  "ai_zone/agents/team_search/anan_search/config": typeof ai_zone_agents_team_search_anan_search_config;
  "ai_zone/agents/team_search/anan_search/tools/getLastSearchContext": typeof ai_zone_agents_team_search_anan_search_tools_getLastSearchContext;
  "ai_zone/agents/team_search/anan_search/tools/getLastSearchFindings": typeof ai_zone_agents_team_search_anan_search_tools_getLastSearchFindings;
  "ai_zone/agents/team_search/anan_search/tools/serperSearch": typeof ai_zone_agents_team_search_anan_search_tools_serperSearch;
  "ai_zone/agents/team_search/anan_search/tools/smartPropertySearch": typeof ai_zone_agents_team_search_anan_search_tools_smartPropertySearch;
  "ai_zone/agents/team_search/anan_web/config": typeof ai_zone_agents_team_search_anan_web_config;
  "ai_zone/agents/team_search/anan_web/tools/browseAndExtract": typeof ai_zone_agents_team_search_anan_web_tools_browseAndExtract;
  "ai_zone/agents/team_search/anan_web/tools/genericScraper": typeof ai_zone_agents_team_search_anan_web_tools_genericScraper;
  "ai_zone/agents/team_search/anan_web/tools/scrapingConfig": typeof ai_zone_agents_team_search_anan_web_tools_scrapingConfig;
  "ai_zone/agents/team_search/anan_web/tools/stagehand": typeof ai_zone_agents_team_search_anan_web_tools_stagehand;
  "ai_zone/agents/team_trainer/anan_trainer/config": typeof ai_zone_agents_team_trainer_anan_trainer_config;
  "ai_zone/agents/team_trainer/tools/suggestTrainingEntry": typeof ai_zone_agents_team_trainer_tools_suggestTrainingEntry;
  "ai_zone/agents/team_workspace_crm/anan_workspace_crm/config": typeof ai_zone_agents_team_workspace_crm_anan_workspace_crm_config;
  "ai_zone/agents/team_workspace_inbox/anan_workspace_inbox/config": typeof ai_zone_agents_team_workspace_inbox_anan_workspace_inbox_config;
  "ai_zone/agents/team_workspace_offers/anan_workspace_offers/config": typeof ai_zone_agents_team_workspace_offers_anan_workspace_offers_config;
  "ai_zone/agents/team_workspace_org/anan_workspace_org/config": typeof ai_zone_agents_team_workspace_org_anan_workspace_org_config;
  "ai_zone/agents/team_workspace_projects/anan_workspace_projects/config": typeof ai_zone_agents_team_workspace_projects_anan_workspace_projects_config;
  "ai_zone/agents/types": typeof ai_zone_agents_types;
  "ai_zone/assistant": typeof ai_zone_assistant;
  "ai_zone/assistantPro": typeof ai_zone_assistantPro;
  "ai_zone/assistantWorkspace": typeof ai_zone_assistantWorkspace;
  "ai_zone/channels/rules/index": typeof ai_zone_channels_rules_index;
  "ai_zone/channels/whatsapp/actions": typeof ai_zone_channels_whatsapp_actions;
  "ai_zone/channels/whatsapp/api": typeof ai_zone_channels_whatsapp_api;
  "ai_zone/channels/whatsapp/preprocess/index": typeof ai_zone_channels_whatsapp_preprocess_index;
  "ai_zone/channels/whatsapp/preprocess/textPipeline": typeof ai_zone_channels_whatsapp_preprocess_textPipeline;
  "ai_zone/channels/whatsapp/preprocess/voicePipeline": typeof ai_zone_channels_whatsapp_preprocess_voicePipeline;
  "ai_zone/channels/whatsapp/service": typeof ai_zone_channels_whatsapp_service;
  "ai_zone/channels/whatsapp/webhook": typeof ai_zone_channels_whatsapp_webhook;
  "ai_zone/services/agUi": typeof ai_zone_services_agUi;
  "ai_zone/services/agUi/types": typeof ai_zone_services_agUi_types;
  "ai_zone/services/assistantService": typeof ai_zone_services_assistantService;
  "ai_zone/services/assistantService/handleAssistantMessage": typeof ai_zone_services_assistantService_handleAssistantMessage;
  "ai_zone/services/assistantService/owner": typeof ai_zone_services_assistantService_owner;
  "ai_zone/services/assistantService/persistence": typeof ai_zone_services_assistantService_persistence;
  "ai_zone/services/assistantService/promptComposer": typeof ai_zone_services_assistantService_promptComposer;
  "ai_zone/services/assistantService/streamSync": typeof ai_zone_services_assistantService_streamSync;
  "ai_zone/services/assistantService/threads": typeof ai_zone_services_assistantService_threads;
  "ai_zone/services/assistantService/types": typeof ai_zone_services_assistantService_types;
  "ai_zone/services/assistantService/utils": typeof ai_zone_services_assistantService_utils;
  "ai_zone/services/assistantService/workspaceContext": typeof ai_zone_services_assistantService_workspaceContext;
  "ai_zone/services/assistantService/workspaceParsing": typeof ai_zone_services_assistantService_workspaceParsing;
  "ai_zone/services/assistantService/workspaceProjectAction": typeof ai_zone_services_assistantService_workspaceProjectAction;
  "ai_zone/services/assistantService/workspaceStream": typeof ai_zone_services_assistantService_workspaceStream;
  "ai_zone/services/assistantService/workspaceUi": typeof ai_zone_services_assistantService_workspaceUi;
  "ai_zone/services/voiceTranscriptionService": typeof ai_zone_services_voiceTranscriptionService;
  "ai_zone/workflows/index": typeof ai_zone_workflows_index;
  auditLog: typeof auditLog;
  auth: typeof auth;
  authz: typeof authz;
  "broker_zone/overview": typeof broker_zone_overview;
  "broker_zone/properties": typeof broker_zone_properties;
  "broker_zone/repositories/overviewRepository": typeof broker_zone_repositories_overviewRepository;
  "broker_zone/repositories/propertiesRepository": typeof broker_zone_repositories_propertiesRepository;
  cascading: typeof cascading;
  http: typeof http;
  "public_zone/contact": typeof public_zone_contact;
  "public_zone/forms": typeof public_zone_forms;
  "red_zone/overview": typeof red_zone_overview;
  "red_zone/properties": typeof red_zone_properties;
  "red_zone/repositories/overviewRepository": typeof red_zone_repositories_overviewRepository;
  "red_zone/repositories/propertiesRepository": typeof red_zone_repositories_propertiesRepository;
  seed: typeof seed;
  "shared_logic/agencies/repositories": typeof shared_logic_agencies_repositories;
  "shared_logic/agencies/repositories/apiKeys": typeof shared_logic_agencies_repositories_apiKeys;
  "shared_logic/agencies/repositories/core": typeof shared_logic_agencies_repositories_core;
  "shared_logic/agencies/repositories/directory": typeof shared_logic_agencies_repositories_directory;
  "shared_logic/agencies/repositories/index": typeof shared_logic_agencies_repositories_index;
  "shared_logic/agencies/repositories/invites": typeof shared_logic_agencies_repositories_invites;
  "shared_logic/agencies/repositories/membership": typeof shared_logic_agencies_repositories_membership;
  "shared_logic/agencies/repositories/membershipRoleEvents": typeof shared_logic_agencies_repositories_membershipRoleEvents;
  "shared_logic/agencies/repositories/organization": typeof shared_logic_agencies_repositories_organization;
  "shared_logic/banks/queries": typeof shared_logic_banks_queries;
  "shared_logic/batch/index": typeof shared_logic_batch_index;
  "shared_logic/compliance/index": typeof shared_logic_compliance_index;
  "shared_logic/compliance/utils": typeof shared_logic_compliance_utils;
  "shared_logic/content/queries": typeof shared_logic_content_queries;
  "shared_logic/crm/repositories": typeof shared_logic_crm_repositories;
  "shared_logic/developerHandbook/index": typeof shared_logic_developerHandbook_index;
  "shared_logic/files": typeof shared_logic_files;
  "shared_logic/inbox": typeof shared_logic_inbox;
  "shared_logic/inbox/collaborationEvents": typeof shared_logic_inbox_collaborationEvents;
  "shared_logic/inbox/conversations": typeof shared_logic_inbox_conversations;
  "shared_logic/inbox/index": typeof shared_logic_inbox_index;
  "shared_logic/inbox/mutationHelpers": typeof shared_logic_inbox_mutationHelpers;
  "shared_logic/inbox/mutations": typeof shared_logic_inbox_mutations;
  "shared_logic/inbox/offerEvents": typeof shared_logic_inbox_offerEvents;
  "shared_logic/inbox/profiles": typeof shared_logic_inbox_profiles;
  "shared_logic/inbox/queries": typeof shared_logic_inbox_queries;
  "shared_logic/inbox/types": typeof shared_logic_inbox_types;
  "shared_logic/inbox/utils": typeof shared_logic_inbox_utils;
  "shared_logic/knowledge/index": typeof shared_logic_knowledge_index;
  "shared_logic/lib/constants": typeof shared_logic_lib_constants;
  "shared_logic/lib/core/errors": typeof shared_logic_lib_core_errors;
  "shared_logic/lib/core/index": typeof shared_logic_lib_core_index;
  "shared_logic/lib/core/logger": typeof shared_logic_lib_core_logger;
  "shared_logic/lib/core/utilities": typeof shared_logic_lib_core_utilities;
  "shared_logic/lib/httpFetch": typeof shared_logic_lib_httpFetch;
  "shared_logic/lib/language": typeof shared_logic_lib_language;
  "shared_logic/lib/middleware/channelDetect": typeof shared_logic_lib_middleware_channelDetect;
  "shared_logic/lib/middleware/guard": typeof shared_logic_lib_middleware_guard;
  "shared_logic/lib/middleware/index": typeof shared_logic_lib_middleware_index;
  "shared_logic/lib/middleware/rateLimit": typeof shared_logic_lib_middleware_rateLimit;
  "shared_logic/lib/profile": typeof shared_logic_lib_profile;
  "shared_logic/lib/providers": typeof shared_logic_lib_providers;
  "shared_logic/lib/retry": typeof shared_logic_lib_retry;
  "shared_logic/lib/storage": typeof shared_logic_lib_storage;
  "shared_logic/lib/toon": typeof shared_logic_lib_toon;
  "shared_logic/llmCache": typeof shared_logic_llmCache;
  "shared_logic/market": typeof shared_logic_market;
  "shared_logic/market/analytics": typeof shared_logic_market_analytics;
  "shared_logic/market/analytics/aggregate": typeof shared_logic_market_analytics_aggregate;
  "shared_logic/market/analytics/charts": typeof shared_logic_market_analytics_charts;
  "shared_logic/market/analytics/keywords": typeof shared_logic_market_analytics_keywords;
  "shared_logic/market/analytics/latestUpdate": typeof shared_logic_market_analytics_latestUpdate;
  "shared_logic/market/analytics/normalize": typeof shared_logic_market_analytics_normalize;
  "shared_logic/market/analytics/opportunities": typeof shared_logic_market_analytics_opportunities;
  "shared_logic/market/analytics/sellingPoints": typeof shared_logic_market_analytics_sellingPoints;
  "shared_logic/market/analytics/snapshot": typeof shared_logic_market_analytics_snapshot;
  "shared_logic/market/analytics/types": typeof shared_logic_market_analytics_types;
  "shared_logic/market/analytics/utils": typeof shared_logic_market_analytics_utils;
  "shared_logic/market/normalizers": typeof shared_logic_market_normalizers;
  "shared_logic/memory/repository": typeof shared_logic_memory_repository;
  "shared_logic/memory/repository/getRelevantContextInternal": typeof shared_logic_memory_repository_getRelevantContextInternal;
  "shared_logic/memory/repository/getRelevantMemoriesByQuery": typeof shared_logic_memory_repository_getRelevantMemoriesByQuery;
  "shared_logic/memory/repository/shared": typeof shared_logic_memory_repository_shared;
  "shared_logic/notifications": typeof shared_logic_notifications;
  "shared_logic/notificationsNode": typeof shared_logic_notificationsNode;
  "shared_logic/oauth/index": typeof shared_logic_oauth_index;
  "shared_logic/oauth/internal": typeof shared_logic_oauth_internal;
  "shared_logic/oauth/internal/audit": typeof shared_logic_oauth_internal_audit;
  "shared_logic/oauth/internal/authorizations": typeof shared_logic_oauth_internal_authorizations;
  "shared_logic/oauth/internal/authorize": typeof shared_logic_oauth_internal_authorize;
  "shared_logic/oauth/internal/consent": typeof shared_logic_oauth_internal_consent;
  "shared_logic/oauth/internal/delegated": typeof shared_logic_oauth_internal_delegated;
  "shared_logic/oauth/internal/helpers": typeof shared_logic_oauth_internal_helpers;
  "shared_logic/oauth/internal/subjects": typeof shared_logic_oauth_internal_subjects;
  "shared_logic/oauth/internal/tokens": typeof shared_logic_oauth_internal_tokens;
  "shared_logic/oauth/internal/tokens/accessLifecycle": typeof shared_logic_oauth_internal_tokens_accessLifecycle;
  "shared_logic/oauth/internal/tokens/common": typeof shared_logic_oauth_internal_tokens_common;
  "shared_logic/offers": typeof shared_logic_offers;
  "shared_logic/offers/access": typeof shared_logic_offers_access;
  "shared_logic/offers/index": typeof shared_logic_offers_index;
  "shared_logic/offers/mutations": typeof shared_logic_offers_mutations;
  "shared_logic/offers/mutations/apply": typeof shared_logic_offers_mutations_apply;
  "shared_logic/offers/mutations/create": typeof shared_logic_offers_mutations_create;
  "shared_logic/offers/mutations/index": typeof shared_logic_offers_mutations_index;
  "shared_logic/offers/mutations/publish": typeof shared_logic_offers_mutations_publish;
  "shared_logic/offers/mutations/respond": typeof shared_logic_offers_mutations_respond;
  "shared_logic/offers/mutations/sideEffects": typeof shared_logic_offers_mutations_sideEffects;
  "shared_logic/offers/mutations/types": typeof shared_logic_offers_mutations_types;
  "shared_logic/offers/queries": typeof shared_logic_offers_queries;
  "shared_logic/offers/recipients": typeof shared_logic_offers_recipients;
  "shared_logic/properties/cache": typeof shared_logic_properties_cache;
  "shared_logic/properties/history": typeof shared_logic_properties_history;
  "shared_logic/properties/search": typeof shared_logic_properties_search;
  "shared_logic/properties/searchText": typeof shared_logic_properties_searchText;
  "shared_logic/subscriptions/index": typeof shared_logic_subscriptions_index;
  "shared_logic/uploadthing": typeof shared_logic_uploadthing;
  "shared_logic/users/index": typeof shared_logic_users_index;
  "shared_logic/users/session": typeof shared_logic_users_session;
  "shared_logic/users/whatsapp": typeof shared_logic_users_whatsapp;
  "shared_logic/verifications/index": typeof shared_logic_verifications_index;
  "shared_logic/workspaceWorkflows": typeof shared_logic_workspaceWorkflows;
  tenants: typeof tenants;
  uploadthing: typeof uploadthing;
  "user_zone/mobile/assistant": typeof user_zone_mobile_assistant;
  "user_zone/mobile/contracts": typeof user_zone_mobile_contracts;
  "user_zone/mobile/feed": typeof user_zone_mobile_feed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: {
    apiKeys: {
      destroy: FunctionReference<
        "mutation",
        "internal",
        { apiKey?: string; name?: string },
        | "missing"
        | "deleted"
        | "name mismatch"
        | "must provide either apiKey or name"
      >;
      issue: FunctionReference<
        "mutation",
        "internal",
        { name?: string },
        string
      >;
      validate: FunctionReference<
        "query",
        "internal",
        { apiKey: string },
        boolean
      >;
    };
    files: {
      addFile: FunctionReference<
        "mutation",
        "internal",
        {
          filename?: string;
          hash: string;
          mimeType: string;
          storageId: string;
        },
        { fileId: string; storageId: string }
      >;
      copyFile: FunctionReference<
        "mutation",
        "internal",
        { fileId: string },
        null
      >;
      deleteFiles: FunctionReference<
        "mutation",
        "internal",
        { fileIds: Array<string>; force?: boolean },
        Array<string>
      >;
      get: FunctionReference<
        "query",
        "internal",
        { fileId: string },
        null | {
          _creationTime: number;
          _id: string;
          filename?: string;
          hash: string;
          lastTouchedAt: number;
          mimeType: string;
          refcount: number;
          storageId: string;
        }
      >;
      getFilesToDelete: FunctionReference<
        "query",
        "internal",
        {
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            _creationTime: number;
            _id: string;
            filename?: string;
            hash: string;
            lastTouchedAt: number;
            mimeType: string;
            refcount: number;
            storageId: string;
          }>;
        }
      >;
      useExistingFile: FunctionReference<
        "mutation",
        "internal",
        { filename?: string; hash: string },
        null | { fileId: string; storageId: string }
      >;
    };
    messages: {
      addMessages: FunctionReference<
        "mutation",
        "internal",
        {
          agentName?: string;
          embeddings?: {
            dimension:
              | 128
              | 256
              | 512
              | 768
              | 1024
              | 1408
              | 1536
              | 2048
              | 3072
              | 4096;
            model: string;
            vectors: Array<Array<number> | null>;
          };
          failPendingSteps?: boolean;
          hideFromUserIdSearch?: boolean;
          messages: Array<{
            error?: string;
            fileIds?: Array<string>;
            finishReason?:
              | "stop"
              | "length"
              | "content-filter"
              | "tool-calls"
              | "error"
              | "other"
              | "unknown";
            message:
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            image: string | ArrayBuffer;
                            mimeType?: string;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "image";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "user";
                }
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            signature?: string;
                            text: string;
                            type: "reasoning";
                          }
                        | {
                            data: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "redacted-reasoning";
                          }
                        | {
                            args: any;
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-call";
                          }
                        | {
                            args?: any;
                            experimental_content?: Array<
                              | { text: string; type: "text" }
                              | {
                                  data: string;
                                  mimeType?: string;
                                  type: "image";
                                }
                            >;
                            isError?: boolean;
                            output?:
                              | { type: "text"; value: string }
                              | { type: "json"; value: any }
                              | { type: "error-text"; value: string }
                              | { type: "error-json"; value: any }
                              | {
                                  type: "content";
                                  value: Array<
                                    | { text: string; type: "text" }
                                    | {
                                        data: string;
                                        mediaType: string;
                                        type: "media";
                                      }
                                  >;
                                };
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            result?: any;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-result";
                          }
                        | {
                            id: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "url";
                            title?: string;
                            type: "source";
                            url: string;
                          }
                        | {
                            filename?: string;
                            id: string;
                            mediaType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "document";
                            title: string;
                            type: "source";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "assistant";
                }
              | {
                  content: Array<{
                    args?: any;
                    experimental_content?: Array<
                      | { text: string; type: "text" }
                      | { data: string; mimeType?: string; type: "image" }
                    >;
                    isError?: boolean;
                    output?:
                      | { type: "text"; value: string }
                      | { type: "json"; value: any }
                      | { type: "error-text"; value: string }
                      | { type: "error-json"; value: any }
                      | {
                          type: "content";
                          value: Array<
                            | { text: string; type: "text" }
                            | { data: string; mediaType: string; type: "media" }
                          >;
                        };
                    providerExecuted?: boolean;
                    providerMetadata?: Record<string, Record<string, any>>;
                    providerOptions?: Record<string, Record<string, any>>;
                    result?: any;
                    toolCallId: string;
                    toolName: string;
                    type: "tool-result";
                  }>;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "tool";
                }
              | {
                  content: string;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "system";
                };
            model?: string;
            provider?: string;
            providerMetadata?: Record<string, Record<string, any>>;
            reasoning?: string;
            reasoningDetails?: Array<
              | {
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  signature?: string;
                  text: string;
                  type: "reasoning";
                }
              | { signature?: string; text: string; type: "text" }
              | { data: string; type: "redacted" }
            >;
            sources?: Array<
              | {
                  id: string;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  sourceType: "url";
                  title?: string;
                  type?: "source";
                  url: string;
                }
              | {
                  filename?: string;
                  id: string;
                  mediaType: string;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  sourceType: "document";
                  title: string;
                  type: "source";
                }
            >;
            status?: "pending" | "success" | "failed";
            text?: string;
            usage?: {
              cachedInputTokens?: number;
              completionTokens: number;
              promptTokens: number;
              reasoningTokens?: number;
              totalTokens: number;
            };
            warnings?: Array<
              | {
                  details?: string;
                  setting: string;
                  type: "unsupported-setting";
                }
              | { details?: string; tool: any; type: "unsupported-tool" }
              | { message: string; type: "other" }
            >;
          }>;
          pendingMessageId?: string;
          promptMessageId?: string;
          threadId: string;
          userId?: string;
        },
        {
          messages: Array<{
            _creationTime: number;
            _id: string;
            agentName?: string;
            embeddingId?: string;
            error?: string;
            fileIds?: Array<string>;
            finishReason?:
              | "stop"
              | "length"
              | "content-filter"
              | "tool-calls"
              | "error"
              | "other"
              | "unknown";
            id?: string;
            message?:
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            image: string | ArrayBuffer;
                            mimeType?: string;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "image";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "user";
                }
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            signature?: string;
                            text: string;
                            type: "reasoning";
                          }
                        | {
                            data: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "redacted-reasoning";
                          }
                        | {
                            args: any;
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-call";
                          }
                        | {
                            args?: any;
                            experimental_content?: Array<
                              | { text: string; type: "text" }
                              | {
                                  data: string;
                                  mimeType?: string;
                                  type: "image";
                                }
                            >;
                            isError?: boolean;
                            output?:
                              | { type: "text"; value: string }
                              | { type: "json"; value: any }
                              | { type: "error-text"; value: string }
                              | { type: "error-json"; value: any }
                              | {
                                  type: "content";
                                  value: Array<
                                    | { text: string; type: "text" }
                                    | {
                                        data: string;
                                        mediaType: string;
                                        type: "media";
                                      }
                                  >;
                                };
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            result?: any;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-result";
                          }
                        | {
                            id: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "url";
                            title?: string;
                            type: "source";
                            url: string;
                          }
                        | {
                            filename?: string;
                            id: string;
                            mediaType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "document";
                            title: string;
                            type: "source";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "assistant";
                }
              | {
                  content: Array<{
                    args?: any;
                    experimental_content?: Array<
                      | { text: string; type: "text" }
                      | { data: string; mimeType?: string; type: "image" }
                    >;
                    isError?: boolean;
                    output?:
                      | { type: "text"; value: string }
                      | { type: "json"; value: any }
                      | { type: "error-text"; value: string }
                      | { type: "error-json"; value: any }
                      | {
                          type: "content";
                          value: Array<
                            | { text: string; type: "text" }
                            | { data: string; mediaType: string; type: "media" }
                          >;
                        };
                    providerExecuted?: boolean;
                    providerMetadata?: Record<string, Record<string, any>>;
                    providerOptions?: Record<string, Record<string, any>>;
                    result?: any;
                    toolCallId: string;
                    toolName: string;
                    type: "tool-result";
                  }>;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "tool";
                }
              | {
                  content: string;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "system";
                };
            model?: string;
            order: number;
            provider?: string;
            providerMetadata?: Record<string, Record<string, any>>;
            providerOptions?: Record<string, Record<string, any>>;
            reasoning?: string;
            reasoningDetails?: Array<
              | {
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  signature?: string;
                  text: string;
                  type: "reasoning";
                }
              | { signature?: string; text: string; type: "text" }
              | { data: string; type: "redacted" }
            >;
            sources?: Array<
              | {
                  id: string;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  sourceType: "url";
                  title?: string;
                  type?: "source";
                  url: string;
                }
              | {
                  filename?: string;
                  id: string;
                  mediaType: string;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  sourceType: "document";
                  title: string;
                  type: "source";
                }
            >;
            status: "pending" | "success" | "failed";
            stepOrder: number;
            text?: string;
            threadId: string;
            tool: boolean;
            usage?: {
              cachedInputTokens?: number;
              completionTokens: number;
              promptTokens: number;
              reasoningTokens?: number;
              totalTokens: number;
            };
            userId?: string;
            warnings?: Array<
              | {
                  details?: string;
                  setting: string;
                  type: "unsupported-setting";
                }
              | { details?: string; tool: any; type: "unsupported-tool" }
              | { message: string; type: "other" }
            >;
          }>;
        }
      >;
      cloneThread: FunctionReference<
        "action",
        "internal",
        {
          batchSize?: number;
          copyUserIdForVectorSearch?: boolean;
          excludeToolMessages?: boolean;
          insertAtOrder?: number;
          limit?: number;
          sourceThreadId: string;
          statuses?: Array<"pending" | "success" | "failed">;
          targetThreadId: string;
          upToAndIncludingMessageId?: string;
        },
        number
      >;
      deleteByIds: FunctionReference<
        "mutation",
        "internal",
        { messageIds: Array<string> },
        Array<string>
      >;
      deleteByOrder: FunctionReference<
        "mutation",
        "internal",
        {
          endOrder: number;
          endStepOrder?: number;
          startOrder: number;
          startStepOrder?: number;
          threadId: string;
        },
        { isDone: boolean; lastOrder?: number; lastStepOrder?: number }
      >;
      finalizeMessage: FunctionReference<
        "mutation",
        "internal",
        {
          messageId: string;
          result: { status: "success" } | { error: string; status: "failed" };
        },
        null
      >;
      getMessagesByIds: FunctionReference<
        "query",
        "internal",
        { messageIds: Array<string> },
        Array<null | {
          _creationTime: number;
          _id: string;
          agentName?: string;
          embeddingId?: string;
          error?: string;
          fileIds?: Array<string>;
          finishReason?:
            | "stop"
            | "length"
            | "content-filter"
            | "tool-calls"
            | "error"
            | "other"
            | "unknown";
          id?: string;
          message?:
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          image: string | ArrayBuffer;
                          mimeType?: string;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "image";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "user";
              }
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          signature?: string;
                          text: string;
                          type: "reasoning";
                        }
                      | {
                          data: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "redacted-reasoning";
                        }
                      | {
                          args: any;
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-call";
                        }
                      | {
                          args?: any;
                          experimental_content?: Array<
                            | { text: string; type: "text" }
                            | { data: string; mimeType?: string; type: "image" }
                          >;
                          isError?: boolean;
                          output?:
                            | { type: "text"; value: string }
                            | { type: "json"; value: any }
                            | { type: "error-text"; value: string }
                            | { type: "error-json"; value: any }
                            | {
                                type: "content";
                                value: Array<
                                  | { text: string; type: "text" }
                                  | {
                                      data: string;
                                      mediaType: string;
                                      type: "media";
                                    }
                                >;
                              };
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          result?: any;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-result";
                        }
                      | {
                          id: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "url";
                          title?: string;
                          type: "source";
                          url: string;
                        }
                      | {
                          filename?: string;
                          id: string;
                          mediaType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "document";
                          title: string;
                          type: "source";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "assistant";
              }
            | {
                content: Array<{
                  args?: any;
                  experimental_content?: Array<
                    | { text: string; type: "text" }
                    | { data: string; mimeType?: string; type: "image" }
                  >;
                  isError?: boolean;
                  output?:
                    | { type: "text"; value: string }
                    | { type: "json"; value: any }
                    | { type: "error-text"; value: string }
                    | { type: "error-json"; value: any }
                    | {
                        type: "content";
                        value: Array<
                          | { text: string; type: "text" }
                          | { data: string; mediaType: string; type: "media" }
                        >;
                      };
                  providerExecuted?: boolean;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  result?: any;
                  toolCallId: string;
                  toolName: string;
                  type: "tool-result";
                }>;
                providerOptions?: Record<string, Record<string, any>>;
                role: "tool";
              }
            | {
                content: string;
                providerOptions?: Record<string, Record<string, any>>;
                role: "system";
              };
          model?: string;
          order: number;
          provider?: string;
          providerMetadata?: Record<string, Record<string, any>>;
          providerOptions?: Record<string, Record<string, any>>;
          reasoning?: string;
          reasoningDetails?: Array<
            | {
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                signature?: string;
                text: string;
                type: "reasoning";
              }
            | { signature?: string; text: string; type: "text" }
            | { data: string; type: "redacted" }
          >;
          sources?: Array<
            | {
                id: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "url";
                title?: string;
                type?: "source";
                url: string;
              }
            | {
                filename?: string;
                id: string;
                mediaType: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "document";
                title: string;
                type: "source";
              }
          >;
          status: "pending" | "success" | "failed";
          stepOrder: number;
          text?: string;
          threadId: string;
          tool: boolean;
          usage?: {
            cachedInputTokens?: number;
            completionTokens: number;
            promptTokens: number;
            reasoningTokens?: number;
            totalTokens: number;
          };
          userId?: string;
          warnings?: Array<
            | { details?: string; setting: string; type: "unsupported-setting" }
            | { details?: string; tool: any; type: "unsupported-tool" }
            | { message: string; type: "other" }
          >;
        }>
      >;
      getMessageSearchFields: FunctionReference<
        "query",
        "internal",
        { messageId: string },
        { embedding?: Array<number>; embeddingModel?: string; text?: string }
      >;
      listMessagesByThreadId: FunctionReference<
        "query",
        "internal",
        {
          excludeToolMessages?: boolean;
          order: "asc" | "desc";
          paginationOpts?: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          statuses?: Array<"pending" | "success" | "failed">;
          threadId: string;
          upToAndIncludingMessageId?: string;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            _creationTime: number;
            _id: string;
            agentName?: string;
            embeddingId?: string;
            error?: string;
            fileIds?: Array<string>;
            finishReason?:
              | "stop"
              | "length"
              | "content-filter"
              | "tool-calls"
              | "error"
              | "other"
              | "unknown";
            id?: string;
            message?:
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            image: string | ArrayBuffer;
                            mimeType?: string;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "image";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "user";
                }
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            signature?: string;
                            text: string;
                            type: "reasoning";
                          }
                        | {
                            data: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "redacted-reasoning";
                          }
                        | {
                            args: any;
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-call";
                          }
                        | {
                            args?: any;
                            experimental_content?: Array<
                              | { text: string; type: "text" }
                              | {
                                  data: string;
                                  mimeType?: string;
                                  type: "image";
                                }
                            >;
                            isError?: boolean;
                            output?:
                              | { type: "text"; value: string }
                              | { type: "json"; value: any }
                              | { type: "error-text"; value: string }
                              | { type: "error-json"; value: any }
                              | {
                                  type: "content";
                                  value: Array<
                                    | { text: string; type: "text" }
                                    | {
                                        data: string;
                                        mediaType: string;
                                        type: "media";
                                      }
                                  >;
                                };
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            result?: any;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-result";
                          }
                        | {
                            id: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "url";
                            title?: string;
                            type: "source";
                            url: string;
                          }
                        | {
                            filename?: string;
                            id: string;
                            mediaType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "document";
                            title: string;
                            type: "source";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "assistant";
                }
              | {
                  content: Array<{
                    args?: any;
                    experimental_content?: Array<
                      | { text: string; type: "text" }
                      | { data: string; mimeType?: string; type: "image" }
                    >;
                    isError?: boolean;
                    output?:
                      | { type: "text"; value: string }
                      | { type: "json"; value: any }
                      | { type: "error-text"; value: string }
                      | { type: "error-json"; value: any }
                      | {
                          type: "content";
                          value: Array<
                            | { text: string; type: "text" }
                            | { data: string; mediaType: string; type: "media" }
                          >;
                        };
                    providerExecuted?: boolean;
                    providerMetadata?: Record<string, Record<string, any>>;
                    providerOptions?: Record<string, Record<string, any>>;
                    result?: any;
                    toolCallId: string;
                    toolName: string;
                    type: "tool-result";
                  }>;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "tool";
                }
              | {
                  content: string;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "system";
                };
            model?: string;
            order: number;
            provider?: string;
            providerMetadata?: Record<string, Record<string, any>>;
            providerOptions?: Record<string, Record<string, any>>;
            reasoning?: string;
            reasoningDetails?: Array<
              | {
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  signature?: string;
                  text: string;
                  type: "reasoning";
                }
              | { signature?: string; text: string; type: "text" }
              | { data: string; type: "redacted" }
            >;
            sources?: Array<
              | {
                  id: string;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  sourceType: "url";
                  title?: string;
                  type?: "source";
                  url: string;
                }
              | {
                  filename?: string;
                  id: string;
                  mediaType: string;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  sourceType: "document";
                  title: string;
                  type: "source";
                }
            >;
            status: "pending" | "success" | "failed";
            stepOrder: number;
            text?: string;
            threadId: string;
            tool: boolean;
            usage?: {
              cachedInputTokens?: number;
              completionTokens: number;
              promptTokens: number;
              reasoningTokens?: number;
              totalTokens: number;
            };
            userId?: string;
            warnings?: Array<
              | {
                  details?: string;
                  setting: string;
                  type: "unsupported-setting";
                }
              | { details?: string; tool: any; type: "unsupported-tool" }
              | { message: string; type: "other" }
            >;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      searchMessages: FunctionReference<
        "action",
        "internal",
        {
          embedding?: Array<number>;
          embeddingModel?: string;
          limit: number;
          messageRange?: { after: number; before: number };
          searchAllMessagesForUserId?: string;
          targetMessageId?: string;
          text?: string;
          textSearch?: boolean;
          threadId?: string;
          vectorScoreThreshold?: number;
          vectorSearch?: boolean;
        },
        Array<{
          _creationTime: number;
          _id: string;
          agentName?: string;
          embeddingId?: string;
          error?: string;
          fileIds?: Array<string>;
          finishReason?:
            | "stop"
            | "length"
            | "content-filter"
            | "tool-calls"
            | "error"
            | "other"
            | "unknown";
          id?: string;
          message?:
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          image: string | ArrayBuffer;
                          mimeType?: string;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "image";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "user";
              }
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          signature?: string;
                          text: string;
                          type: "reasoning";
                        }
                      | {
                          data: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "redacted-reasoning";
                        }
                      | {
                          args: any;
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-call";
                        }
                      | {
                          args?: any;
                          experimental_content?: Array<
                            | { text: string; type: "text" }
                            | { data: string; mimeType?: string; type: "image" }
                          >;
                          isError?: boolean;
                          output?:
                            | { type: "text"; value: string }
                            | { type: "json"; value: any }
                            | { type: "error-text"; value: string }
                            | { type: "error-json"; value: any }
                            | {
                                type: "content";
                                value: Array<
                                  | { text: string; type: "text" }
                                  | {
                                      data: string;
                                      mediaType: string;
                                      type: "media";
                                    }
                                >;
                              };
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          result?: any;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-result";
                        }
                      | {
                          id: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "url";
                          title?: string;
                          type: "source";
                          url: string;
                        }
                      | {
                          filename?: string;
                          id: string;
                          mediaType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "document";
                          title: string;
                          type: "source";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "assistant";
              }
            | {
                content: Array<{
                  args?: any;
                  experimental_content?: Array<
                    | { text: string; type: "text" }
                    | { data: string; mimeType?: string; type: "image" }
                  >;
                  isError?: boolean;
                  output?:
                    | { type: "text"; value: string }
                    | { type: "json"; value: any }
                    | { type: "error-text"; value: string }
                    | { type: "error-json"; value: any }
                    | {
                        type: "content";
                        value: Array<
                          | { text: string; type: "text" }
                          | { data: string; mediaType: string; type: "media" }
                        >;
                      };
                  providerExecuted?: boolean;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  result?: any;
                  toolCallId: string;
                  toolName: string;
                  type: "tool-result";
                }>;
                providerOptions?: Record<string, Record<string, any>>;
                role: "tool";
              }
            | {
                content: string;
                providerOptions?: Record<string, Record<string, any>>;
                role: "system";
              };
          model?: string;
          order: number;
          provider?: string;
          providerMetadata?: Record<string, Record<string, any>>;
          providerOptions?: Record<string, Record<string, any>>;
          reasoning?: string;
          reasoningDetails?: Array<
            | {
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                signature?: string;
                text: string;
                type: "reasoning";
              }
            | { signature?: string; text: string; type: "text" }
            | { data: string; type: "redacted" }
          >;
          sources?: Array<
            | {
                id: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "url";
                title?: string;
                type?: "source";
                url: string;
              }
            | {
                filename?: string;
                id: string;
                mediaType: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "document";
                title: string;
                type: "source";
              }
          >;
          status: "pending" | "success" | "failed";
          stepOrder: number;
          text?: string;
          threadId: string;
          tool: boolean;
          usage?: {
            cachedInputTokens?: number;
            completionTokens: number;
            promptTokens: number;
            reasoningTokens?: number;
            totalTokens: number;
          };
          userId?: string;
          warnings?: Array<
            | { details?: string; setting: string; type: "unsupported-setting" }
            | { details?: string; tool: any; type: "unsupported-tool" }
            | { message: string; type: "other" }
          >;
        }>
      >;
      textSearch: FunctionReference<
        "query",
        "internal",
        {
          limit: number;
          searchAllMessagesForUserId?: string;
          targetMessageId?: string;
          text?: string;
          threadId?: string;
        },
        Array<{
          _creationTime: number;
          _id: string;
          agentName?: string;
          embeddingId?: string;
          error?: string;
          fileIds?: Array<string>;
          finishReason?:
            | "stop"
            | "length"
            | "content-filter"
            | "tool-calls"
            | "error"
            | "other"
            | "unknown";
          id?: string;
          message?:
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          image: string | ArrayBuffer;
                          mimeType?: string;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "image";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "user";
              }
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          signature?: string;
                          text: string;
                          type: "reasoning";
                        }
                      | {
                          data: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "redacted-reasoning";
                        }
                      | {
                          args: any;
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-call";
                        }
                      | {
                          args?: any;
                          experimental_content?: Array<
                            | { text: string; type: "text" }
                            | { data: string; mimeType?: string; type: "image" }
                          >;
                          isError?: boolean;
                          output?:
                            | { type: "text"; value: string }
                            | { type: "json"; value: any }
                            | { type: "error-text"; value: string }
                            | { type: "error-json"; value: any }
                            | {
                                type: "content";
                                value: Array<
                                  | { text: string; type: "text" }
                                  | {
                                      data: string;
                                      mediaType: string;
                                      type: "media";
                                    }
                                >;
                              };
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          result?: any;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-result";
                        }
                      | {
                          id: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "url";
                          title?: string;
                          type: "source";
                          url: string;
                        }
                      | {
                          filename?: string;
                          id: string;
                          mediaType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "document";
                          title: string;
                          type: "source";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "assistant";
              }
            | {
                content: Array<{
                  args?: any;
                  experimental_content?: Array<
                    | { text: string; type: "text" }
                    | { data: string; mimeType?: string; type: "image" }
                  >;
                  isError?: boolean;
                  output?:
                    | { type: "text"; value: string }
                    | { type: "json"; value: any }
                    | { type: "error-text"; value: string }
                    | { type: "error-json"; value: any }
                    | {
                        type: "content";
                        value: Array<
                          | { text: string; type: "text" }
                          | { data: string; mediaType: string; type: "media" }
                        >;
                      };
                  providerExecuted?: boolean;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  result?: any;
                  toolCallId: string;
                  toolName: string;
                  type: "tool-result";
                }>;
                providerOptions?: Record<string, Record<string, any>>;
                role: "tool";
              }
            | {
                content: string;
                providerOptions?: Record<string, Record<string, any>>;
                role: "system";
              };
          model?: string;
          order: number;
          provider?: string;
          providerMetadata?: Record<string, Record<string, any>>;
          providerOptions?: Record<string, Record<string, any>>;
          reasoning?: string;
          reasoningDetails?: Array<
            | {
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                signature?: string;
                text: string;
                type: "reasoning";
              }
            | { signature?: string; text: string; type: "text" }
            | { data: string; type: "redacted" }
          >;
          sources?: Array<
            | {
                id: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "url";
                title?: string;
                type?: "source";
                url: string;
              }
            | {
                filename?: string;
                id: string;
                mediaType: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "document";
                title: string;
                type: "source";
              }
          >;
          status: "pending" | "success" | "failed";
          stepOrder: number;
          text?: string;
          threadId: string;
          tool: boolean;
          usage?: {
            cachedInputTokens?: number;
            completionTokens: number;
            promptTokens: number;
            reasoningTokens?: number;
            totalTokens: number;
          };
          userId?: string;
          warnings?: Array<
            | { details?: string; setting: string; type: "unsupported-setting" }
            | { details?: string; tool: any; type: "unsupported-tool" }
            | { message: string; type: "other" }
          >;
        }>
      >;
      updateMessage: FunctionReference<
        "mutation",
        "internal",
        {
          messageId: string;
          patch: {
            error?: string;
            fileIds?: Array<string>;
            finishReason?:
              | "stop"
              | "length"
              | "content-filter"
              | "tool-calls"
              | "error"
              | "other"
              | "unknown";
            message?:
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            image: string | ArrayBuffer;
                            mimeType?: string;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "image";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "user";
                }
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            signature?: string;
                            text: string;
                            type: "reasoning";
                          }
                        | {
                            data: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "redacted-reasoning";
                          }
                        | {
                            args: any;
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-call";
                          }
                        | {
                            args?: any;
                            experimental_content?: Array<
                              | { text: string; type: "text" }
                              | {
                                  data: string;
                                  mimeType?: string;
                                  type: "image";
                                }
                            >;
                            isError?: boolean;
                            output?:
                              | { type: "text"; value: string }
                              | { type: "json"; value: any }
                              | { type: "error-text"; value: string }
                              | { type: "error-json"; value: any }
                              | {
                                  type: "content";
                                  value: Array<
                                    | { text: string; type: "text" }
                                    | {
                                        data: string;
                                        mediaType: string;
                                        type: "media";
                                      }
                                  >;
                                };
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            result?: any;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-result";
                          }
                        | {
                            id: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "url";
                            title?: string;
                            type: "source";
                            url: string;
                          }
                        | {
                            filename?: string;
                            id: string;
                            mediaType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "document";
                            title: string;
                            type: "source";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "assistant";
                }
              | {
                  content: Array<{
                    args?: any;
                    experimental_content?: Array<
                      | { text: string; type: "text" }
                      | { data: string; mimeType?: string; type: "image" }
                    >;
                    isError?: boolean;
                    output?:
                      | { type: "text"; value: string }
                      | { type: "json"; value: any }
                      | { type: "error-text"; value: string }
                      | { type: "error-json"; value: any }
                      | {
                          type: "content";
                          value: Array<
                            | { text: string; type: "text" }
                            | { data: string; mediaType: string; type: "media" }
                          >;
                        };
                    providerExecuted?: boolean;
                    providerMetadata?: Record<string, Record<string, any>>;
                    providerOptions?: Record<string, Record<string, any>>;
                    result?: any;
                    toolCallId: string;
                    toolName: string;
                    type: "tool-result";
                  }>;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "tool";
                }
              | {
                  content: string;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "system";
                };
            model?: string;
            provider?: string;
            providerOptions?: Record<string, Record<string, any>>;
            status?: "pending" | "success" | "failed";
          };
        },
        {
          _creationTime: number;
          _id: string;
          agentName?: string;
          embeddingId?: string;
          error?: string;
          fileIds?: Array<string>;
          finishReason?:
            | "stop"
            | "length"
            | "content-filter"
            | "tool-calls"
            | "error"
            | "other"
            | "unknown";
          id?: string;
          message?:
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          image: string | ArrayBuffer;
                          mimeType?: string;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "image";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "user";
              }
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          signature?: string;
                          text: string;
                          type: "reasoning";
                        }
                      | {
                          data: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "redacted-reasoning";
                        }
                      | {
                          args: any;
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-call";
                        }
                      | {
                          args?: any;
                          experimental_content?: Array<
                            | { text: string; type: "text" }
                            | { data: string; mimeType?: string; type: "image" }
                          >;
                          isError?: boolean;
                          output?:
                            | { type: "text"; value: string }
                            | { type: "json"; value: any }
                            | { type: "error-text"; value: string }
                            | { type: "error-json"; value: any }
                            | {
                                type: "content";
                                value: Array<
                                  | { text: string; type: "text" }
                                  | {
                                      data: string;
                                      mediaType: string;
                                      type: "media";
                                    }
                                >;
                              };
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          result?: any;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-result";
                        }
                      | {
                          id: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "url";
                          title?: string;
                          type: "source";
                          url: string;
                        }
                      | {
                          filename?: string;
                          id: string;
                          mediaType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "document";
                          title: string;
                          type: "source";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "assistant";
              }
            | {
                content: Array<{
                  args?: any;
                  experimental_content?: Array<
                    | { text: string; type: "text" }
                    | { data: string; mimeType?: string; type: "image" }
                  >;
                  isError?: boolean;
                  output?:
                    | { type: "text"; value: string }
                    | { type: "json"; value: any }
                    | { type: "error-text"; value: string }
                    | { type: "error-json"; value: any }
                    | {
                        type: "content";
                        value: Array<
                          | { text: string; type: "text" }
                          | { data: string; mediaType: string; type: "media" }
                        >;
                      };
                  providerExecuted?: boolean;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  result?: any;
                  toolCallId: string;
                  toolName: string;
                  type: "tool-result";
                }>;
                providerOptions?: Record<string, Record<string, any>>;
                role: "tool";
              }
            | {
                content: string;
                providerOptions?: Record<string, Record<string, any>>;
                role: "system";
              };
          model?: string;
          order: number;
          provider?: string;
          providerMetadata?: Record<string, Record<string, any>>;
          providerOptions?: Record<string, Record<string, any>>;
          reasoning?: string;
          reasoningDetails?: Array<
            | {
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                signature?: string;
                text: string;
                type: "reasoning";
              }
            | { signature?: string; text: string; type: "text" }
            | { data: string; type: "redacted" }
          >;
          sources?: Array<
            | {
                id: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "url";
                title?: string;
                type?: "source";
                url: string;
              }
            | {
                filename?: string;
                id: string;
                mediaType: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "document";
                title: string;
                type: "source";
              }
          >;
          status: "pending" | "success" | "failed";
          stepOrder: number;
          text?: string;
          threadId: string;
          tool: boolean;
          usage?: {
            cachedInputTokens?: number;
            completionTokens: number;
            promptTokens: number;
            reasoningTokens?: number;
            totalTokens: number;
          };
          userId?: string;
          warnings?: Array<
            | { details?: string; setting: string; type: "unsupported-setting" }
            | { details?: string; tool: any; type: "unsupported-tool" }
            | { message: string; type: "other" }
          >;
        }
      >;
    };
    streams: {
      abort: FunctionReference<
        "mutation",
        "internal",
        {
          finalDelta?: {
            end: number;
            parts: Array<any>;
            start: number;
            streamId: string;
          };
          reason: string;
          streamId: string;
        },
        boolean
      >;
      abortByOrder: FunctionReference<
        "mutation",
        "internal",
        { order: number; reason: string; threadId: string },
        boolean
      >;
      addDelta: FunctionReference<
        "mutation",
        "internal",
        { end: number; parts: Array<any>; start: number; streamId: string },
        boolean
      >;
      create: FunctionReference<
        "mutation",
        "internal",
        {
          agentName?: string;
          format?: "UIMessageChunk" | "TextStreamPart";
          model?: string;
          order: number;
          provider?: string;
          providerOptions?: Record<string, Record<string, any>>;
          stepOrder: number;
          threadId: string;
          userId?: string;
        },
        string
      >;
      deleteAllStreamsForThreadIdAsync: FunctionReference<
        "mutation",
        "internal",
        { deltaCursor?: string; streamOrder?: number; threadId: string },
        { deltaCursor?: string; isDone: boolean; streamOrder?: number }
      >;
      deleteAllStreamsForThreadIdSync: FunctionReference<
        "action",
        "internal",
        { threadId: string },
        null
      >;
      deleteStreamAsync: FunctionReference<
        "mutation",
        "internal",
        { cursor?: string; streamId: string },
        null
      >;
      deleteStreamSync: FunctionReference<
        "mutation",
        "internal",
        { streamId: string },
        null
      >;
      finish: FunctionReference<
        "mutation",
        "internal",
        {
          finalDelta?: {
            end: number;
            parts: Array<any>;
            start: number;
            streamId: string;
          };
          streamId: string;
        },
        null
      >;
      heartbeat: FunctionReference<
        "mutation",
        "internal",
        { streamId: string },
        null
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          startOrder?: number;
          statuses?: Array<"streaming" | "finished" | "aborted">;
          threadId: string;
        },
        Array<{
          agentName?: string;
          format?: "UIMessageChunk" | "TextStreamPart";
          model?: string;
          order: number;
          provider?: string;
          providerOptions?: Record<string, Record<string, any>>;
          status: "streaming" | "finished" | "aborted";
          stepOrder: number;
          streamId: string;
          userId?: string;
        }>
      >;
      listDeltas: FunctionReference<
        "query",
        "internal",
        {
          cursors: Array<{ cursor: number; streamId: string }>;
          threadId: string;
        },
        Array<{
          end: number;
          parts: Array<any>;
          start: number;
          streamId: string;
        }>
      >;
    };
    threads: {
      createThread: FunctionReference<
        "mutation",
        "internal",
        {
          defaultSystemPrompt?: string;
          parentThreadIds?: Array<string>;
          summary?: string;
          title?: string;
          userId?: string;
        },
        {
          _creationTime: number;
          _id: string;
          status: "active" | "archived";
          summary?: string;
          title?: string;
          userId?: string;
        }
      >;
      deleteAllForThreadIdAsync: FunctionReference<
        "mutation",
        "internal",
        {
          cursor?: string;
          deltaCursor?: string;
          limit?: number;
          messagesDone?: boolean;
          streamOrder?: number;
          streamsDone?: boolean;
          threadId: string;
        },
        { isDone: boolean }
      >;
      deleteAllForThreadIdSync: FunctionReference<
        "action",
        "internal",
        { limit?: number; threadId: string },
        null
      >;
      getThread: FunctionReference<
        "query",
        "internal",
        { threadId: string },
        {
          _creationTime: number;
          _id: string;
          status: "active" | "archived";
          summary?: string;
          title?: string;
          userId?: string;
        } | null
      >;
      listThreadsByUserId: FunctionReference<
        "query",
        "internal",
        {
          order?: "asc" | "desc";
          paginationOpts?: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          userId?: string;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            _creationTime: number;
            _id: string;
            status: "active" | "archived";
            summary?: string;
            title?: string;
            userId?: string;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      searchThreadTitles: FunctionReference<
        "query",
        "internal",
        { limit: number; query: string; userId?: string | null },
        Array<{
          _creationTime: number;
          _id: string;
          status: "active" | "archived";
          summary?: string;
          title?: string;
          userId?: string;
        }>
      >;
      updateThread: FunctionReference<
        "mutation",
        "internal",
        {
          patch: {
            status?: "active" | "archived";
            summary?: string;
            title?: string;
            userId?: string;
          };
          threadId: string;
        },
        {
          _creationTime: number;
          _id: string;
          status: "active" | "archived";
          summary?: string;
          title?: string;
          userId?: string;
        }
      >;
    };
    users: {
      deleteAllForUserId: FunctionReference<
        "action",
        "internal",
        { userId: string },
        null
      >;
      deleteAllForUserIdAsync: FunctionReference<
        "mutation",
        "internal",
        { userId: string },
        boolean
      >;
      listUsersWithThreads: FunctionReference<
        "query",
        "internal",
        {
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<string>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
    };
    vector: {
      index: {
        deleteBatch: FunctionReference<
          "mutation",
          "internal",
          {
            ids: Array<
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
            >;
          },
          null
        >;
        deleteBatchForThread: FunctionReference<
          "mutation",
          "internal",
          {
            cursor?: string;
            limit: number;
            model: string;
            threadId: string;
            vectorDimension:
              | 128
              | 256
              | 512
              | 768
              | 1024
              | 1408
              | 1536
              | 2048
              | 3072
              | 4096;
          },
          { continueCursor: string; isDone: boolean }
        >;
        insertBatch: FunctionReference<
          "mutation",
          "internal",
          {
            vectorDimension:
              | 128
              | 256
              | 512
              | 768
              | 1024
              | 1408
              | 1536
              | 2048
              | 3072
              | 4096;
            vectors: Array<{
              messageId?: string;
              model: string;
              table: string;
              threadId?: string;
              userId?: string;
              vector: Array<number>;
            }>;
          },
          Array<
            | string
            | string
            | string
            | string
            | string
            | string
            | string
            | string
            | string
            | string
          >
        >;
        paginate: FunctionReference<
          "query",
          "internal",
          {
            cursor?: string;
            limit: number;
            table?: string;
            targetModel: string;
            vectorDimension:
              | 128
              | 256
              | 512
              | 768
              | 1024
              | 1408
              | 1536
              | 2048
              | 3072
              | 4096;
          },
          {
            continueCursor: string;
            ids: Array<
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
            >;
            isDone: boolean;
          }
        >;
        updateBatch: FunctionReference<
          "mutation",
          "internal",
          {
            vectors: Array<{
              id:
                | string
                | string
                | string
                | string
                | string
                | string
                | string
                | string
                | string
                | string;
              model: string;
              vector: Array<number>;
            }>;
          },
          null
        >;
      };
    };
  };
  actionCache: {
    crons: {
      purge: FunctionReference<
        "mutation",
        "internal",
        { expiresAt?: number },
        null
      >;
    };
    lib: {
      get: FunctionReference<
        "query",
        "internal",
        { args: any; name: string; ttl: number | null },
        { kind: "hit"; value: any } | { expiredEntry?: string; kind: "miss" }
      >;
      put: FunctionReference<
        "mutation",
        "internal",
        {
          args: any;
          expiredEntry?: string;
          name: string;
          ttl: number | null;
          value: any;
        },
        { cacheHit: boolean; deletedExpiredEntry: boolean }
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { args: any; name: string },
        null
      >;
      removeAll: FunctionReference<
        "mutation",
        "internal",
        { batchSize?: number; before?: number; name?: string },
        null
      >;
    };
  };
  rateLimiter: {
    lib: {
      checkRateLimit: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
      getValue: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          key?: string;
          name: string;
          sampleShards?: number;
        },
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          shard: number;
          ts: number;
          value: number;
        }
      >;
      rateLimit: FunctionReference<
        "mutation",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      resetRateLimit: FunctionReference<
        "mutation",
        "internal",
        { key?: string; name: string },
        null
      >;
    };
    time: {
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
    };
  };
  rag: {
    chunks: {
      insert: FunctionReference<
        "mutation",
        "internal",
        {
          chunks: Array<{
            content: { metadata?: Record<string, any>; text: string };
            embedding: Array<number>;
            searchableText?: string;
          }>;
          entryId: string;
          startOrder: number;
        },
        { status: "pending" | "ready" | "replaced" }
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          entryId: string;
          order: "desc" | "asc";
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            metadata?: Record<string, any>;
            order: number;
            state: "pending" | "ready" | "replaced";
            text: string;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      replaceChunksPage: FunctionReference<
        "mutation",
        "internal",
        { entryId: string; startOrder: number },
        { nextStartOrder: number; status: "pending" | "ready" | "replaced" }
      >;
    };
    entries: {
      add: FunctionReference<
        "mutation",
        "internal",
        {
          allChunks?: Array<{
            content: { metadata?: Record<string, any>; text: string };
            embedding: Array<number>;
            searchableText?: string;
          }>;
          entry: {
            contentHash?: string;
            filterValues: Array<{ name: string; value: any }>;
            importance: number;
            key?: string;
            metadata?: Record<string, any>;
            namespaceId: string;
            title?: string;
          };
          onComplete?: string;
        },
        {
          created: boolean;
          entryId: string;
          status: "pending" | "ready" | "replaced";
        }
      >;
      addAsync: FunctionReference<
        "mutation",
        "internal",
        {
          chunker: string;
          entry: {
            contentHash?: string;
            filterValues: Array<{ name: string; value: any }>;
            importance: number;
            key?: string;
            metadata?: Record<string, any>;
            namespaceId: string;
            title?: string;
          };
          onComplete?: string;
        },
        { created: boolean; entryId: string; status: "pending" | "ready" }
      >;
      deleteAsync: FunctionReference<
        "mutation",
        "internal",
        { entryId: string; startOrder: number },
        null
      >;
      deleteByKeyAsync: FunctionReference<
        "mutation",
        "internal",
        { beforeVersion?: number; key: string; namespaceId: string },
        null
      >;
      deleteByKeySync: FunctionReference<
        "action",
        "internal",
        { key: string; namespaceId: string },
        null
      >;
      deleteSync: FunctionReference<
        "action",
        "internal",
        { entryId: string },
        null
      >;
      findByContentHash: FunctionReference<
        "query",
        "internal",
        {
          contentHash: string;
          dimension: number;
          filterNames: Array<string>;
          key: string;
          modelId: string;
          namespace: string;
        },
        {
          contentHash?: string;
          entryId: string;
          filterValues: Array<{ name: string; value: any }>;
          importance: number;
          key?: string;
          metadata?: Record<string, any>;
          replacedAt?: number;
          status: "pending" | "ready" | "replaced";
          title?: string;
        } | null
      >;
      get: FunctionReference<
        "query",
        "internal",
        { entryId: string },
        {
          contentHash?: string;
          entryId: string;
          filterValues: Array<{ name: string; value: any }>;
          importance: number;
          key?: string;
          metadata?: Record<string, any>;
          replacedAt?: number;
          status: "pending" | "ready" | "replaced";
          title?: string;
        } | null
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          namespaceId?: string;
          order?: "desc" | "asc";
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          status: "pending" | "ready" | "replaced";
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            contentHash?: string;
            entryId: string;
            filterValues: Array<{ name: string; value: any }>;
            importance: number;
            key?: string;
            metadata?: Record<string, any>;
            replacedAt?: number;
            status: "pending" | "ready" | "replaced";
            title?: string;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      promoteToReady: FunctionReference<
        "mutation",
        "internal",
        { entryId: string },
        {
          replacedEntry: {
            contentHash?: string;
            entryId: string;
            filterValues: Array<{ name: string; value: any }>;
            importance: number;
            key?: string;
            metadata?: Record<string, any>;
            replacedAt?: number;
            status: "pending" | "ready" | "replaced";
            title?: string;
          } | null;
        }
      >;
    };
    namespaces: {
      deleteNamespace: FunctionReference<
        "mutation",
        "internal",
        { namespaceId: string },
        {
          deletedNamespace: null | {
            createdAt: number;
            dimension: number;
            filterNames: Array<string>;
            modelId: string;
            namespace: string;
            namespaceId: string;
            status: "pending" | "ready" | "replaced";
            version: number;
          };
        }
      >;
      deleteNamespaceSync: FunctionReference<
        "action",
        "internal",
        { namespaceId: string },
        null
      >;
      get: FunctionReference<
        "query",
        "internal",
        {
          dimension: number;
          filterNames: Array<string>;
          modelId: string;
          namespace: string;
        },
        null | {
          createdAt: number;
          dimension: number;
          filterNames: Array<string>;
          modelId: string;
          namespace: string;
          namespaceId: string;
          status: "pending" | "ready" | "replaced";
          version: number;
        }
      >;
      getOrCreate: FunctionReference<
        "mutation",
        "internal",
        {
          dimension: number;
          filterNames: Array<string>;
          modelId: string;
          namespace: string;
          onComplete?: string;
          status: "pending" | "ready";
        },
        { namespaceId: string; status: "pending" | "ready" }
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          status: "pending" | "ready" | "replaced";
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            createdAt: number;
            dimension: number;
            filterNames: Array<string>;
            modelId: string;
            namespace: string;
            namespaceId: string;
            status: "pending" | "ready" | "replaced";
            version: number;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      listNamespaceVersions: FunctionReference<
        "query",
        "internal",
        {
          namespace: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            createdAt: number;
            dimension: number;
            filterNames: Array<string>;
            modelId: string;
            namespace: string;
            namespaceId: string;
            status: "pending" | "ready" | "replaced";
            version: number;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      lookup: FunctionReference<
        "query",
        "internal",
        {
          dimension: number;
          filterNames: Array<string>;
          modelId: string;
          namespace: string;
        },
        null | string
      >;
      promoteToReady: FunctionReference<
        "mutation",
        "internal",
        { namespaceId: string },
        {
          replacedNamespace: null | {
            createdAt: number;
            dimension: number;
            filterNames: Array<string>;
            modelId: string;
            namespace: string;
            namespaceId: string;
            status: "pending" | "ready" | "replaced";
            version: number;
          };
        }
      >;
    };
    search: {
      search: FunctionReference<
        "action",
        "internal",
        {
          chunkContext?: { after: number; before: number };
          dimension?: number;
          embedding?: Array<number>;
          filters: Array<{ name: string; value: any }>;
          limit: number;
          modelId: string;
          namespace: string;
          searchType?: "vector" | "text" | "hybrid";
          textQuery?: string;
          textWeight?: number;
          vectorScoreThreshold?: number;
          vectorWeight?: number;
        },
        {
          entries: Array<{
            contentHash?: string;
            entryId: string;
            filterValues: Array<{ name: string; value: any }>;
            importance: number;
            key?: string;
            metadata?: Record<string, any>;
            replacedAt?: number;
            status: "pending" | "ready" | "replaced";
            title?: string;
          }>;
          results: Array<{
            content: Array<{ metadata?: Record<string, any>; text: string }>;
            entryId: string;
            order: number;
            score: number;
            startOrder: number;
          }>;
        }
      >;
    };
  };
  stagehand: {
    lib: {
      act: FunctionReference<
        "action",
        "internal",
        {
          action: string;
          browserbaseApiKey: string;
          browserbaseProjectId: string;
          modelApiKey: string;
          modelName?: string;
          options?: {
            timeout?: number;
            waitUntil?: "load" | "domcontentloaded" | "networkidle";
          };
          sessionId?: string;
          url?: string;
        },
        { actionDescription: string; message: string; success: boolean }
      >;
      agent: FunctionReference<
        "action",
        "internal",
        {
          browserbaseApiKey: string;
          browserbaseProjectId: string;
          instruction: string;
          modelApiKey: string;
          modelName?: string;
          options?: {
            cua?: boolean;
            maxSteps?: number;
            systemPrompt?: string;
            timeout?: number;
            waitUntil?: "load" | "domcontentloaded" | "networkidle";
          };
          sessionId?: string;
          url?: string;
        },
        {
          actions: Array<{
            action?: string;
            reasoning?: string;
            timeMs?: number;
            type: string;
          }>;
          completed: boolean;
          message: string;
          success: boolean;
        }
      >;
      endSession: FunctionReference<
        "action",
        "internal",
        {
          browserbaseApiKey: string;
          browserbaseProjectId: string;
          modelApiKey: string;
          sessionId: string;
        },
        { success: boolean }
      >;
      extract: FunctionReference<
        "action",
        "internal",
        {
          browserbaseApiKey: string;
          browserbaseProjectId: string;
          instruction: string;
          modelApiKey: string;
          modelName?: string;
          options?: {
            timeout?: number;
            waitUntil?: "load" | "domcontentloaded" | "networkidle";
          };
          schema: any;
          sessionId?: string;
          url?: string;
        },
        any
      >;
      observe: FunctionReference<
        "action",
        "internal",
        {
          browserbaseApiKey: string;
          browserbaseProjectId: string;
          instruction: string;
          modelApiKey: string;
          modelName?: string;
          options?: {
            timeout?: number;
            waitUntil?: "load" | "domcontentloaded" | "networkidle";
          };
          sessionId?: string;
          url?: string;
        },
        Array<{
          arguments?: Array<string>;
          description: string;
          method: string;
          selector: string;
        }>
      >;
      startSession: FunctionReference<
        "action",
        "internal",
        {
          browserbaseApiKey: string;
          browserbaseProjectId: string;
          browserbaseSessionId?: string;
          modelApiKey: string;
          modelName?: string;
          options?: {
            domSettleTimeoutMs?: number;
            selfHeal?: boolean;
            systemPrompt?: string;
            timeout?: number;
            waitUntil?: "load" | "domcontentloaded" | "networkidle";
          };
          url: string;
        },
        { browserbaseSessionId?: string; cdpUrl?: string; sessionId: string }
      >;
    };
  };
  workflow: {
    event: {
      create: FunctionReference<
        "mutation",
        "internal",
        { name: string; workflowId: string },
        string
      >;
      send: FunctionReference<
        "mutation",
        "internal",
        {
          eventId?: string;
          name?: string;
          result:
            | { kind: "success"; returnValue: any }
            | { error: string; kind: "failed" }
            | { kind: "canceled" };
          workflowId?: string;
          workpoolOptions?: {
            defaultRetryBehavior?: {
              base: number;
              initialBackoffMs: number;
              maxAttempts: number;
            };
            logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
            maxParallelism?: number;
            retryActionsByDefault?: boolean;
          };
        },
        string
      >;
    };
    journal: {
      load: FunctionReference<
        "query",
        "internal",
        { shortCircuit?: boolean; workflowId: string },
        {
          blocked?: boolean;
          journalEntries: Array<{
            _creationTime: number;
            _id: string;
            step:
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  functionType: "query" | "mutation" | "action";
                  handle: string;
                  inProgress: boolean;
                  kind?: "function";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workId?: string;
                }
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  handle: string;
                  inProgress: boolean;
                  kind: "workflow";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workflowId?: string;
                }
              | {
                  args: { eventId?: string };
                  argsSize: number;
                  completedAt?: number;
                  eventId?: string;
                  inProgress: boolean;
                  kind: "event";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                };
            stepNumber: number;
            workflowId: string;
          }>;
          logLevel: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
          ok: boolean;
          workflow: {
            _creationTime: number;
            _id: string;
            args: any;
            generationNumber: number;
            logLevel?: any;
            name?: string;
            onComplete?: { context?: any; fnHandle: string };
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt?: any;
            state?: any;
            workflowHandle: string;
          };
        }
      >;
      startSteps: FunctionReference<
        "mutation",
        "internal",
        {
          generationNumber: number;
          steps: Array<{
            retry?:
              | boolean
              | { base: number; initialBackoffMs: number; maxAttempts: number };
            schedulerOptions?: { runAt?: number } | { runAfter?: number };
            step:
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  functionType: "query" | "mutation" | "action";
                  handle: string;
                  inProgress: boolean;
                  kind?: "function";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workId?: string;
                }
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  handle: string;
                  inProgress: boolean;
                  kind: "workflow";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workflowId?: string;
                }
              | {
                  args: { eventId?: string };
                  argsSize: number;
                  completedAt?: number;
                  eventId?: string;
                  inProgress: boolean;
                  kind: "event";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                };
          }>;
          workflowId: string;
          workpoolOptions?: {
            defaultRetryBehavior?: {
              base: number;
              initialBackoffMs: number;
              maxAttempts: number;
            };
            logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
            maxParallelism?: number;
            retryActionsByDefault?: boolean;
          };
        },
        Array<{
          _creationTime: number;
          _id: string;
          step:
            | {
                args: any;
                argsSize: number;
                completedAt?: number;
                functionType: "query" | "mutation" | "action";
                handle: string;
                inProgress: boolean;
                kind?: "function";
                name: string;
                runResult?:
                  | { kind: "success"; returnValue: any }
                  | { error: string; kind: "failed" }
                  | { kind: "canceled" };
                startedAt: number;
                workId?: string;
              }
            | {
                args: any;
                argsSize: number;
                completedAt?: number;
                handle: string;
                inProgress: boolean;
                kind: "workflow";
                name: string;
                runResult?:
                  | { kind: "success"; returnValue: any }
                  | { error: string; kind: "failed" }
                  | { kind: "canceled" };
                startedAt: number;
                workflowId?: string;
              }
            | {
                args: { eventId?: string };
                argsSize: number;
                completedAt?: number;
                eventId?: string;
                inProgress: boolean;
                kind: "event";
                name: string;
                runResult?:
                  | { kind: "success"; returnValue: any }
                  | { error: string; kind: "failed" }
                  | { kind: "canceled" };
                startedAt: number;
              };
          stepNumber: number;
          workflowId: string;
        }>
      >;
    };
    workflow: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        { workflowId: string },
        null
      >;
      cleanup: FunctionReference<
        "mutation",
        "internal",
        { force?: boolean; workflowId: string },
        boolean
      >;
      complete: FunctionReference<
        "mutation",
        "internal",
        {
          generationNumber: number;
          runResult:
            | { kind: "success"; returnValue: any }
            | { error: string; kind: "failed" }
            | { kind: "canceled" };
          workflowId: string;
        },
        null
      >;
      create: FunctionReference<
        "mutation",
        "internal",
        {
          maxParallelism?: number;
          onComplete?: { context?: any; fnHandle: string };
          startAsync?: boolean;
          workflowArgs: any;
          workflowHandle: string;
          workflowName: string;
        },
        string
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { workflowId: string },
        {
          inProgress: Array<{
            _creationTime: number;
            _id: string;
            step:
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  functionType: "query" | "mutation" | "action";
                  handle: string;
                  inProgress: boolean;
                  kind?: "function";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workId?: string;
                }
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  handle: string;
                  inProgress: boolean;
                  kind: "workflow";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workflowId?: string;
                }
              | {
                  args: { eventId?: string };
                  argsSize: number;
                  completedAt?: number;
                  eventId?: string;
                  inProgress: boolean;
                  kind: "event";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                };
            stepNumber: number;
            workflowId: string;
          }>;
          logLevel: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
          workflow: {
            _creationTime: number;
            _id: string;
            args: any;
            generationNumber: number;
            logLevel?: any;
            name?: string;
            onComplete?: { context?: any; fnHandle: string };
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt?: any;
            state?: any;
            workflowHandle: string;
          };
        }
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          order: "asc" | "desc";
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            args: any;
            context?: any;
            name?: string;
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            workflowId: string;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      listByName: FunctionReference<
        "query",
        "internal",
        {
          name: string;
          order: "asc" | "desc";
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            args: any;
            context?: any;
            name?: string;
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            workflowId: string;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      listSteps: FunctionReference<
        "query",
        "internal",
        {
          order: "asc" | "desc";
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          workflowId: string;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            args: any;
            completedAt?: number;
            eventId?: string;
            kind: "function" | "workflow" | "event";
            name: string;
            nestedWorkflowId?: string;
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt: number;
            stepId: string;
            stepNumber: number;
            workId?: string;
            workflowId: string;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      restart: FunctionReference<
        "mutation",
        "internal",
        { from?: number | string; startAsync?: boolean; workflowId: string },
        null
      >;
    };
  };
  workpool: {
    config: {
      update: FunctionReference<
        "mutation",
        "internal",
        {
          logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
          maxParallelism?: number;
        },
        any
      >;
    };
    lib: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        {
          id: string;
          logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
        },
        any
      >;
      cancelAll: FunctionReference<
        "mutation",
        "internal",
        {
          before?: number;
          limit?: number;
          logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
        },
        any
      >;
      enqueue: FunctionReference<
        "mutation",
        "internal",
        {
          config: {
            logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
            maxParallelism?: number;
          };
          fnArgs: any;
          fnHandle: string;
          fnName: string;
          fnType: "action" | "mutation" | "query";
          onComplete?: { context?: any; fnHandle: string };
          retryBehavior?: {
            base: number;
            initialBackoffMs: number;
            maxAttempts: number;
          };
          runAt: number;
        },
        string
      >;
      enqueueBatch: FunctionReference<
        "mutation",
        "internal",
        {
          config: {
            logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
            maxParallelism?: number;
          };
          items: Array<{
            fnArgs: any;
            fnHandle: string;
            fnName: string;
            fnType: "action" | "mutation" | "query";
            onComplete?: { context?: any; fnHandle: string };
            retryBehavior?: {
              base: number;
              initialBackoffMs: number;
              maxAttempts: number;
            };
            runAt: number;
          }>;
        },
        Array<string>
      >;
      status: FunctionReference<
        "query",
        "internal",
        { id: string },
        | { previousAttempts: number; state: "pending" }
        | { previousAttempts: number; state: "running" }
        | { state: "finished" }
      >;
      statusBatch: FunctionReference<
        "query",
        "internal",
        { ids: Array<string> },
        Array<
          | { previousAttempts: number; state: "pending" }
          | { previousAttempts: number; state: "running" }
          | { state: "finished" }
        >
      >;
    };
  };
  tenants: {
    invitations: {
      acceptInvitation: FunctionReference<
        "mutation",
        "internal",
        {
          acceptingUserId: string;
          acceptingUserIdentifier?: string;
          invitationId: string;
        },
        null
      >;
      bulkInviteMembers: FunctionReference<
        "mutation",
        "internal",
        {
          expiresAt?: number;
          invitations: Array<{
            identifierType?: string;
            inviteeIdentifier: string;
            message?: string;
            role: string;
            teamId?: string;
          }>;
          inviterName?: string;
          organizationId: string;
          userId: string;
        },
        {
          errors: Array<{
            code: string;
            inviteeIdentifier: string;
            message: string;
          }>;
          success: Array<{
            expiresAt: number;
            invitationId: string;
            inviteeIdentifier: string;
          }>;
        }
      >;
      cancelInvitation: FunctionReference<
        "mutation",
        "internal",
        { invitationId: string; userId: string },
        null
      >;
      countInvitations: FunctionReference<
        "query",
        "internal",
        { organizationId: string },
        number
      >;
      getInvitation: FunctionReference<
        "query",
        "internal",
        { invitationId: string },
        null | {
          _creationTime: number;
          _id: string;
          expiresAt: number;
          identifierType?: string;
          inviteeIdentifier: string;
          inviterId: string;
          inviterName?: string;
          isExpired: boolean;
          message?: string;
          organizationId: string;
          organizationName: string;
          role: string;
          status: "pending" | "accepted" | "cancelled" | "expired";
          teamId: null | string;
        }
      >;
      getPendingInvitationsForIdentifier: FunctionReference<
        "query",
        "internal",
        { identifier: string },
        Array<{
          _creationTime: number;
          _id: string;
          expiresAt: number;
          identifierType?: string;
          inviteeIdentifier: string;
          inviterId: string;
          inviterName?: string;
          isExpired: boolean;
          organizationId: string;
          organizationName: string;
          role: string;
          teamId: null | string;
        }>
      >;
      inviteMember: FunctionReference<
        "mutation",
        "internal",
        {
          expiresAt?: number;
          identifierType?: string;
          inviteeIdentifier: string;
          inviterName?: string;
          message?: string;
          organizationId: string;
          role: string;
          teamId?: string;
          userId: string;
        },
        { expiresAt: number; invitationId: string; inviteeIdentifier: string }
      >;
      listInvitations: FunctionReference<
        "query",
        "internal",
        {
          organizationId: string;
          sortBy?: "inviteeIdentifier" | "expiresAt" | "createdAt";
          sortOrder?: "asc" | "desc";
        },
        Array<{
          _creationTime: number;
          _id: string;
          expiresAt: number;
          identifierType?: string;
          inviteeIdentifier: string;
          inviterId: string;
          inviterName?: string;
          isExpired: boolean;
          message?: string;
          organizationId: string;
          role: string;
          status: "pending" | "accepted" | "cancelled" | "expired";
          teamId: null | string;
        }>
      >;
      listInvitationsPaginated: FunctionReference<
        "query",
        "internal",
        {
          organizationId: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      resendInvitation: FunctionReference<
        "mutation",
        "internal",
        { invitationId: string; userId: string },
        { invitationId: string; inviteeIdentifier: string }
      >;
    };
    members: {
      addMember: FunctionReference<
        "mutation",
        "internal",
        {
          memberUserId: string;
          organizationId: string;
          role: string;
          userId: string;
        },
        null
      >;
      bulkAddMembers: FunctionReference<
        "mutation",
        "internal",
        {
          members: Array<{ memberUserId: string; role: string }>;
          organizationId: string;
          userId: string;
        },
        {
          errors: Array<{ code: string; message: string; userId: string }>;
          success: Array<string>;
        }
      >;
      bulkRemoveMembers: FunctionReference<
        "mutation",
        "internal",
        {
          memberUserIds: Array<string>;
          organizationId: string;
          userId: string;
        },
        {
          errors: Array<{ code: string; message: string; userId: string }>;
          success: Array<string>;
        }
      >;
      checkMemberPermission: FunctionReference<
        "query",
        "internal",
        {
          minRole: "member" | "admin" | "owner";
          organizationId: string;
          userId: string;
        },
        {
          currentRole: null | "owner" | "admin" | "member";
          hasPermission: boolean;
        }
      >;
      countOrganizationMembers: FunctionReference<
        "query",
        "internal",
        { organizationId: string; status?: "active" | "suspended" | "all" },
        number
      >;
      getMember: FunctionReference<
        "query",
        "internal",
        { organizationId: string; userId: string },
        null | {
          _creationTime: number;
          _id: string;
          joinedAt?: number;
          organizationId: string;
          role: string;
          status?: "active" | "suspended";
          suspendedAt?: number;
          userId: string;
        }
      >;
      leaveOrganization: FunctionReference<
        "mutation",
        "internal",
        { organizationId: string; userId: string },
        null
      >;
      listOrganizationMembers: FunctionReference<
        "query",
        "internal",
        {
          organizationId: string;
          sortBy?: "role" | "joinedAt" | "createdAt" | "userId";
          sortOrder?: "asc" | "desc";
          status?: "active" | "suspended" | "all";
        },
        Array<{
          _creationTime: number;
          _id: string;
          joinedAt?: number;
          organizationId: string;
          role: string;
          status?: "active" | "suspended";
          suspendedAt?: number;
          userId: string;
        }>
      >;
      listOrganizationMembersPaginated: FunctionReference<
        "query",
        "internal",
        {
          organizationId: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          status?: "active" | "suspended" | "all";
        },
        any
      >;
      removeMember: FunctionReference<
        "mutation",
        "internal",
        { memberUserId: string; organizationId: string; userId: string },
        null
      >;
      suspendMember: FunctionReference<
        "mutation",
        "internal",
        { memberUserId: string; organizationId: string; userId: string },
        null
      >;
      unsuspendMember: FunctionReference<
        "mutation",
        "internal",
        { memberUserId: string; organizationId: string; userId: string },
        null
      >;
      updateMemberRole: FunctionReference<
        "mutation",
        "internal",
        {
          memberUserId: string;
          organizationId: string;
          role: string;
          userId: string;
        },
        null
      >;
    };
    organizations: {
      createOrganization: FunctionReference<
        "mutation",
        "internal",
        {
          creatorRole?: string;
          logo?: string;
          metadata?: any;
          name: string;
          settings?: {
            allowPublicSignup?: boolean;
            requireInvitationToJoin?: boolean;
          };
          slug: string;
          userId: string;
        },
        string
      >;
      deleteOrganization: FunctionReference<
        "mutation",
        "internal",
        { organizationId: string; userId: string },
        null
      >;
      getOrganization: FunctionReference<
        "query",
        "internal",
        { organizationId: string },
        null | {
          _creationTime: number;
          _id: string;
          logo: null | string;
          metadata?: any;
          name: string;
          ownerId: string;
          settings?: {
            allowPublicSignup?: boolean;
            requireInvitationToJoin?: boolean;
          };
          slug: string;
          status?: "active" | "suspended" | "archived";
        }
      >;
      getOrganizationBySlug: FunctionReference<
        "query",
        "internal",
        { slug: string },
        null | {
          _creationTime: number;
          _id: string;
          logo: null | string;
          metadata?: any;
          name: string;
          ownerId: string;
          settings?: {
            allowPublicSignup?: boolean;
            requireInvitationToJoin?: boolean;
          };
          slug: string;
          status?: "active" | "suspended" | "archived";
        }
      >;
      listUserOrganizations: FunctionReference<
        "query",
        "internal",
        {
          sortBy?: "name" | "createdAt" | "slug";
          sortOrder?: "asc" | "desc";
          userId: string;
        },
        Array<{
          _creationTime: number;
          _id: string;
          logo: null | string;
          metadata?: any;
          name: string;
          ownerId: string;
          role: string;
          settings?: {
            allowPublicSignup?: boolean;
            requireInvitationToJoin?: boolean;
          };
          slug: string;
          status?: "active" | "suspended" | "archived";
        }>
      >;
      transferOwnership: FunctionReference<
        "mutation",
        "internal",
        {
          newOwnerUserId: string;
          organizationId: string;
          previousOwnerRole?: string;
          userId: string;
        },
        null
      >;
      updateOrganization: FunctionReference<
        "mutation",
        "internal",
        {
          logo?: null | string;
          metadata?: any;
          name?: string;
          organizationId: string;
          settings?: {
            allowPublicSignup?: boolean;
            requireInvitationToJoin?: boolean;
          };
          slug?: string;
          status?: "active" | "suspended" | "archived";
          userId: string;
        },
        null
      >;
    };
    teams: {
      addTeamMember: FunctionReference<
        "mutation",
        "internal",
        { memberUserId: string; role?: string; teamId: string; userId: string },
        null
      >;
      countTeams: FunctionReference<
        "query",
        "internal",
        { organizationId: string },
        number
      >;
      createTeam: FunctionReference<
        "mutation",
        "internal",
        {
          description?: string;
          metadata?: any;
          name: string;
          organizationId: string;
          parentTeamId?: string;
          slug?: string;
          userId: string;
        },
        string
      >;
      deleteTeam: FunctionReference<
        "mutation",
        "internal",
        { teamId: string; userId: string },
        null
      >;
      getTeam: FunctionReference<
        "query",
        "internal",
        { teamId: string },
        null | {
          _creationTime: number;
          _id: string;
          description: null | string;
          metadata?: any;
          name: string;
          organizationId: string;
          parentTeamId?: string;
          slug?: string;
        }
      >;
      isTeamMember: FunctionReference<
        "query",
        "internal",
        { teamId: string; userId: string },
        boolean
      >;
      listTeamMembers: FunctionReference<
        "query",
        "internal",
        {
          sortBy?: "userId" | "role" | "createdAt";
          sortOrder?: "asc" | "desc";
          teamId: string;
        },
        Array<{
          _creationTime: number;
          _id: string;
          role?: string;
          teamId: string;
          userId: string;
        }>
      >;
      listTeamMembersPaginated: FunctionReference<
        "query",
        "internal",
        {
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          teamId: string;
        },
        any
      >;
      listTeams: FunctionReference<
        "query",
        "internal",
        {
          organizationId: string;
          parentTeamId?: null | string;
          sortBy?: "name" | "createdAt" | "slug";
          sortOrder?: "asc" | "desc";
        },
        Array<{
          _creationTime: number;
          _id: string;
          description: null | string;
          metadata?: any;
          name: string;
          organizationId: string;
          parentTeamId?: string;
          slug?: string;
        }>
      >;
      listTeamsAsTree: FunctionReference<
        "query",
        "internal",
        { organizationId: string },
        Array<{
          children: any;
          team: {
            _creationTime: number;
            _id: string;
            description: null | string;
            metadata?: any;
            name: string;
            organizationId: string;
            parentTeamId?: string;
            slug?: string;
          };
        }>
      >;
      listTeamsPaginated: FunctionReference<
        "query",
        "internal",
        {
          organizationId: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      removeTeamMember: FunctionReference<
        "mutation",
        "internal",
        { memberUserId: string; teamId: string; userId: string },
        null
      >;
      updateTeam: FunctionReference<
        "mutation",
        "internal",
        {
          description?: null | string;
          metadata?: any;
          name?: string;
          parentTeamId?: null | string;
          slug?: string;
          teamId: string;
          userId: string;
        },
        null
      >;
      updateTeamMemberRole: FunctionReference<
        "mutation",
        "internal",
        { memberUserId: string; role: string; teamId: string; userId: string },
        null
      >;
    };
  };
  authz: {
    indexed: {
      addRelationWithCompute: FunctionReference<
        "mutation",
        "internal",
        {
          createdBy?: string;
          inheritedRelations?: Array<{
            fromObjectType: string;
            fromRelation: string;
            relation: string;
          }>;
          objectId: string;
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
        },
        string
      >;
      assignRoleWithCompute: FunctionReference<
        "mutation",
        "internal",
        {
          assignedBy?: string;
          expiresAt?: number;
          role: string;
          rolePermissions: Array<string>;
          scope?: { id: string; type: string };
          userId: string;
        },
        string
      >;
      checkPermissionFast: FunctionReference<
        "query",
        "internal",
        {
          objectId?: string;
          objectType?: string;
          permission: string;
          userId: string;
        },
        boolean
      >;
      cleanupExpired: FunctionReference<
        "mutation",
        "internal",
        {},
        { expiredPermissions: number; expiredRoles: number }
      >;
      denyPermissionDirect: FunctionReference<
        "mutation",
        "internal",
        {
          deniedBy?: string;
          expiresAt?: number;
          permission: string;
          reason?: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        string
      >;
      getUserPermissionsFast: FunctionReference<
        "query",
        "internal",
        { scopeKey?: string; userId: string },
        Array<{
          effect: string;
          permission: string;
          scopeKey: string;
          sources: Array<string>;
        }>
      >;
      getUserRolesFast: FunctionReference<
        "query",
        "internal",
        { scopeKey?: string; userId: string },
        Array<{
          role: string;
          scope?: { id: string; type: string };
          scopeKey: string;
        }>
      >;
      grantPermissionDirect: FunctionReference<
        "mutation",
        "internal",
        {
          expiresAt?: number;
          grantedBy?: string;
          permission: string;
          reason?: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        string
      >;
      hasRelationFast: FunctionReference<
        "query",
        "internal",
        {
          objectId: string;
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
        },
        boolean
      >;
      hasRoleFast: FunctionReference<
        "query",
        "internal",
        {
          objectId?: string;
          objectType?: string;
          role: string;
          userId: string;
        },
        boolean
      >;
      removeRelationWithCompute: FunctionReference<
        "mutation",
        "internal",
        {
          objectId: string;
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
        },
        boolean
      >;
      revokeRoleWithCompute: FunctionReference<
        "mutation",
        "internal",
        {
          role: string;
          rolePermissions: Array<string>;
          scope?: { id: string; type: string };
          userId: string;
        },
        boolean
      >;
    };
    mutations: {
      assignRole: FunctionReference<
        "mutation",
        "internal",
        {
          assignedBy?: string;
          enableAudit?: boolean;
          expiresAt?: number;
          metadata?: any;
          role: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        string
      >;
      cleanupExpired: FunctionReference<
        "mutation",
        "internal",
        {},
        { expiredOverrides: number; expiredRoles: number }
      >;
      denyPermission: FunctionReference<
        "mutation",
        "internal",
        {
          createdBy?: string;
          enableAudit?: boolean;
          expiresAt?: number;
          permission: string;
          reason?: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        string
      >;
      grantPermission: FunctionReference<
        "mutation",
        "internal",
        {
          createdBy?: string;
          enableAudit?: boolean;
          expiresAt?: number;
          permission: string;
          reason?: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        string
      >;
      logPermissionCheck: FunctionReference<
        "mutation",
        "internal",
        {
          permission: string;
          reason?: string;
          result: boolean;
          scope?: { id: string; type: string };
          userId: string;
        },
        null
      >;
      removeAllAttributes: FunctionReference<
        "mutation",
        "internal",
        { enableAudit?: boolean; removedBy?: string; userId: string },
        number
      >;
      removeAttribute: FunctionReference<
        "mutation",
        "internal",
        {
          enableAudit?: boolean;
          key: string;
          removedBy?: string;
          userId: string;
        },
        boolean
      >;
      removePermissionOverride: FunctionReference<
        "mutation",
        "internal",
        {
          enableAudit?: boolean;
          permission: string;
          removedBy?: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        boolean
      >;
      revokeAllRoles: FunctionReference<
        "mutation",
        "internal",
        {
          enableAudit?: boolean;
          revokedBy?: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        number
      >;
      revokeRole: FunctionReference<
        "mutation",
        "internal",
        {
          enableAudit?: boolean;
          revokedBy?: string;
          role: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        boolean
      >;
      setAttribute: FunctionReference<
        "mutation",
        "internal",
        {
          enableAudit?: boolean;
          key: string;
          setBy?: string;
          userId: string;
          value: any;
        },
        string
      >;
    };
    queries: {
      checkPermission: FunctionReference<
        "query",
        "internal",
        {
          permission: string;
          rolePermissions: Record<string, Array<string>>;
          scope?: { id: string; type: string };
          userId: string;
        },
        {
          allowed: boolean;
          matchedOverride?: string;
          matchedRole?: string;
          reason: string;
        }
      >;
      getAuditLog: FunctionReference<
        "query",
        "internal",
        {
          action?:
            | "permission_check"
            | "role_assigned"
            | "role_revoked"
            | "permission_granted"
            | "permission_denied"
            | "attribute_set"
            | "attribute_removed";
          limit?: number;
          userId?: string;
        },
        Array<{
          _id: string;
          action: string;
          actorId?: string;
          details: any;
          timestamp: number;
          userId: string;
        }>
      >;
      getEffectivePermissions: FunctionReference<
        "query",
        "internal",
        {
          rolePermissions: Record<string, Array<string>>;
          scope?: { id: string; type: string };
          userId: string;
        },
        {
          deniedPermissions: Array<string>;
          permissions: Array<string>;
          roles: Array<string>;
        }
      >;
      getPermissionOverrides: FunctionReference<
        "query",
        "internal",
        { permission?: string; userId: string },
        Array<{
          _id: string;
          effect: "allow" | "deny";
          expiresAt?: number;
          permission: string;
          reason?: string;
          scope?: { id: string; type: string };
        }>
      >;
      getUserAttribute: FunctionReference<
        "query",
        "internal",
        { key: string; userId: string },
        null | any
      >;
      getUserAttributes: FunctionReference<
        "query",
        "internal",
        { userId: string },
        Array<{ _id: string; key: string; value: any }>
      >;
      getUserRoles: FunctionReference<
        "query",
        "internal",
        { scope?: { id: string; type: string }; userId: string },
        Array<{
          _id: string;
          expiresAt?: number;
          metadata?: any;
          role: string;
          scope?: { id: string; type: string };
        }>
      >;
      getUsersWithRole: FunctionReference<
        "query",
        "internal",
        { role: string; scope?: { id: string; type: string } },
        Array<{ assignedAt: number; expiresAt?: number; userId: string }>
      >;
      hasRole: FunctionReference<
        "query",
        "internal",
        { role: string; scope?: { id: string; type: string }; userId: string },
        boolean
      >;
    };
    rebac: {
      addRelation: FunctionReference<
        "mutation",
        "internal",
        {
          createdBy?: string;
          objectId: string;
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
        },
        string
      >;
      checkRelationWithTraversal: FunctionReference<
        "query",
        "internal",
        {
          maxDepth?: number;
          objectId: string;
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
          traversalRules?: any;
        },
        { allowed: boolean; path: Array<string>; reason: string }
      >;
      getObjectRelations: FunctionReference<
        "query",
        "internal",
        { objectId: string; objectType: string; relation?: string },
        Array<{
          _id: string;
          relation: string;
          subjectId: string;
          subjectType: string;
        }>
      >;
      getSubjectRelations: FunctionReference<
        "query",
        "internal",
        { objectType?: string; subjectId: string; subjectType: string },
        Array<{
          _id: string;
          objectId: string;
          objectType: string;
          relation: string;
        }>
      >;
      hasDirectRelation: FunctionReference<
        "query",
        "internal",
        {
          objectId: string;
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
        },
        boolean
      >;
      listAccessibleObjects: FunctionReference<
        "query",
        "internal",
        {
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
          traversalRules?: any;
        },
        Array<{ objectId: string; via: string }>
      >;
      listUsersWithAccess: FunctionReference<
        "query",
        "internal",
        { objectId: string; objectType: string; relation: string },
        Array<{ userId: string; via: string }>
      >;
      removeRelation: FunctionReference<
        "mutation",
        "internal",
        {
          objectId: string;
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
        },
        boolean
      >;
    };
  };
  cascadingDelete: {
    lib: {
      createBatchJob: FunctionReference<
        "mutation",
        "internal",
        {
          batchSize: number;
          deleteHandleStr: string;
          targets: Array<{ id: string; table: string }>;
        },
        string
      >;
      getJobStatus: FunctionReference<
        "query",
        "internal",
        { jobId: string },
        {
          completedCount: number;
          completedSummary: string;
          error?: string;
          status: "pending" | "processing" | "completed" | "failed";
          totalTargetCount: number;
        } | null
      >;
      kickOffProcessing: FunctionReference<
        "mutation",
        "internal",
        { jobId: string },
        null
      >;
      reportBatchComplete: FunctionReference<
        "mutation",
        "internal",
        { batchSummary: string; errors?: string; jobId: string },
        null
      >;
    };
  };
  auditLog: {
    lib: {
      cleanup: FunctionReference<
        "mutation",
        "internal",
        {
          batchSize?: number;
          olderThanDays?: number;
          preserveSeverity?: Array<"info" | "warning" | "error" | "critical">;
          retentionCategory?: string;
        },
        number
      >;
      detectAnomalies: FunctionReference<
        "query",
        "internal",
        {
          patterns: Array<{
            action: string;
            threshold: number;
            windowMinutes: number;
          }>;
        },
        Array<{
          action: string;
          count: number;
          detectedAt: number;
          threshold: number;
          windowMinutes: number;
        }>
      >;
      generateReport: FunctionReference<
        "query",
        "internal",
        {
          endDate: number;
          format: "json" | "csv";
          groupBy?: string;
          includeFields?: Array<string>;
          maxRecords?: number;
          startDate: number;
        },
        {
          data: string;
          format: "json" | "csv";
          generatedAt: number;
          recordCount: number;
          truncated: boolean;
        }
      >;
      get: FunctionReference<
        "query",
        "internal",
        { id: string },
        null | {
          _creationTime: number;
          _id: string;
          action: string;
          actorId?: string;
          after?: any;
          before?: any;
          diff?: string;
          ipAddress?: string;
          metadata?: any;
          resourceId?: string;
          resourceType?: string;
          retentionCategory?: string;
          sessionId?: string;
          severity: "info" | "warning" | "error" | "critical";
          tags?: Array<string>;
          timestamp: number;
          userAgent?: string;
        }
      >;
      getConfig: FunctionReference<
        "query",
        "internal",
        {},
        null | {
          _creationTime: number;
          _id: string;
          criticalRetentionDays: number;
          customRetention?: Array<{ category: string; retentionDays: number }>;
          defaultRetentionDays: number;
          piiFieldsToRedact: Array<string>;
          samplingEnabled: boolean;
          samplingRate: number;
        }
      >;
      getStats: FunctionReference<
        "query",
        "internal",
        { fromTimestamp?: number; toTimestamp?: number },
        {
          bySeverity: {
            critical: number;
            error: number;
            info: number;
            warning: number;
          };
          topActions: Array<{ action: string; count: number }>;
          topActors: Array<{ actorId: string; count: number }>;
          totalCount: number;
        }
      >;
      log: FunctionReference<
        "mutation",
        "internal",
        {
          action: string;
          actorId?: string;
          ipAddress?: string;
          metadata?: any;
          resourceId?: string;
          resourceType?: string;
          retentionCategory?: string;
          sessionId?: string;
          severity: "info" | "warning" | "error" | "critical";
          tags?: Array<string>;
          userAgent?: string;
        },
        string
      >;
      logBulk: FunctionReference<
        "mutation",
        "internal",
        {
          events: Array<{
            action: string;
            actorId?: string;
            ipAddress?: string;
            metadata?: any;
            resourceId?: string;
            resourceType?: string;
            retentionCategory?: string;
            sessionId?: string;
            severity: "info" | "warning" | "error" | "critical";
            tags?: Array<string>;
            userAgent?: string;
          }>;
        },
        Array<string>
      >;
      logChange: FunctionReference<
        "mutation",
        "internal",
        {
          action: string;
          actorId?: string;
          after?: any;
          before?: any;
          generateDiff?: boolean;
          ipAddress?: string;
          resourceId: string;
          resourceType: string;
          retentionCategory?: string;
          sessionId?: string;
          severity?: "info" | "warning" | "error" | "critical";
          tags?: Array<string>;
          userAgent?: string;
        },
        string
      >;
      queryByAction: FunctionReference<
        "query",
        "internal",
        { action: string; fromTimestamp?: number; limit?: number },
        Array<{
          _creationTime: number;
          _id: string;
          action: string;
          actorId?: string;
          after?: any;
          before?: any;
          diff?: string;
          ipAddress?: string;
          metadata?: any;
          resourceId?: string;
          resourceType?: string;
          retentionCategory?: string;
          sessionId?: string;
          severity: "info" | "warning" | "error" | "critical";
          tags?: Array<string>;
          timestamp: number;
          userAgent?: string;
        }>
      >;
      queryByActor: FunctionReference<
        "query",
        "internal",
        {
          actions?: Array<string>;
          actorId: string;
          fromTimestamp?: number;
          limit?: number;
        },
        Array<{
          _creationTime: number;
          _id: string;
          action: string;
          actorId?: string;
          after?: any;
          before?: any;
          diff?: string;
          ipAddress?: string;
          metadata?: any;
          resourceId?: string;
          resourceType?: string;
          retentionCategory?: string;
          sessionId?: string;
          severity: "info" | "warning" | "error" | "critical";
          tags?: Array<string>;
          timestamp: number;
          userAgent?: string;
        }>
      >;
      queryByResource: FunctionReference<
        "query",
        "internal",
        {
          fromTimestamp?: number;
          limit?: number;
          resourceId: string;
          resourceType: string;
        },
        Array<{
          _creationTime: number;
          _id: string;
          action: string;
          actorId?: string;
          after?: any;
          before?: any;
          diff?: string;
          ipAddress?: string;
          metadata?: any;
          resourceId?: string;
          resourceType?: string;
          retentionCategory?: string;
          sessionId?: string;
          severity: "info" | "warning" | "error" | "critical";
          tags?: Array<string>;
          timestamp: number;
          userAgent?: string;
        }>
      >;
      queryBySeverity: FunctionReference<
        "query",
        "internal",
        {
          fromTimestamp?: number;
          limit?: number;
          severity: Array<"info" | "warning" | "error" | "critical">;
        },
        Array<{
          _creationTime: number;
          _id: string;
          action: string;
          actorId?: string;
          after?: any;
          before?: any;
          diff?: string;
          ipAddress?: string;
          metadata?: any;
          resourceId?: string;
          resourceType?: string;
          retentionCategory?: string;
          sessionId?: string;
          severity: "info" | "warning" | "error" | "critical";
          tags?: Array<string>;
          timestamp: number;
          userAgent?: string;
        }>
      >;
      runBackfill: FunctionReference<
        "mutation",
        "internal",
        { batchSize?: number; cursor?: string },
        { cursor: string | null; isDone: boolean; processed: number }
      >;
      search: FunctionReference<
        "query",
        "internal",
        {
          filters: {
            actions?: Array<string>;
            actorIds?: Array<string>;
            fromTimestamp?: number;
            resourceTypes?: Array<string>;
            severity?: Array<"info" | "warning" | "error" | "critical">;
            tags?: Array<string>;
            toTimestamp?: number;
          };
          pagination: { cursor?: string; limit: number };
        },
        {
          cursor: string | null;
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: string;
            action: string;
            actorId?: string;
            after?: any;
            before?: any;
            diff?: string;
            ipAddress?: string;
            metadata?: any;
            resourceId?: string;
            resourceType?: string;
            retentionCategory?: string;
            sessionId?: string;
            severity: "info" | "warning" | "error" | "critical";
            tags?: Array<string>;
            timestamp: number;
            userAgent?: string;
          }>;
        }
      >;
      updateConfig: FunctionReference<
        "mutation",
        "internal",
        {
          criticalRetentionDays?: number;
          customRetention?: Array<{ category: string; retentionDays: number }>;
          defaultRetentionDays?: number;
          piiFieldsToRedact?: Array<string>;
          samplingEnabled?: boolean;
          samplingRate?: number;
        },
        string
      >;
      watchCritical: FunctionReference<
        "query",
        "internal",
        {
          limit?: number;
          severity?: Array<"info" | "warning" | "error" | "critical">;
        },
        Array<{
          _creationTime: number;
          _id: string;
          action: string;
          actorId?: string;
          after?: any;
          before?: any;
          diff?: string;
          ipAddress?: string;
          metadata?: any;
          resourceId?: string;
          resourceType?: string;
          retentionCategory?: string;
          sessionId?: string;
          severity: "info" | "warning" | "error" | "critical";
          tags?: Array<string>;
          timestamp: number;
          userAgent?: string;
        }>
      >;
    };
  };
  uploadthingFileTracker: {
    callbacks: {
      handleUploadthingCallback: FunctionReference<
        "action",
        "internal",
        { apiKey?: string; hook: string; rawBody: string; signature: string },
        | { fileId: string; hook: string; ok: true }
        | { error: string; ok: false }
      >;
    };
    cleanup: {
      cleanupExpired: FunctionReference<
        "action",
        "internal",
        { apiKey?: string; batchSize?: number; dryRun?: boolean },
        {
          deletedCount: number;
          hasMore: boolean;
          keys: Array<string>;
          remoteDeleteError?: string;
          remoteDeleteFailed?: boolean;
          remoteDeletedCount?: number;
        }
      >;
    };
    config: {
      getConfig: FunctionReference<
        "query",
        "internal",
        {},
        {
          defaultTtlMs?: number;
          deleteBatchSize?: number;
          deleteRemoteOnExpire?: boolean;
          hasApiKey: boolean;
          ttlByFileType?: Record<string, number>;
          ttlByMimeType?: Record<string, number>;
        }
      >;
      setConfig: FunctionReference<
        "mutation",
        "internal",
        {
          config: {
            defaultTtlMs?: number;
            deleteBatchSize?: number;
            deleteRemoteOnExpire?: boolean;
            ttlByFileType?: Record<string, number>;
            ttlByMimeType?: Record<string, number>;
            uploadthingApiKey?: string;
          };
          replace?: boolean;
        },
        { created: boolean }
      >;
    };
    files: {
      deleteFiles: FunctionReference<
        "mutation",
        "internal",
        { keys: Array<string> },
        number
      >;
      setFileAccess: FunctionReference<
        "mutation",
        "internal",
        {
          access?: {
            allowUserIds?: Array<string>;
            denyUserIds?: Array<string>;
            visibility: "public" | "private" | "restricted";
          } | null;
          key: string;
        },
        string | null
      >;
      setFolderAccess: FunctionReference<
        "mutation",
        "internal",
        {
          access?: {
            allowUserIds?: Array<string>;
            denyUserIds?: Array<string>;
            visibility: "public" | "private" | "restricted";
          } | null;
          folder: string;
        },
        string | null
      >;
      upsertFile: FunctionReference<
        "mutation",
        "internal",
        {
          file: {
            customId?: string;
            fileType?: string;
            key: string;
            mimeType: string;
            name: string;
            size: number;
            uploadedAt?: number;
            url: string;
          };
          options?: {
            access?: {
              allowUserIds?: Array<string>;
              denyUserIds?: Array<string>;
              visibility: "public" | "private" | "restricted";
            };
            expiresAt?: number;
            fileType?: string;
            folder?: string;
            metadata?: any;
            tags?: Array<string>;
            ttlMs?: number;
          };
          userId: string;
        },
        string
      >;
    };
    queries: {
      getFileByKey: FunctionReference<
        "query",
        "internal",
        { key: string; viewerUserId?: string },
        {
          _creationTime: number;
          _id: string;
          access?: {
            allowUserIds?: Array<string>;
            denyUserIds?: Array<string>;
            visibility: "public" | "private" | "restricted";
          };
          customId?: string;
          expiresAt?: number;
          fileType?: string;
          folder?: string;
          key: string;
          metadata?: any;
          mimeType: string;
          name: string;
          replacedAt?: number;
          size: number;
          tags?: Array<string>;
          uploadedAt: number;
          url: string;
          userId: string;
        } | null
      >;
      getFolderRuleByFolder: FunctionReference<
        "query",
        "internal",
        { folder: string },
        {
          _creationTime: number;
          _id: string;
          access: {
            allowUserIds?: Array<string>;
            denyUserIds?: Array<string>;
            visibility: "public" | "private" | "restricted";
          };
          folder: string;
          updatedAt: number;
        } | null
      >;
      listAllFiles: FunctionReference<
        "query",
        "internal",
        {
          folder?: string;
          includeExpired?: boolean;
          limit?: number;
          mimeType?: string;
          tag?: string;
          viewerUserId?: string;
        },
        Array<{
          _creationTime: number;
          _id: string;
          access?: {
            allowUserIds?: Array<string>;
            denyUserIds?: Array<string>;
            visibility: "public" | "private" | "restricted";
          };
          customId?: string;
          expiresAt?: number;
          fileType?: string;
          folder?: string;
          key: string;
          metadata?: any;
          mimeType: string;
          name: string;
          replacedAt?: number;
          size: number;
          tags?: Array<string>;
          uploadedAt: number;
          url: string;
          userId: string;
        }>
      >;
      listFiles: FunctionReference<
        "query",
        "internal",
        {
          folder?: string;
          includeExpired?: boolean;
          limit?: number;
          mimeType?: string;
          ownerUserId: string;
          tag?: string;
          viewerUserId?: string;
        },
        Array<{
          _creationTime: number;
          _id: string;
          access?: {
            allowUserIds?: Array<string>;
            denyUserIds?: Array<string>;
            visibility: "public" | "private" | "restricted";
          };
          customId?: string;
          expiresAt?: number;
          fileType?: string;
          folder?: string;
          key: string;
          metadata?: any;
          mimeType: string;
          name: string;
          replacedAt?: number;
          size: number;
          tags?: Array<string>;
          uploadedAt: number;
          url: string;
          userId: string;
        }>
      >;
      listFolderRules: FunctionReference<
        "query",
        "internal",
        { limit?: number },
        Array<{
          _creationTime: number;
          _id: string;
          access: {
            allowUserIds?: Array<string>;
            denyUserIds?: Array<string>;
            visibility: "public" | "private" | "restricted";
          };
          folder: string;
          updatedAt: number;
        }>
      >;
    };
    stats: {
      getUsageStats: FunctionReference<
        "query",
        "internal",
        { userId: string },
        { totalBytes: number; totalFiles: number }
      >;
    };
  };
  batchProcessor: {
    lib: {
      addItems: FunctionReference<
        "mutation",
        "internal",
        {
          batchId: string;
          config: {
            flushIntervalMs: number;
            immediateFlushThreshold?: number;
            maxBatchSize?: number;
            processBatchHandle: string;
            retry?: {
              initialDelayMs?: number;
              maxAttempts?: number;
              maxDelayMs?: number;
              multiplier?: number;
            };
          };
          items: Array<any>;
        },
        any
      >;
      cancelIteratorJob: FunctionReference<
        "mutation",
        "internal",
        { jobId: string },
        any
      >;
      deleteBatch: FunctionReference<
        "mutation",
        "internal",
        { batchId: string },
        any
      >;
      deleteIteratorJob: FunctionReference<
        "mutation",
        "internal",
        { jobId: string },
        any
      >;
      flushBatch: FunctionReference<
        "mutation",
        "internal",
        { batchId: string },
        any
      >;
      getAllBatchesForBaseId: FunctionReference<
        "query",
        "internal",
        { baseBatchId: string },
        any
      >;
      getBatchStatus: FunctionReference<
        "query",
        "internal",
        { batchId: string },
        any
      >;
      getFlushHistory: FunctionReference<
        "query",
        "internal",
        { batchId: string; limit?: number },
        any
      >;
      getIteratorJobStatus: FunctionReference<
        "query",
        "internal",
        { jobId: string },
        any
      >;
      listIteratorJobs: FunctionReference<
        "query",
        "internal",
        {
          limit?: number;
          status?: "pending" | "running" | "paused" | "completed" | "failed";
        },
        any
      >;
      pauseIteratorJob: FunctionReference<
        "mutation",
        "internal",
        { jobId: string },
        any
      >;
      resumeIteratorJob: FunctionReference<
        "mutation",
        "internal",
        { jobId: string },
        any
      >;
      startIteratorJob: FunctionReference<
        "mutation",
        "internal",
        {
          config: {
            batchSize: number;
            delayBetweenBatchesMs?: number;
            getNextBatchHandle: string;
            maxRetries?: number;
            onCompleteHandle?: string;
            processBatchHandle: string;
          };
          jobId: string;
        },
        any
      >;
    };
  };
  llmCache: {
    cache: {
      get: FunctionReference<
        "query",
        "internal",
        { cacheKey: string },
        {
          _creationTime: number;
          _id: string;
          cacheKey: string;
          createdAt: number;
          expiresAt?: number;
          hitCount: number;
          lastAccessedAt: number;
          metadata?: any;
          model: string;
          modelVersion?: string;
          request: any;
          response: any;
          tags?: Array<string>;
          ttlTier: number;
        } | null
      >;
      incrementHitCount: FunctionReference<
        "mutation",
        "internal",
        { cacheKey: string },
        null
      >;
      lookup: FunctionReference<
        "query",
        "internal",
        { modelVersion?: string; request: any },
        {
          _creationTime: number;
          _id: string;
          cacheKey: string;
          createdAt: number;
          expiresAt?: number;
          hitCount: number;
          lastAccessedAt: number;
          metadata?: any;
          model: string;
          modelVersion?: string;
          request: any;
          response: any;
          tags?: Array<string>;
          ttlTier: number;
        } | null
      >;
      store: FunctionReference<
        "mutation",
        "internal",
        {
          metadata?: any;
          modelVersion?: string;
          pin?: boolean;
          request: any;
          response: any;
          tags?: Array<string>;
        },
        string
      >;
    };
    cleanup: {
      cleanup: FunctionReference<
        "action",
        "internal",
        { batchSize?: number; dryRun?: boolean },
        { deletedCount: number; hasMore: boolean; keys: Array<string> }
      >;
    };
    config: {
      getConfig: FunctionReference<
        "query",
        "internal",
        {},
        {
          defaultTtlMs?: number;
          maxEntries?: number;
          normalizeRequests?: boolean;
          promotionTtlMs?: number;
          ttlByModel?: Record<string, number>;
          ttlByTag?: Record<string, number>;
        }
      >;
      getStats: FunctionReference<
        "query",
        "internal",
        {},
        {
          entriesByModel: Record<string, number>;
          hitsByModel: Record<string, number>;
          newestEntry?: number;
          oldestEntry?: number;
          totalEntries: number;
          totalHits: number;
        }
      >;
      setConfig: FunctionReference<
        "mutation",
        "internal",
        {
          config: {
            defaultTtlMs?: number;
            maxEntries?: number;
            normalizeRequests?: boolean;
            promotionTtlMs?: number;
            ttlByModel?: Record<string, number>;
            ttlByTag?: Record<string, number>;
          };
          replace?: boolean;
        },
        null
      >;
    };
    manage: {
      invalidate: FunctionReference<
        "mutation",
        "internal",
        {
          before?: number;
          cacheKey?: string;
          model?: string;
          modelVersion?: string;
          tag?: string;
        },
        number
      >;
    };
    queries: {
      history: FunctionReference<
        "query",
        "internal",
        { request: any },
        Array<{
          cacheKey: string;
          isCurrent: boolean;
          metadata?: any;
          model: string;
          modelVersion?: string;
          request: any;
          response: any;
          storedAt: number;
          tags?: Array<string>;
        }>
      >;
      queryEntries: FunctionReference<
        "query",
        "internal",
        {
          after?: number;
          before?: number;
          limit?: number;
          model?: string;
          tag?: string;
        },
        Array<{
          _creationTime: number;
          _id: string;
          cacheKey: string;
          createdAt: number;
          expiresAt?: number;
          hitCount: number;
          lastAccessedAt: number;
          metadata?: any;
          model: string;
          modelVersion?: string;
          request: any;
          response: any;
          tags?: Array<string>;
          ttlTier: number;
        }>
      >;
    };
  };
};
