import { getSingletonHighlighter } from "shiki";

export async function highlightCode(code: string, language: string) {
  const shiki = await getSingletonHighlighter({
    themes: ["github-dark"],
    langs: ["typescript", "javascript", "bash", "json", "text"],
  });
  
  const safeLang = ["typescript", "javascript", "bash", "json"].includes(language) ? language : "text";
  
  return shiki.codeToHtml(code, {
    lang: safeLang,
    theme: "github-dark",
  });
}
