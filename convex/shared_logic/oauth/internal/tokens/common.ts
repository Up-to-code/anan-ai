export async function revokeAuthorizationAccessTokens(args: {
  ctx: any;
  clientId: string;
  authorizationId: any;
  now: number;
}) {
  const issuedForClient = await args.ctx.db
    .query("oauthAccessTokens")
    .withIndex("clientId", (q: any) => q.eq("clientId", args.clientId))
    .collect();
  const matching = issuedForClient.filter(
    (token: any) =>
      token.authorizationId === args.authorizationId &&
      token.revokedAt === undefined,
  );

  await Promise.all(
    matching.map((token: any) =>
      args.ctx.db.patch(token._id, {
        revokedAt: args.now,
      }),
    ),
  );

  return matching.length;
}
