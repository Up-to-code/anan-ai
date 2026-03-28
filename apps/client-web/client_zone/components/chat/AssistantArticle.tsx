import { cn } from "@/lib/utils";
import { MarkdownContent } from "./MarkdownContent";

/**
 * WHY:   Assistant replies now need to read like an article or documentation note instead of a chat bubble.
 * WHAT:  Renders lightweight markdown-like prose for assistant text.
 * HOW:   Supports headings, paragraphs, bullet lists, and ordered lists with a small line-based parser.
 */
export function AssistantArticle({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <MarkdownContent
      content={content}
      className={cn("workspace-assistant-markdown", className)}
    />
  );
}
