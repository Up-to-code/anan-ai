import { encode } from "@toon-format/toon";

/** Encode data as TOON for LLM consumption. */
export function toonEncode(data: unknown): string {
  try {
    const plain = JSON.parse(JSON.stringify(data ?? null));
    return encode(plain, { delimiter: "\t" });
  } catch {
    return JSON.stringify(data);
  }
}
