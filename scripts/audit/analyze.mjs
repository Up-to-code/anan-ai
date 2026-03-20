#!/usr/bin/env node
/**
 * Repo Audit Analyzer
 *
 * WHY:   Generate objective hotspot lists (oversized files, long functions, deep nesting, risky patterns)
 *        to power a code-referenced architecture audit.
 * WHAT:  Scans tracked source files (excluding generated/build artifacts) and writes:
 *        - `output/audit/analysis.json` (machine-readable)
 *        - `output/audit/tables.md` (Markdown tables/snippets to paste into AUDIT.md)
 * HOW:   Uses the TypeScript compiler API to parse TS/JS/TSX/JSX and compute function spans and nesting depth,
 *        plus lightweight line-based pattern indexing for known risky patterns.
 */

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import ts from "typescript";
import {
  CODE_EXTS,
  IGNORE_PREFIXES,
  collectPatternLines,
  computeMaxNesting,
  functionDisplayName,
  getLine,
  getNearestNamedAncestor,
  isCtxDbGetCall,
  isIgnored,
  isLoopStatement,
  isUseQueryEmptyArgs,
  listRepoFiles,
  safeRel,
  scriptKindForExt,
  toPosix,
  walk,
  walkBlockSkippingNestedFunctions,
} from "./analyzeLib.mjs";
import { buildAuditTablesMarkdown } from "./analyzeTables.mjs";

const REPO_ROOT = process.cwd();
const OUTPUT_DIR = path.join(REPO_ROOT, "output", "audit");
const OUTPUT_JSON = path.join(OUTPUT_DIR, "analysis.json");
const OUTPUT_TABLES = path.join(OUTPUT_DIR, "tables.md");

function createAccumulator() {
  return {
    oversizedFiles: [],
    longFunctions: [],
    deepNesting: [],
    todoFixme: [],
    convexCollectCalls: [],
    convexFilterQCalls: [],
    useQueryEmptyArgs: [],
    ctxDbGetInLoop: [],
  };
}

