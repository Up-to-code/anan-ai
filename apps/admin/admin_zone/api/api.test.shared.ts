import { vi } from "vitest";

const adminApiMocks = vi.hoisted(() => ({
  requireAdminPageSession: vi.fn(),
  requireAdminSession: vi.fn(),
  convexAdminActivityRepository: { list: vi.fn() },
  convexAdminAnalyticsRepository: {
    getMessageAnalytics: vi.fn(),
    getActiveUsersAnalytics: vi.fn(),
    getBrokerAnalytics: vi.fn(),
    getDeveloperAnalytics: vi.fn(),
    getPropertyAnalytics: vi.fn(),
    getOfferAnalytics: vi.fn(),
    getConnectionAnalytics: vi.fn(),
  },
  convexAdminCommandCenterRepository: {
    getOverview: vi.fn(),
    getCommercialAnalytics: vi.fn(),
    getEcosystemHealthAnalytics: vi.fn(),
    getQueueHealthAnalytics: vi.fn(),
  },
  convexAdminDiagnosticsRepository: {
    listDevLogs: vi.fn(),
    getErrorRate: vi.fn(),
    getSearchActivityChart: vi.fn(),
    getErrorHealthChart: vi.fn(),
    getChannelDistribution: vi.fn(),
  },
  convexAdminKnowledgeRepository: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
  convexAdminOrdersRepository: {
    list: vi.fn(),
    update: vi.fn(),
  },
  convexAdminOrganizationsRepository: {
    listBrokers: vi.fn(),
    listDevelopers: vi.fn(),
    listMemberships: vi.fn(),
    listInvites: vi.fn(),
    getDetail: vi.fn(),
  },
  convexAdminOverviewRepository: {
    getStats: vi.fn(),
    listRecentActivities: vi.fn(),
  },
  convexAdminPropertiesRepository: {
    list: vi.fn(),
    listReds: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
  convexAdminUsersRepository: {
    listAdminProfiles: vi.fn(),
    listAdminMemberships: vi.fn(),
    listAdminUserVerification: vi.fn(),
    listAdminUsers: vi.fn(),
    getDetail: vi.fn(),
    update: vi.fn(),
  },
  convexAdminVerificationsRepository: {
    getSummary: vi.fn(),
    list: vi.fn(),
    getDetail: vi.fn(),
    review: vi.fn(),
  },
}));

const requireAdminPageSession = adminApiMocks.requireAdminPageSession;
const requireAdminSession = adminApiMocks.requireAdminSession;
const convexAdminActivityRepository = adminApiMocks.convexAdminActivityRepository;
const convexAdminAnalyticsRepository = adminApiMocks.convexAdminAnalyticsRepository;
const convexAdminCommandCenterRepository = adminApiMocks.convexAdminCommandCenterRepository;
const convexAdminDiagnosticsRepository = adminApiMocks.convexAdminDiagnosticsRepository;
const convexAdminKnowledgeRepository = adminApiMocks.convexAdminKnowledgeRepository;
const convexAdminOrdersRepository = adminApiMocks.convexAdminOrdersRepository;
const convexAdminOrganizationsRepository = adminApiMocks.convexAdminOrganizationsRepository;
const convexAdminOverviewRepository = adminApiMocks.convexAdminOverviewRepository;
const convexAdminPropertiesRepository = adminApiMocks.convexAdminPropertiesRepository;
const convexAdminUsersRepository = adminApiMocks.convexAdminUsersRepository;
const convexAdminVerificationsRepository = adminApiMocks.convexAdminVerificationsRepository;

export {
  convexAdminActivityRepository,
  convexAdminAnalyticsRepository,
  convexAdminCommandCenterRepository,
  convexAdminDiagnosticsRepository,
  convexAdminKnowledgeRepository,
  convexAdminOrdersRepository,
  convexAdminOrganizationsRepository,
  convexAdminOverviewRepository,
  convexAdminPropertiesRepository,
  convexAdminUsersRepository,
  convexAdminVerificationsRepository,
  requireAdminPageSession,
  requireAdminSession,
};

vi.mock("@/lib/serverSession", () => ({
  requireAdminPageSession,
}));

vi.mock("@/server/auth/guards", () => ({
  requireAdminSession,
}));

vi.mock("@/server/infrastructure/convex/adminActivityRepository", () => ({
  convexAdminActivityRepository,
}));

vi.mock("@/server/infrastructure/convex/adminAnalyticsRepository", () => ({
  convexAdminAnalyticsRepository,
}));

vi.mock("@/server/infrastructure/convex/adminCommandCenterRepository", () => ({
  convexAdminCommandCenterRepository,
}));

vi.mock("@/server/infrastructure/convex/adminDiagnosticsRepository", () => ({
  convexAdminDiagnosticsRepository,
}));

vi.mock("@/server/infrastructure/convex/adminKnowledgeRepository", () => ({
  convexAdminKnowledgeRepository,
}));

vi.mock("@/server/infrastructure/convex/adminOrdersRepository", () => ({
  convexAdminOrdersRepository,
}));

vi.mock("@/server/infrastructure/convex/adminOrganizationsRepository", () => ({
  convexAdminOrganizationsRepository,
}));

vi.mock("@/server/infrastructure/convex/adminOverviewRepository", () => ({
  convexAdminOverviewRepository,
}));

vi.mock("@/server/infrastructure/convex/adminPropertiesRepository", () => ({
  convexAdminPropertiesRepository,
}));

vi.mock("@/server/infrastructure/convex/adminUsersRepository", () => ({
  convexAdminUsersRepository,
}));

vi.mock("@/server/infrastructure/convex/adminVerificationsRepository", () => ({
  convexAdminVerificationsRepository,
}));

function resetAdminSessionMocks() {
  requireAdminPageSession.mockReset();
  requireAdminSession.mockReset();
  requireAdminPageSession.mockResolvedValue({
    token: "admin-token",
    context: { userId: "admin-1", role: "admin" },
  });
  requireAdminSession.mockResolvedValue({
    token: "admin-token",
    context: { userId: "admin-1", role: "admin" },
  });
}

function resetAnalyticsAndDiagnosticsMocks() {
  convexAdminActivityRepository.list.mockReset();
  convexAdminAnalyticsRepository.getMessageAnalytics.mockReset();
  convexAdminAnalyticsRepository.getActiveUsersAnalytics.mockReset();
  convexAdminAnalyticsRepository.getBrokerAnalytics.mockReset();
  convexAdminAnalyticsRepository.getDeveloperAnalytics.mockReset();
  convexAdminAnalyticsRepository.getPropertyAnalytics.mockReset();
  convexAdminAnalyticsRepository.getOfferAnalytics.mockReset();
  convexAdminAnalyticsRepository.getConnectionAnalytics.mockReset();
  convexAdminCommandCenterRepository.getOverview.mockReset();
  convexAdminCommandCenterRepository.getCommercialAnalytics.mockReset();
  convexAdminCommandCenterRepository.getEcosystemHealthAnalytics.mockReset();
  convexAdminCommandCenterRepository.getQueueHealthAnalytics.mockReset();
  convexAdminDiagnosticsRepository.listDevLogs.mockReset();
  convexAdminDiagnosticsRepository.getErrorRate.mockReset();
  convexAdminDiagnosticsRepository.getSearchActivityChart.mockReset();
  convexAdminDiagnosticsRepository.getErrorHealthChart.mockReset();
  convexAdminDiagnosticsRepository.getChannelDistribution.mockReset();
}

function resetRepositoryMocks() {
  convexAdminKnowledgeRepository.list.mockReset();
  convexAdminKnowledgeRepository.get.mockReset();
  convexAdminKnowledgeRepository.create.mockReset();
  convexAdminOrdersRepository.list.mockReset();
  convexAdminOrdersRepository.update.mockReset();
  convexAdminOrganizationsRepository.listBrokers.mockReset();
  convexAdminOrganizationsRepository.listDevelopers.mockReset();
  convexAdminOrganizationsRepository.listMemberships.mockReset();
  convexAdminOrganizationsRepository.listInvites.mockReset();
  convexAdminOrganizationsRepository.getDetail.mockReset();
  convexAdminOverviewRepository.getStats.mockReset();
  convexAdminOverviewRepository.listRecentActivities.mockReset();
  convexAdminPropertiesRepository.list.mockReset();
  convexAdminPropertiesRepository.listReds.mockReset();
  convexAdminPropertiesRepository.get.mockReset();
  convexAdminPropertiesRepository.create.mockReset();
  convexAdminUsersRepository.listAdminProfiles.mockReset();
  convexAdminUsersRepository.listAdminMemberships.mockReset();
  convexAdminUsersRepository.listAdminUserVerification.mockReset();
  convexAdminUsersRepository.listAdminUsers.mockReset();
  convexAdminUsersRepository.getDetail.mockReset();
  convexAdminUsersRepository.update.mockReset();
  convexAdminVerificationsRepository.getSummary.mockReset();
  convexAdminVerificationsRepository.list.mockReset();
  convexAdminVerificationsRepository.getDetail.mockReset();
  convexAdminVerificationsRepository.review.mockReset();
}

export function resetAdminApiMocks() {
  resetAdminSessionMocks();
  resetAnalyticsAndDiagnosticsMocks();
  resetRepositoryMocks();
}
