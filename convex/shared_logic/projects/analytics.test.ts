import { convexTest } from "convex-test";
import { expect, it } from "vitest";
import schema from "../../schema";
import { api } from "../../_generated/api";
import { modules } from "../../test.setup";

function makeIdentity(args: { subject: string; email: string; name: string }) {
  return {
    subject: args.subject,
    email: args.email,
    name: args.name,
  } as any;
}

async function seedProfile(
  t: ReturnType<typeof convexTest>,
  args: {
    authUserId: string;
    email: string;
    name: string;
    role: "broker" | "developer" | "user";
    brokerId?: string;
    REDId?: string;
  },
) {
  await t.run(async (ctx) => {
    await ctx.db.insert("userProfiles", {
      authUserId: args.authUserId,
      email: args.email,
      name: args.name,
      username: args.name.toLowerCase().replace(/\s+/g, "-"),
      usernameLower: args.name.toLowerCase().replace(/\s+/g, "-"),
      role: args.role,
      brokerId: args.brokerId,
      REDId: args.REDId,
      isActive: true,
      roleStatus: "approved",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
  });
}

it("aggregates project analytics from viewers, deals, offer cases, and tracked events", async () => {
  const t = convexTest(schema, modules);
  const ownerIdentity = makeIdentity({
    subject: "auth-owner",
    email: "owner@example.com",
    name: "Owner",
  });
  const brokerTwoIdentity = makeIdentity({
    subject: "auth-broker-2",
    email: "broker2@example.com",
    name: "Broker Two",
  });
  const brokerThreeIdentity = makeIdentity({
    subject: "auth-broker-3",
    email: "broker3@example.com",
    name: "Broker Three",
  });
  const brokerSixIdentity = makeIdentity({
    subject: "auth-broker-6",
    email: "broker6@example.com",
    name: "Broker Six",
  });

  const {
    ownerBrokerId,
    brokerTwoId,
    brokerThreeId,
    brokerFourId,
    brokerFiveId,
    brokerSixId,
    propertyId,
  } = await t.run(async (ctx) => {
    const ownerBroker = await ctx.db.insert("brokers", { name: "Owner Broker", slug: "owner-broker" } as any);
    const brokerTwo = await ctx.db.insert("brokers", { name: "Broker Two", slug: "broker-two", phone: "0500000002" } as any);
    const brokerThree = await ctx.db.insert("brokers", { name: "Broker Three", slug: "broker-three", phone: "0500000003" } as any);
    const brokerFour = await ctx.db.insert("brokers", { name: "Broker Four", slug: "broker-four", phone: "0500000004" } as any);
    const brokerFive = await ctx.db.insert("brokers", { name: "Broker Five", slug: "broker-five", phone: "0500000005" } as any);
    const brokerSix = await ctx.db.insert("brokers", { name: "Broker Six", slug: "broker-six", phone: "0500000006" } as any);
    const trackedClientId = await ctx.db.insert("crmClients", {
      ownerAuthUserId: "auth-owner",
      brokerId: ownerBroker,
      name: "Tracked Client",
      createdAt: 1_737_000_150_000,
      updatedAt: 1_737_000_150_000,
    } as any);
    const projectId = await ctx.db.insert("properties", {
      title: "Analytics Project",
      address: "Riyadh",
      price: 100,
      beds: 3,
      baths: 2,
      description: "Analytics Project",
      searchText: "Analytics Project Riyadh",
      publicationState: "published",
      brokerId: ownerBroker,
    } as any);
    const permitReviewPackageId = await ctx.db.insert("offerPackages", {
      propertyId: projectId,
      ownerAuthUserId: "auth-owner",
      fromBrokerId: ownerBroker,
      askingPrice: 100,
      visibility: "open",
      allowedAudience: "brokers",
      permitStatus: "Pending review",
      createdAt: 1_737_000_305_000,
      updatedAt: 1_737_000_305_000,
    } as any);

    await Promise.all([
      ctx.db.insert("propertyViewerAccess", {
        propertyId: projectId,
        authUserId: "auth-broker-2",
        accessSource: "manual",
        status: "active",
        createdAt: 1_737_000_000_000,
        updatedAt: 1_737_000_000_000,
      } as any),
      ctx.db.insert("propertyViewerAccess", {
        propertyId: projectId,
        authUserId: "auth-broker-3",
        accessSource: "chat_share",
        status: "active",
        createdAt: 1_737_000_100_000,
        updatedAt: 1_737_000_100_000,
      } as any),
      ctx.db.insert("deals", {
        title: "Broker Two Deal",
        stage: "contacted",
        relationType: "broker_managed",
        relatedBrokerId: brokerTwo,
        contactName: "عميل مرتبط",
        propertyId: projectId,
        brokerId: ownerBroker,
        createdAt: 1_737_000_200_000,
      } as any),
      ctx.db.insert("deals", {
        title: "Broker Five Deal",
        stage: "won",
        relationType: "broker_managed",
        relatedBrokerId: brokerFive,
        contactName: "عميل ناجح",
        propertyId: projectId,
        brokerId: ownerBroker,
        createdAt: 1_737_000_250_000,
      } as any),
      ctx.db.insert("deals", {
        title: "Broker Three Deal",
        stage: "new",
        relationType: "broker_managed",
        relatedBrokerId: brokerThree,
        contactName: "عميل جديد",
        propertyId: projectId,
        brokerId: ownerBroker,
        createdAt: 1_737_000_260_000,
      } as any),
      ctx.db.insert("deals", {
        title: "Broker Six Deal",
        stage: "lost",
        relationType: "broker_managed",
        relatedBrokerId: brokerSix,
        contactName: "عميل مفقود",
        propertyId: projectId,
        brokerId: ownerBroker,
        createdAt: 1_737_000_265_000,
      } as any),
    ]);

    const brokerTwoTrackedDealId = await ctx.db.insert("deals", {
      title: "Broker Two CRM Deal",
      stage: "new",
      relationType: "internal_client",
      relatedBrokerId: brokerTwo,
      crmClientId: trackedClientId,
      propertyId: projectId,
      brokerId: ownerBroker,
      createdAt: 1_737_000_225_000,
    } as any);

    const offerPackageActiveId = await ctx.db.insert("offerPackages", {
      propertyId: projectId,
      ownerAuthUserId: "auth-owner",
      fromBrokerId: ownerBroker,
      askingPrice: 100,
      visibility: "open",
      allowedAudience: "brokers",
      createdAt: 1_737_000_300_000,
      updatedAt: 1_737_000_300_000,
    } as any);

    const engagedCaseId = await ctx.db.insert("offerCases", {
      offerPackageId: offerPackageActiveId,
      type: "open_offer",
      stage: "engaged",
      visibility: "open",
      initiatedByAuthUserId: "auth-owner",
      headline: "Engaged case",
      createdAt: 1_737_000_300_000,
      updatedAt: 1_737_000_320_000,
      lastActivityAt: 1_737_000_320_000,
    } as any);

    const brokerTwoStandaloneCaseId = await ctx.db.insert("offerCases", {
      offerPackageId: offerPackageActiveId,
      type: "collaboration_case",
      stage: "targeted",
      visibility: "private",
      initiatedByAuthUserId: "auth-owner",
      headline: "Broker Two Standalone Case",
      clientContext: {
        clientName: "عميل متابعة جديد",
        clientNeed: "استثمار",
      },
      createdAt: 1_737_000_330_000,
      updatedAt: 1_737_000_335_000,
      lastActivityAt: 1_737_000_335_000,
    } as any);

    const brokerTwoLinkedCaseId = await ctx.db.insert("offerCases", {
      offerPackageId: offerPackageActiveId,
      type: "private_offer",
      stage: "engaged",
      visibility: "private",
      initiatedByAuthUserId: "auth-owner",
      headline: "Broker Two Linked Case",
      clientContext: {
        crmClientId: trackedClientId,
        clientName: "Tracked Client",
        clientNeed: "شراء",
      },
      linkedDealId: brokerTwoTrackedDealId,
      createdAt: 1_737_000_340_000,
      updatedAt: 1_737_000_345_000,
      lastActivityAt: 1_737_000_345_000,
    } as any);
    const brokerFourPermitReviewCaseId = await ctx.db.insert("offerCases", {
      offerPackageId: permitReviewPackageId,
      type: "open_offer",
      stage: "engaged",
      visibility: "private",
      initiatedByAuthUserId: "auth-owner",
      headline: "Broker Four Permit Review Case",
      clientContext: {
        clientName: "عميل يحتاج مراجعة تصريح",
        clientNeed: "شراء",
      },
      createdAt: 1_737_000_350_000,
      updatedAt: 1_737_000_355_000,
      lastActivityAt: 1_737_000_355_000,
    } as any);

    await Promise.all([
      ctx.db.insert("offerCaseParticipants", {
        offerCaseId: engagedCaseId,
        authUserId: "auth-owner",
        brokerId: ownerBroker,
        role: "inventory_owner",
        status: "active",
        createdAt: 1_737_000_300_000,
        updatedAt: 1_737_000_300_000,
      } as any),
      ctx.db.insert("offerCaseParticipants", {
        offerCaseId: engagedCaseId,
        authUserId: "auth-broker-4",
        brokerId: brokerFour,
        role: "execution_provider",
        status: "accepted",
        createdAt: 1_737_000_310_000,
        updatedAt: 1_737_000_310_000,
      } as any),
      ctx.db.insert("offerCaseParticipants", {
        offerCaseId: brokerTwoStandaloneCaseId,
        authUserId: "auth-owner",
        brokerId: ownerBroker,
        role: "inventory_owner",
        status: "active",
        createdAt: 1_737_000_330_000,
        updatedAt: 1_737_000_330_000,
      } as any),
      ctx.db.insert("offerCaseParticipants", {
        offerCaseId: brokerTwoStandaloneCaseId,
        authUserId: "auth-broker-2",
        brokerId: brokerTwo,
        role: "execution_provider",
        status: "accepted",
        createdAt: 1_737_000_332_000,
        updatedAt: 1_737_000_332_000,
      } as any),
      ctx.db.insert("offerCaseParticipants", {
        offerCaseId: brokerTwoLinkedCaseId,
        authUserId: "auth-owner",
        brokerId: ownerBroker,
        role: "inventory_owner",
        status: "active",
        createdAt: 1_737_000_340_000,
        updatedAt: 1_737_000_340_000,
      } as any),
      ctx.db.insert("offerCaseParticipants", {
        offerCaseId: brokerTwoLinkedCaseId,
        authUserId: "auth-broker-2",
        brokerId: brokerTwo,
        role: "execution_provider",
        status: "accepted",
        createdAt: 1_737_000_342_000,
        updatedAt: 1_737_000_342_000,
      } as any),
      ctx.db.insert("offerCaseParticipants", {
        offerCaseId: brokerFourPermitReviewCaseId,
        authUserId: "auth-owner",
        brokerId: ownerBroker,
        role: "inventory_owner",
        status: "active",
        createdAt: 1_737_000_350_000,
        updatedAt: 1_737_000_350_000,
      } as any),
      ctx.db.insert("offerCaseParticipants", {
        offerCaseId: brokerFourPermitReviewCaseId,
        authUserId: "auth-broker-4",
        brokerId: brokerFour,
        role: "execution_provider",
        status: "accepted",
        createdAt: 1_737_000_352_000,
        updatedAt: 1_737_000_352_000,
      } as any),
      ctx.db.insert("offerActivities", {
        offerCaseId: engagedCaseId,
        kind: "engaged",
        actorAuthUserId: "auth-broker-4",
        message: "Engaged activity",
        createdAt: 1_737_000_320_000,
      } as any),
      ctx.db.insert("offerActivities", {
        offerCaseId: brokerTwoStandaloneCaseId,
        kind: "participant_targeted",
        actorAuthUserId: "auth-owner",
        message: "Broker Two targeted activity",
        createdAt: 1_737_000_333_000,
      } as any),
    ]);

    return {
      ownerBrokerId: ownerBroker,
      brokerTwoId: brokerTwo,
      brokerThreeId: brokerThree,
      brokerFourId: brokerFour,
      brokerFiveId: brokerFive,
      brokerSixId: brokerSix,
      propertyId: projectId,
    };
  });

  await seedProfile(t, {
    authUserId: "auth-owner",
    email: "owner@example.com",
    name: "Owner",
    role: "broker",
    brokerId: ownerBrokerId,
  });
  await seedProfile(t, {
    authUserId: "auth-broker-2",
    email: "broker2@example.com",
    name: "Broker Two",
    role: "broker",
    brokerId: brokerTwoId,
  });
  await seedProfile(t, {
    authUserId: "auth-broker-3",
    email: "broker3@example.com",
    name: "Broker Three",
    role: "broker",
    brokerId: brokerThreeId,
  });
  await seedProfile(t, {
    authUserId: "auth-broker-4",
    email: "broker4@example.com",
    name: "Broker Four",
    role: "broker",
    brokerId: brokerFourId,
  });
  await seedProfile(t, {
    authUserId: "auth-broker-5",
    email: "broker5@example.com",
    name: "Broker Five",
    role: "broker",
    brokerId: brokerFiveId,
  });
  await seedProfile(t, {
    authUserId: "auth-broker-6",
    email: "broker6@example.com",
    name: "Broker Six",
    role: "broker",
    brokerId: brokerSixId,
  });

  await t.withIdentity(brokerTwoIdentity).mutation(
    api.shared_logic.projectAnalytics.recordProjectAnalyticsEvent as never,
    {
      propertyId,
      eventType: "project_detail_view",
      source: "test",
    } as never,
  );
  await t.withIdentity(brokerTwoIdentity).mutation(
    api.shared_logic.projectAnalytics.recordProjectAnalyticsEvent as never,
    {
      propertyId,
      eventType: "project_analyze_click",
      source: "test",
    } as never,
  );
  await t.withIdentity(brokerThreeIdentity).mutation(
    api.shared_logic.projectAnalytics.recordProjectAnalyticsEvent as never,
    {
      propertyId,
      eventType: "project_detail_view",
      source: "test",
    } as never,
  );
  await t.withIdentity(brokerThreeIdentity).mutation(
    api.shared_logic.projectAnalytics.recordProjectAnalyticsEvent as never,
    {
      propertyId,
      eventType: "project_asset_open_click",
      source: "test",
    } as never,
  );

  const analytics = (await t.withIdentity(ownerIdentity).query(
    api.shared_logic.projectAnalytics.getProjectAnalytics as never,
    { propertyId } as never,
  )) as any;

  expect(analytics.kpis).toEqual({
    connectedBrokers: 5,
    brokerManagedClients: 4,
    totalViews: 2,
    totalClicks: 2,
    activeCases: 4,
    activeDeals: 3,
  });

  expect(analytics.brokerRows).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        brokerName: "Broker Two",
        state: "client_linked",
        views: 1,
        clicks: 1,
      }),
      expect.objectContaining({
        brokerName: "Broker Three",
        state: "client_linked",
        views: 1,
        clicks: 1,
      }),
      expect.objectContaining({
        brokerName: "Broker Four",
        state: "offer_active",
      }),
      expect.objectContaining({
        brokerName: "Broker Five",
        state: "closed_won",
      }),
      expect.objectContaining({
        brokerName: "Broker Six",
        state: "closed_lost",
      }),
    ]),
  );

  expect(analytics.stageSummary).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ key: "deal:new", count: 2 }),
      expect.objectContaining({ key: "deal:contacted", count: 1 }),
      expect.objectContaining({ key: "deal:won", count: 1 }),
      expect.objectContaining({ key: "deal:lost", count: 1 }),
      expect.objectContaining({ key: "offer_case:targeted", count: 1 }),
      expect.objectContaining({ key: "offer_case:engaged", count: 3 }),
    ]),
  );

  expect(analytics.developerSummary).toEqual({
    totalCustomers: 8,
    trackedCustomers: 5,
    brokerManagedCustomers: 7,
    internalCustomers: 1,
    activeBrokers: 5,
    closedWonCustomers: 1,
    closedLostCustomers: 1,
  });

  expect(analytics.developerStageSummary).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ key: "new", count: 3 }),
      expect.objectContaining({ key: "contacted", count: 3 }),
      expect.objectContaining({ key: "won", count: 1 }),
      expect.objectContaining({ key: "lost", count: 1 }),
    ]),
  );

  const brokerTwoTracking = analytics.brokerTracking.find((entry: any) => entry.brokerName === "Broker Two");
  expect(brokerTwoTracking).toEqual(
    expect.objectContaining({
      totalCustomers: 3,
      trackedCustomers: 2,
      brokerManagedCustomers: 2,
      internalCustomers: 1,
      currentActivityKey: "in_stage",
      currentActivityLabel: "في مرحلة",
      activityCounts: expect.objectContaining({
        new_client: 1,
        in_call: 1,
        interested: 1,
        permit_review: 0,
        closed_won: 0,
        closed_lost: 0,
      }),
    }),
  );
  expect(brokerTwoTracking.customers).toEqual([]);
  expect(brokerTwoTracking.timeline).toEqual([]);
  expect(brokerTwoTracking.linkedClientName).toBeNull();

  const brokerThreeTracking = analytics.brokerTracking.find((entry: any) => entry.brokerName === "Broker Three");
  expect(brokerThreeTracking).toEqual(
    expect.objectContaining({
      totalCustomers: 1,
      trackedCustomers: 1,
      brokerManagedCustomers: 1,
      internalCustomers: 0,
      currentActivityKey: "new_client",
      currentActivityLabel: "عميل جديد",
    }),
  );
  expect(brokerThreeTracking.customers).toEqual([]);
  expect(brokerThreeTracking.timeline).toEqual([]);

  const brokerFourTracking = analytics.brokerTracking.find((entry: any) => entry.brokerName === "Broker Four");
  expect(brokerFourTracking).toEqual(
    expect.objectContaining({
      totalCustomers: 2,
      trackedCustomers: 0,
      brokerManagedCustomers: 2,
      internalCustomers: 0,
      currentActivityKey: "permit_review",
      currentActivityLabel: "مراجعة التصريح",
      activityCounts: expect.objectContaining({
        interested: 1,
        permit_review: 1,
      }),
    }),
  );
  expect(brokerFourTracking.customers).toEqual([]);
  expect(brokerFourTracking.timeline).toEqual([]);

  const brokerFiveTracking = analytics.brokerTracking.find((entry: any) => entry.brokerName === "Broker Five");
  expect(brokerFiveTracking).toEqual(
    expect.objectContaining({
      totalCustomers: 1,
      trackedCustomers: 1,
      brokerManagedCustomers: 1,
      currentActivityKey: "closed_won",
      currentActivityLabel: "إغلاق ناجح",
    }),
  );
  expect(brokerFiveTracking.customers).toEqual([]);
  expect(brokerFiveTracking.timeline).toEqual([]);

  const brokerSixTracking = analytics.brokerTracking.find((entry: any) => entry.brokerName === "Broker Six");
  expect(brokerSixTracking).toEqual(
    expect.objectContaining({
      totalCustomers: 1,
      trackedCustomers: 1,
      brokerManagedCustomers: 1,
      currentActivityKey: "closed_lost",
      currentActivityLabel: "إغلاق غير مكتمل",
    }),
  );
  expect(brokerSixTracking.customers).toEqual([]);
  expect(brokerSixTracking.timeline).toEqual([]);
  expect(analytics.recentEvents[0]).toEqual(
    expect.objectContaining({
      title: expect.any(String),
    }),
  );
});

