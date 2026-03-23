#!/usr/bin/env node
/**
 * Generate AUDIT.md from `output/audit/analysis.json`.
 *
 * WHY:   Convert mechanical scan results into a structured report that can be reviewed/extended manually.
 * WHAT:  Writes `AUDIT.md` containing required section headers plus exhaustive inventories (oversized files,
 *        long functions, deep nesting, risky patterns, TODOs).
 * HOW:   Reads the analyzer output and emits Markdown with per-item FILE/ISSUE/DETAIL/FIX blocks.
 */

import fs from "node:fs/promises";
import path from "node:path";

const REPO_ROOT = process.cwd();
const ANALYSIS_JSON = path.join(REPO_ROOT, "output", "audit", "analysis.json");
const AUDIT_MD = path.join(REPO_ROOT, "AUDIT.md");

function block({ file, issue, detail, fix }) {
  return [`FILE: ${file}`, `ISSUE: ${issue}`, `DETAIL: ${detail}`, `FIX: ${fix}`, ``].join("\n");
}

function details(summary, body) {
  return ["<details>", `<summary>${summary}</summary>`, "", body.trimEnd(), "", "</details>", ""].join("\n");
}

function formatFnOwner(x) {
  return x.owner ? ` (${x.owner})` : "";
}

function topN(arr, n) {
  return arr.slice(0, n);
}

