export function normalizeDirectPair(userA: string, userB: string) {
  const [first, second] = [userA.trim(), userB.trim()].sort();
  return {
    firstParticipantUserId: first,
    secondParticipantUserId: second,
    directKey: `${first}__${second}`,
  };
}

export function normalizeSearchQuery(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeComparableText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

