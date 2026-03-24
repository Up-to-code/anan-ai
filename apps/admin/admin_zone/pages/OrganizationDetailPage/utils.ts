export function record(value: unknown) {
  return (value as Record<string, unknown>) ?? {};
}

export function rows(value: unknown) {
  return (value as Array<Record<string, unknown>>) ?? [];
}

export function count(value: unknown) {
  return Number(value ?? 0);
}
