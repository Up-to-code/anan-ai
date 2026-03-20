/**
 * Convex test setup. Provides modules for convexTest().
 */
import { readdirSync } from "fs";
import { join, dirname } from "path";
import { pathToFileURL } from "url";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function shouldWalkDirectory(name: string) {
  return !name.startsWith(".") && name !== "node_modules";
}

function shouldLoadModuleFile(name: string) {
  return (
    /\.(ts|js)$/.test(name) &&
    !name.endsWith(".d.ts") &&
    !name.includes(".test.") &&
    !name.includes("test.setup")
  );
}

function loadModulesFallback(): Record<string, () => Promise<unknown>> {
  const modules: Record<string, () => Promise<unknown>> = {};
  function walk(dir: string, base = ""): void {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const rel = base ? `${base}/${e.name}` : e.name;
      if (e.isDirectory() && shouldWalkDirectory(e.name)) {
        walk(join(dir, e.name), rel);
        continue;
      }
      if (!e.isFile() || !shouldLoadModuleFile(e.name)) continue;
      const key = "./" + rel;
      const fullPath = join(dir, e.name);
      modules[key] = () => import(pathToFileURL(fullPath).href);
    }
  }
  walk(__dirname);
  return modules;
}

export const modules = loadModulesFallback();