it("blocks shared viewers from reading owner-only project analytics", async () => {
  const t = convexTest(schema, modules);
  const ownerIdentity = makeIdentity({
    subject: "auth-owner",
    email: "owner@example.com",
    name: "Owner",
  });
  const sharedIdentity = makeIdentity({
    subject: "auth-shared",
    email: "shared@example.com",
    name: "Shared",
  });

  const { ownerBrokerId, propertyId } = await t.run(async (ctx) => {
    const ownerBroker = await ctx.db.insert("brokers", { name: "Owner Broker", slug: "owner-broker" } as any);
    const projectId = await ctx.db.insert("properties", {
      title: "Restricted Analytics Project",
      address: "Jeddah",
      price: 100,
      beds: 3,
      baths: 2,
      description: "Restricted Analytics Project",
      searchText: "Restricted Analytics Project",
      publicationState: "published",
      brokerId: ownerBroker,
    } as any);
    await ctx.db.insert("propertyViewerAccess", {
      propertyId: projectId,
      authUserId: "auth-shared",
      accessSource: "manual",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
    return { ownerBrokerId: ownerBroker, propertyId: projectId };
  });

  await seedProfile(t, {
    authUserId: "auth-owner",
    email: "owner@example.com",
    name: "Owner",
    role: "broker",
    brokerId: ownerBrokerId,
  });
  await seedProfile(t, {
    authUserId: "auth-shared",
    email: "shared@example.com",
    name: "Shared",
    role: "user",
  });

  await expect(
    t.withIdentity(sharedIdentity).query(
      api.shared_logic.projectAnalytics.getProjectAnalytics as never,
      { propertyId } as never,
    ),
  ).rejects.toThrow("Insufficient role permissions");

  await expect(
    t.withIdentity(ownerIdentity).query(
      api.shared_logic.projectAnalytics.getProjectAnalytics as never,
      { propertyId } as never,
    ),
  ).resolves.toEqual(
    expect.objectContaining({
      projectId: String(propertyId),
    }),
  );
});
