import path from "node:path";
import { execSync } from "node:child_process";
import ts from "typescript";

export const CODE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

// Exclude generated/build artifacts and vendor trees from quality findings.
export const IGNORE_PREFIXES = [
  "node_modules/",
  ".git/",
  ".convex/",
  "dist/",
  "build/",
  "coverage/",
  "output/", // keep output directory out of the scan to avoid self-referencing artifacts
  "apps/web/.next/",
  "apps/admin/.next/",
  "apps/mobile/.expo/",
  "apps/mobile/.expo-shared/",
  "convex/_generated/",
];

export function toPosix(p) {
  return p.split(path.sep).join("/");
}

export function isIgnored(relPosixPath) {
  for (const prefix of IGNORE_PREFIXES) {
    if (relPosixPath.startsWith(prefix)) return true;
  }
  return false;
}

export function scriptKindForExt(ext) {
  switch (ext) {
    case ".ts":
      return ts.ScriptKind.TS;
    case ".tsx":
      return ts.ScriptKind.TSX;
    case ".jsx":
      return ts.ScriptKind.JSX;
    case ".js":
    case ".mjs":
    case ".cjs":
      return ts.ScriptKind.JS;
    default:
      return ts.ScriptKind.Unknown;
  }
}

export function safeRel(repoRoot, absPath) {
  const rel = path.relative(repoRoot, absPath);
  return toPosix(rel);
}

export function getLine(sourceFile, pos) {
  return sourceFile.getLineAndCharacterOfPosition(pos).line + 1;
}

export function formatLoc(file, line) {
  return `${file}:${line}`;
}

export function getNearestNamedAncestor(node) {
  let cur = node.parent;
  while (cur) {
    if (ts.isClassDeclaration(cur) && cur.name) return { kind: "class", name: cur.name.text };
    if (ts.isInterfaceDeclaration(cur) && cur.name) return { kind: "interface", name: cur.name.text };
    if (ts.isModuleDeclaration(cur) && cur.name && ts.isIdentifier(cur.name)) return { kind: "module", name: cur.name.text };
    cur = cur.parent;
  }
  return null;
}

export function functionDisplayName(node) {
  if ("name" in node && node.name && ts.isIdentifier(node.name)) return node.name.text;

  if (ts.isConstructorDeclaration(node)) return "constructor";
  if (ts.isMethodDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) {
    const n = node.name;
    if (ts.isIdentifier(n)) return n.text;
    if (ts.isStringLiteral(n)) return n.text;
    if (ts.isNumericLiteral(n)) return n.text;
    return "<method>";
  }

  const parent = node.parent;
  if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) return parent.name.text;
  if (ts.isPropertyAssignment(parent)) {
    const n = parent.name;
    if (ts.isIdentifier(n)) return n.text;
    if (ts.isStringLiteral(n)) return n.text;
    return "<property>";
  }
  if (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
    if (ts.isIdentifier(parent.left)) return parent.left.text;
  }

  return "<anonymous>";
}

function isControlNestingNode(node) {
  return (
    ts.isIfStatement(node) ||
    ts.isForStatement(node) ||
    ts.isForOfStatement(node) ||
    ts.isForInStatement(node) ||
    ts.isWhileStatement(node) ||
    ts.isDoStatement(node) ||
    ts.isSwitchStatement(node) ||
    ts.isTryStatement(node) ||
    ts.isConditionalExpression(node)
  );
}

export function isLoopStatement(node) {
  return (
    ts.isForStatement(node) ||
    ts.isForOfStatement(node) ||
    ts.isForInStatement(node) ||
    ts.isWhileStatement(node) ||
    ts.isDoStatement(node)
  );
}

export function isCtxDbGetCall(node) {
  if (!ts.isCallExpression(node)) return false;
  const expr = node.expression;
  if (!ts.isPropertyAccessExpression(expr)) return false;
  if (expr.name.text !== "get") return false;
  const left = expr.expression;
  if (!ts.isPropertyAccessExpression(left)) return false;
  if (left.name.text !== "db") return false;
  return ts.isIdentifier(left.expression) && left.expression.text === "ctx";
}

export function isUseQueryEmptyArgs(node) {
  if (!ts.isCallExpression(node)) return false;
  const expr = node.expression;
  if (!ts.isIdentifier(expr) || expr.text !== "useQuery") return false;
  if (node.arguments.length < 2) return false;
  const arg = node.arguments[1];
  return ts.isObjectLiteralExpression(arg) && arg.properties.length === 0;
}

export function walk(node, fn) {
  fn(node);
  node.forEachChild((child) => walk(child, fn));
}

export function walkBlockSkippingNestedFunctions(node, fn) {
  const visit = (n) => {
    fn(n);
    n.forEachChild((child) => {
      if (ts.isFunctionLike(child)) return;
      visit(child);
    });
  };
  visit(node);
}

export function computeMaxNesting(functionNode) {
  const body = functionNode.body;
  if (!body) return 0;

  let maxDepth = 0;

  const visit = (node, depth) => {
    maxDepth = Math.max(maxDepth, depth);
    node.forEachChild((child) => {
      if (ts.isFunctionLike(child)) return;
      if (isControlNestingNode(child)) visit(child, depth + 1);
      else visit(child, depth);
    });
  };

  visit(body, 0);
  return maxDepth;
}

export function collectPatternLines(content, pattern) {
  const lines = content.split(/\r?\n/);
  const matches = [];
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      matches.push({ line: i + 1, text: lines[i] });
    }
  }
  return matches;
}

export function listRepoFiles(repoRoot) {
  // Use git's view of the working tree (tracked + untracked, excluding ignored)
  // so gates don't miss newly-added source files during refactors.
  const buf = execSync("git ls-files -z -co --exclude-standard", { cwd: repoRoot });
  return buf.toString("utf8").split("\0").filter(Boolean);
}