async function ensureDir(dir) {
  if (!fsSync.existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function readUtf8Safe(abs) {
  try {
    return await fs.readFile(abs, "utf8");
  } catch {
    return null;
  }
}

function indexOversized(rel, content, acc) {
  const lineCount = content.split(/\r?\n/).length;
  if (lineCount > 300) {
    acc.oversizedFiles.push({ file: rel, lines: lineCount });
  }
}

function indexTodoFixme(rel, content, acc) {
  for (const match of collectPatternLines(content, /\b(TODO|FIXME|XXX)\b/)) {
    acc.todoFixme.push({ file: rel, line: match.line, text: match.text.trim() });
  }
}

function indexConvexRiskyPatterns(rel, content, acc) {
  if (!rel.startsWith("convex/")) return;
  for (const match of collectPatternLines(content, /\.collect\(\)/)) {
    acc.convexCollectCalls.push({ file: rel, line: match.line, text: match.text.trim() });
  }
  for (const match of collectPatternLines(content, /\.filter\(\(q\)\s*=>/)) {
    acc.convexFilterQCalls.push({ file: rel, line: match.line, text: match.text.trim() });
  }
}

function createSourceFile(rel, content) {
  const ext = path.extname(rel);
  return ts.createSourceFile(rel, content, ts.ScriptTarget.Latest, true, scriptKindForExt(ext));
}

function getLineText(content, line) {
  return content.split(/\r?\n/)[line - 1]?.trim() ?? "";
}

function indexUseQueryEmptyArgs(rel, content, sourceFile, acc) {
  walk(sourceFile, (node) => {
    if (!isUseQueryEmptyArgs(node)) return;
    const line = getLine(sourceFile, node.getStart(sourceFile, true));
    acc.useQueryEmptyArgs.push({ file: rel, line, text: getLineText(content, line) });
  });
}

function buildFunctionMetadata(sourceFile, node) {
  const startLine = getLine(sourceFile, node.getStart(sourceFile, true));
  const endLine = getLine(sourceFile, node.end);
  const lines = Math.max(1, endLine - startLine + 1);
  const name = functionDisplayName(node);
  const owner = getNearestNamedAncestor(node);
  return {
    startLine,
    endLine,
    lines,
    name,
    owner: owner ? `${owner.kind}:${owner.name}` : null,
  };
}

function indexLongAndDeepFunctions(rel, nodeMeta, node, acc) {
  if (nodeMeta.lines > 40) {
    acc.longFunctions.push({
      file: rel,
      name: nodeMeta.name,
      owner: nodeMeta.owner,
      startLine: nodeMeta.startLine,
      endLine: nodeMeta.endLine,
      lines: nodeMeta.lines,
    });
  }
  const maxNesting = computeMaxNesting(node);
  if (maxNesting >= 3) {
    acc.deepNesting.push({
      file: rel,
      name: nodeMeta.name,
      owner: nodeMeta.owner,
      startLine: nodeMeta.startLine,
      endLine: nodeMeta.endLine,
      maxNesting,
    });
  }
}

function indexCtxDbGetInLoop(rel, content, sourceFile, fnNode, fnMeta, acc) {
  const loops = [];
  walkBlockSkippingNestedFunctions(fnNode.body, (inner) => {
    if (isLoopStatement(inner)) loops.push(inner);
  });
  for (const loop of loops) {
    walkBlockSkippingNestedFunctions(loop, (inner) => {
      if (!isCtxDbGetCall(inner)) return;
      const line = getLine(sourceFile, inner.getStart(sourceFile, true));
      acc.ctxDbGetInLoop.push({
        file: rel,
        function: fnMeta.name,
        startLine: fnMeta.startLine,
        callLine: line,
        text: getLineText(content, line),
      });
    });
  }
}

function indexFunctionHotspots(rel, content, sourceFile, acc) {
  walk(sourceFile, (node) => {
    if (!ts.isFunctionLike(node) || !node.body) return;
    const meta = buildFunctionMetadata(sourceFile, node);
    indexLongAndDeepFunctions(rel, meta, node, acc);
    indexCtxDbGetInLoop(rel, content, sourceFile, node, meta, acc);
  });
}

async function scanSourceFile(rel, acc) {
  const abs = path.join(REPO_ROOT, rel);
  const content = await readUtf8Safe(abs);
  if (!content) return;
  indexOversized(rel, content, acc);
  indexTodoFixme(rel, content, acc);
  indexConvexRiskyPatterns(rel, content, acc);
  const sourceFile = createSourceFile(rel, content);
  indexUseQueryEmptyArgs(rel, content, sourceFile, acc);
  indexFunctionHotspots(rel, content, sourceFile, acc);
}

function sortAccumulator(acc) {
  acc.oversizedFiles.sort((a, b) => b.lines - a.lines || a.file.localeCompare(b.file));
  acc.longFunctions.sort((a, b) => b.lines - a.lines || a.file.localeCompare(b.file) || a.startLine - b.startLine);
  acc.deepNesting.sort((a, b) => b.maxNesting - a.maxNesting || a.file.localeCompare(b.file) || a.startLine - b.startLine);
  acc.todoFixme.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  acc.convexCollectCalls.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  acc.convexFilterQCalls.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  acc.useQueryEmptyArgs.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  acc.ctxDbGetInLoop.sort((a, b) => a.file.localeCompare(b.file) || a.callLine - b.callLine);
}

function buildAnalysis(sourceFiles, acc) {
  return {
    meta: {
      repoRoot: REPO_ROOT,
      scannedTrackedSourceFiles: sourceFiles.length,
      ignorePrefixes: IGNORE_PREFIXES,
    },
    oversizedFiles: acc.oversizedFiles,
    longFunctions: acc.longFunctions,
    deepNesting: acc.deepNesting,
    todoFixme: acc.todoFixme,
    risky: {
      convexCollectCalls: acc.convexCollectCalls,
      convexFilterQCalls: acc.convexFilterQCalls,
      useQueryEmptyArgs: acc.useQueryEmptyArgs,
      ctxDbGetInLoop: acc.ctxDbGetInLoop,
    },
  };
}

function listSourceFiles() {
  return listRepoFiles(REPO_ROOT)
    .filter((file) => CODE_EXTS.has(path.extname(file)))
    .map((file) => toPosix(file))
    .filter((file) => !isIgnored(file));
}

async function writeOutputs(analysis, scannedSourceFiles) {
  await ensureDir(OUTPUT_DIR);
  await fs.writeFile(OUTPUT_JSON, JSON.stringify(analysis, null, 2), "utf8");
  const tablesMd = buildAuditTablesMarkdown({ scannedSourceFiles, analysis });
  await fs.writeFile(OUTPUT_TABLES, tablesMd, "utf8");
}

function printSummary(analysis) {
  process.stdout.write(
    [
      `Wrote ${safeRel(REPO_ROOT, OUTPUT_JSON)}`,
      `Wrote ${safeRel(REPO_ROOT, OUTPUT_TABLES)}`,
      `Oversized: ${analysis.oversizedFiles.length}, Long functions: ${analysis.longFunctions.length}, Deep nesting: ${analysis.deepNesting.length}`,
    ].join("\n") + "\n",
  );
}

async function main() {
  const sourceFiles = listSourceFiles();
  const acc = createAccumulator();
  for (const rel of sourceFiles) {
    await scanSourceFile(rel, acc);
  }
  sortAccumulator(acc);
  const analysis = buildAnalysis(sourceFiles, acc);
  await writeOutputs(analysis, sourceFiles.length);
  printSummary(analysis);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
