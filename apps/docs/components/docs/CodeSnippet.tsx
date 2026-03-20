import type { DocsCodeExample } from "@/lib/docs/types";
import { highlightCode } from "@/lib/docs/shiki";
import { CodeSnippetClient } from "./CodeSnippetClient";

export default async function CodeSnippet({ example }: { example: DocsCodeExample }) {
  // Generate HTML on the server
  const html = await highlightCode(example.code, example.language);

  return (
    <CodeSnippetClient
      title={example.title}
      language={example.language}
      code={example.code}
      html={html}
    />
  );
}
