import { cn } from "@/lib/utils";

function isBulletLine(line: string) {
  return /^[-*]\s+/.test(line);
}

function isOrderedLine(line: string) {
  return /^\d+\.\s+/.test(line);
}

function renderParagraph(text: string, key: string) {
  return (
    <p key={key} className="text-[15px] leading-8 text-slate-700 sm:text-base">
      {text}
    </p>
  );
}

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
  const lines = content.split("\n").map((line) => line.trimEnd());
  const nodes: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index]?.trim() ?? "";

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={`h3-${index}`} className="text-lg font-semibold text-slate-900">
          {line.slice(4)}
        </h3>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={`h2-${index}`} className="text-xl font-semibold text-slate-900">
          {line.slice(3)}
        </h2>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      nodes.push(
        <h1 key={`h1-${index}`} className="text-2xl font-semibold tracking-tight text-slate-950">
          {line.slice(2)}
        </h1>,
      );
      index += 1;
      continue;
    }

    if (isBulletLine(line)) {
      const items: string[] = [];
      while (index < lines.length && isBulletLine(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^[-*]\s+/, ""));
        index += 1;
      }
      nodes.push(
        <ul key={`ul-${index}`} className="space-y-2 ps-5 text-[15px] leading-8 text-slate-700 sm:text-base">
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`} className="list-disc">
              {item}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (isOrderedLine(line)) {
      const items: string[] = [];
      while (index < lines.length && isOrderedLine(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      nodes.push(
        <ol key={`ol-${index}`} className="space-y-2 ps-5 text-[15px] leading-8 text-slate-700 sm:text-base">
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`} className="list-decimal">
              {item}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length) {
      const nextLine = lines[index]?.trim() ?? "";
      if (!nextLine || nextLine.startsWith("#") || isBulletLine(nextLine) || isOrderedLine(nextLine)) {
        break;
      }
      paragraphLines.push(nextLine);
      index += 1;
    }
    nodes.push(renderParagraph(paragraphLines.join(" "), `p-${index}`));
  }

  return <div className={cn("space-y-4", className)}>{nodes}</div>;
}
