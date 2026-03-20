import { vi } from "vitest";

export const { requireAdminPageSession } = vi.hoisted(() => ({
  requireAdminPageSession: vi.fn(),
}));

export const { requireAdminSession } = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
}));

export const { convexAdminActivityRepository } = vi.hoisted(() => ({
  convexAdminActivityRepository: { list: vi.fn() },
}));

export const { convexAdminAnalyticsRepository } = vi.hoisted(() => ({
  convexAdminAnalyticsRepository: {
    getMessageAnalytics: vi.fn(),
    getActiveUsersAnalytics: vi.fn(),
    getBrokerAnalytics: vi.fn(),
    getDeveloperAnalytics: vi.fn(),
    getPropertyAnalytics: vi.fn(),
    getOfferAnalytics: vi.fn(),
    getConnectionAnalytics: vi.fn(),
  },
}));

export const { convexAdminDiagnosticsRepository } = vi.hoisted(() => ({
  convexAdminDiagnosticsRepository: {
    listDevLogs: vi.fn(),
    getErrorRate: vi.fn(),
    getSearchActivityChart: vi.fn(),
    getErrorHealthChart: vi.fn(),
    getChannelDistribution: vi.fn(),
  },
}));

export const { convexAdminKnowledgeRepository } = vi.hoisted(() => ({
  convexAdminKnowledgeRepository: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

export const { convexAdminOrdersRepository } = vi.hoisted(() => ({
  convexAdminOrdersRepository: {
    list: vi.fn(),
    update: vi.fn(),
  },
}));

export const { convexAdminOrganizationsRepository } = vi.hoisted(() => ({
  convexAdminOrganizationsRepository: {
    listBrokers: vi.fn(),
    listDevelopers: vi.fn(),
    listMemberships: vi.fn(),
    listInvites: vi.fn(),
    getDetail: vi.fn(),
  },
}));

export const { convexAdminOverviewRepository } = vi.hoisted(() => ({
  convexAdminOverviewRepository: {
    getStats: vi.fn(),
    listRecentActivities: vi.fn(),
  },
}));

export const { convexAdminPropertiesRepository } = vi.hoisted(() => ({
  convexAdminPropertiesRepository: {
    list: vi.fn(),
    listReds: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

export const { convexAdminUsersRepository } = vi.hoisted(() => ({
  convexAdminUsersRepository: {
    listAdminProfiles: vi.fn(),
    listAdminMemberships: vi.fn(),
    listAdminUserVerification: vi.fn(),
    listAdminUsers: vi.fn(),
    getDetail: vi.fn(),
    update: vi.fn(),
  },
}));

export const { convexAdminVerificationsRepository } = vi.hoisted(() => ({
  convexAdminVerificationsRepository: {
    getSummary: vi.fn(),
    list: vi.fn(),
    getDetail: vi.fn(),
    review: vi.fn(),
  },
}));

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