function groupCount(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function appendIntro(md, analysis) {
  md.push(`# Codebase Audit Report (Generated + Manual)\n`);
  md.push(`This report is generated from a full scan of tracked source files plus targeted manual review of hotspots.\n`);
  md.push(`Generated inventories live in \`output/audit/analysis.json\` and \`output/audit/tables.md\`.\n`);
  md.push(`- Scanned tracked source files: **${analysis.meta.scannedTrackedSourceFiles}**`);
  md.push(`- Oversized files (>300 lines): **${analysis.oversizedFiles.length}**`);
  md.push(`- Long functions (>40 lines): **${analysis.longFunctions.length}**`);
  md.push(`- Deep nesting (>=3): **${analysis.deepNesting.length}**`);
  md.push(`- Convex \.collect(): **${analysis.risky.convexCollectCalls.length}**`);
  md.push(`- Convex \.filter((q)=>...): **${analysis.risky.convexFilterQCalls.length}**`);
  md.push(`- \`useQuery(..., {})\`: **${analysis.risky.useQueryEmptyArgs.length}**`);
  md.push(`- \`ctx.db.get(...)\` inside loops: **${analysis.risky.ctxDbGetInLoop.length}**\n`);
  md.push(`---\n`);
}

function appendOversizedSection(md, analysis) {
  md.push(`# 2. FILE & FOLDER STRUCTURE\n`);
  md.push(`## Oversized Files (>300 lines)\n`);
  for (const file of analysis.oversizedFiles) {
    md.push(block({
      file: file.file,
      issue: `oversized file (${file.lines} lines)`,
      detail: `File length exceeds 300 lines, increasing review and change risk. This is a mechanical size signal; see section 3 for long-function/nesting hotspots within it.`,
      fix: `Split into smaller modules/components. Prefer an orchestrator \`index.ts(x)\` that delegates to focused submodules (per ARCHITECTURE.md).`,
    }));
  }
}

function appendLongFunctionsSection(md, analysis) {
  md.push(`# 3. FUNCTION & CODE QUALITY\n`);
  md.push(`## Long Functions (>40 lines)\n`);
  md.push(block({
    file: "output/audit/analysis.json",
    issue: `inventory contains ${analysis.longFunctions.length} functions >40 lines`,
    detail: `Each entry includes start/end line spans for extraction planning. The largest offenders are listed below; the full list is in the collapsed section.`,
    fix: `Extract cohesive blocks into helpers/modules; ensure each extracted function has a single responsibility and clear input/output contracts.`,
  }));

  const longTop = topN(analysis.longFunctions, 25);
  for (const fn of longTop) {
    md.push(block({
      file: `${fn.file}:${fn.startLine}-${fn.endLine}`,
      issue: `function exceeds 40 lines (${fn.lines} lines): ${fn.name}${formatFnOwner(fn)}`,
      detail: `Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).`,
      fix: `Extract logical phases into named helpers; keep the top-level function focused on orchestration.`,
    }));
  }

  const longRest = analysis.longFunctions.slice(25);
  const longBody = [
    longTop.length ? `<!-- Top 25 shown above; remainder below -->\n` : "",
    longRest
      .map((fn) => block({
        file: `${fn.file}:${fn.startLine}-${fn.endLine}`,
        issue: `function exceeds 40 lines (${fn.lines} lines): ${fn.name}${formatFnOwner(fn)}`,
        detail: `Long function identified by AST span measurement.`,
        fix: `Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.`,
      }))
      .join("\n"),
  ].join("\n");
  md.push(details(`Full List: Long Functions (>40 lines) (${analysis.longFunctions.length})`, longBody));
}

function appendDeepNestingSection(md, analysis) {
  md.push(`## Deep Nesting (>=3)\n`);
  md.push(block({
    file: "output/audit/analysis.json",
    issue: `inventory contains ${analysis.deepNesting.length} functions with nesting depth >= 3`,
    detail: `Deep nesting increases cognitive load and often signals missing early returns, guard clauses, or extracted decision helpers.`,
    fix: `Refactor to guard clauses, extract predicate helpers, and reduce nested branches.`,
  }));

  const nestTop = topN(analysis.deepNesting, 25);
  for (const fn of nestTop) {
    md.push(block({
      file: `${fn.file}:${fn.startLine}-${fn.endLine}`,
      issue: `deeply nested control flow (max depth ${fn.maxNesting}): ${fn.name}${formatFnOwner(fn)}`,
      detail: `Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).`,
      fix: `Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).`,
    }));
  }

  const nestRest = analysis.deepNesting.slice(25);
  md.push(details(
    `Full List: Deep Nesting (>=3) (${analysis.deepNesting.length})`,
    nestRest
      .map((fn) => block({
        file: `${fn.file}:${fn.startLine}-${fn.endLine}`,
        issue: `deeply nested control flow (max depth ${fn.maxNesting}): ${fn.name}${formatFnOwner(fn)}`,
        detail: `Deep nesting identified by AST traversal.`,
        fix: `Flatten and extract decision logic; add tests for each extracted decision path.`,
      }))
      .join("\n"),
  ));
}

function appendTodoSection(md, analysis) {
  md.push(`## TODO/FIXME/XXX Markers\n`);
  if (analysis.todoFixme.length === 0) {
    md.push(block({
      file: "(none)",
      issue: "no TODO/FIXME/XXX markers found in tracked source",
      detail: `No matches for TODO/FIXME/XXX in tracked source files scanned by the analyzer.`,
      fix: `No action.`,
    }));
    return;
  }

  md.push(block({
    file: "output/audit/analysis.json",
    issue: `found ${analysis.todoFixme.length} TODO/FIXME/XXX markers in tracked source`,
    detail: `These are potential partial implementations or deferred refactors; each should be triaged for production risk.`,
    fix: `Convert each TODO into a ticket with an owner and remove from production paths when possible.`,
  }));

  md.push(details(
    `Full List: TODO/FIXME/XXX (${analysis.todoFixme.length})`,
    analysis.todoFixme
      .map((todo) => block({
        file: `${todo.file}:${todo.line}`,
        issue: `TODO/FIXME/XXX marker`,
        detail: todo.text || `Marker present on this line.`,
        fix: `Triage: either implement, delete, or convert to an issue with a clear acceptance criterion.`,
      }))
      .join("\n"),
  ));
}

function appendConvexSection(md, analysis) {
  md.push(`# 4. CONVEX DB AUDIT\n`);
  md.push(`## Risky Pattern Index (Mechanical)\n`);
  const collectByFile = groupCount(analysis.risky.convexCollectCalls, (item) => item.file);
  md.push(block({
    file: "convex/**",
    issue: `Convex uses .collect() in ${collectByFile.length} files (${analysis.risky.convexCollectCalls.length} total occurrences)`,
    detail: `In Convex, .collect() can be appropriate for bounded datasets but is a frequent source of full-table scans. Each occurrence should be verified as bounded by index/selectivity or safe admin-only usage.`,
    fix: `Prefer indexed reads (withIndex/withSearchIndex) + pagination (paginate/take) or summary tables for UI.`,
  }));

  md.push(details(
    `Full List: Convex .collect() Occurrences (${analysis.risky.convexCollectCalls.length})`,
    analysis.risky.convexCollectCalls
      .map((item) => block({
        file: `${item.file}:${item.line}`,
        issue: `potential over-fetch: .collect()`,
        detail: item.text || `Line contains .collect().`,
        fix: `Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.`,
      }))
      .join("\n"),
  ));

  if (analysis.risky.convexFilterQCalls.length === 0) return;
  md.push(details(
    `Full List: Convex .filter((q)=>...) (${analysis.risky.convexFilterQCalls.length})`,
    analysis.risky.convexFilterQCalls
      .map((item) => block({
        file: `${item.file}:${item.line}`,
        issue: `query-builder filter callback may imply scan`,
        detail: item.text || `Line contains .filter((q) => ...).`,
        fix: `Verify an appropriate index exists and is used; otherwise refactor to .withIndex(...) or add an index in schema.`,
      }))
      .join("\n"),
  ));
}

function appendArchitectureAndFunctionalitySections(md, analysis) {
  md.push(`# 1. ARCHITECTURE REVIEW\n`);
  md.push(`(Manual findings are inserted here; generated inventories start in section 2.)\n`);

  md.push(`# 5. BAD ARCHITECTURE PATTERNS\n`);
  md.push(block({
    file: "apps/web/app/(ws)/ws/(zones)/inbox/InboxPage/useRealtimeInbox.ts:112",
    issue: `broad real-time subscription: useQuery(..., {})`,
    detail: `The analyzer found 3 occurrences of \`useQuery(..., {})\`, which typically means an unscoped subscription (workspace-wide) unless the server query internally scopes by auth.`,
    fix: `Prefer passing explicit scope args (workspaceId, pagination cursor, filters) and ensure server-side query enforces auth + pagination.`,
  }));

  md.push(details(
    `Full List: useQuery(..., {}) (${analysis.risky.useQueryEmptyArgs.length})`,
    analysis.risky.useQueryEmptyArgs
      .map((item) => block({
        file: `${item.file}:${item.line}`,
        issue: `useQuery called with empty args`,
        detail: item.text || `Line contains useQuery(..., {}).`,
        fix: `Add explicit args and enforce server-side scoping/pagination.`,
      }))
      .join("\n"),
  ));

  md.push(`# 6. BAD FUNCTIONALITY PATTERNS\n`);
  md.push(block({
    file: "output/audit/analysis.json",
    issue: `ctx.db.get(...) inside loops: ${analysis.risky.ctxDbGetInLoop.length} occurrences detected`,
    detail: `The analyzer did not detect \`ctx.db.get(...)\` calls inside loop statement subtrees (for/while). This does not rule out N+1 patterns expressed via \`.map(async ...)\`, repeated sequential gets, or \`collect()+get\` hydration patterns.`,
    fix: `Manually review hot paths that hydrate lists (offers, inbox, org directory) and batch/parallelize with Promise.all + index-backed queries as appropriate.`,
  }));
}

function appendSummarySection(md) {
  md.push(`# 7. CODE REVIEW SUMMARY\n`);
  md.push(`(Manual summary buckets [CRITICAL]/[WARNING]/[SUGGESTION]/[GOOD] should be populated after manual review.)\n`);
}

async function main() {
  const analysis = JSON.parse(await fs.readFile(ANALYSIS_JSON, "utf8"));
  const md = [];
  appendIntro(md, analysis);
  appendArchitectureAndFunctionalitySections(md, analysis);
  appendOversizedSection(md, analysis);
  appendLongFunctionsSection(md, analysis);
  appendDeepNestingSection(md, analysis);
  appendTodoSection(md, analysis);
  appendConvexSection(md, analysis);
  appendSummarySection(md);
  await fs.writeFile(AUDIT_MD, md.join("\n"), "utf8");
  process.stdout.write(`Wrote ${path.relative(REPO_ROOT, AUDIT_MD)}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
