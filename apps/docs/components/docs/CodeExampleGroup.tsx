import type { DocsCodeExampleGroup } from "@/lib/docs/types";
import { highlightCode } from "@/lib/docs/shiki";
import { CodeExampleGroupClient } from "./CodeExampleGroupClient";

export default async function CodeExampleGroup({ group }: { group: DocsCodeExampleGroup }) {
  const examples = await Promise.all(
    group.examples.map(async (example) => ({
      ...example,
      html: await highlightCode(example.code, example.language),
    })),
  );

  return <CodeExampleGroupClient group={group} examples={examples} />;
}
