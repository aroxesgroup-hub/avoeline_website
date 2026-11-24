/**
 * Stage 6: ban chromatic Tailwind utilities and hard-rail leftovers in src TS/TSX.
 * Prefer theme tokens (text-danger, bg-danger-soft, series-*, rail-*, ink/line).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");

const CHROMATIC =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

/**
 * Match Tailwind-like utility tokens (optionally with variants like dark:hover:).
 * Captures the full token including variants.
 */
const CHROMATIC_CLASS = new RegExp(
  `\\b((?:[a-z-]+:)*(?:text|bg|border|ring|from|to|via|outline|fill|stroke|decoration|accent|divide|caret|placeholder)-(?:${CHROMATIC})-(?:[0-9]{2,3})(?:\\/[0-9]+)?)\\b`,
  "g",
);

const HARD_RAIL = /\b((?:[a-z-]+:)*(?:from-gray-900|to-gray-950|accent-gray-900))\b/g;

const HOVER_BRIGHTNESS = /\b((?:[a-z-]+:)*hover:brightness-[^\s"'`]+)/g;

const ALLOWLIST = new Set([
  path.normalize(path.join(SRC, "shared_components", "ui", "BrandMark.tsx")),
]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === "node_modules" || name.name === ".next") continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(name.name)) {
      out.push(full);
    }
  }
  return out;
}

function collectMatches(text, re) {
  const hits = [];
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    hits.push({ token: m[1], index: m.index });
  }
  return hits;
}

function lineOf(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

const offenders = [];
for (const file of walk(SRC)) {
  if (ALLOWLIST.has(path.normalize(file))) continue;
  const text = fs.readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const hits = [
    ...collectMatches(text, CHROMATIC_CLASS),
    ...collectMatches(text, HARD_RAIL),
    ...collectMatches(text, HOVER_BRIGHTNESS),
  ];
  for (const h of hits) {
    offenders.push(`${rel}:${lineOf(text, h.index)}  ${h.token}`);
  }
}

if (offenders.length) {
  console.error(
    `Hard-color check failed (${offenders.length} hit${offenders.length === 1 ? "" : "s"}):\n` +
      offenders.map((o) => `  ${o}`).join("\n") +
      "\n\nUse theme tokens (text-danger, bg-danger-soft, series-*, rail-*, ink/line). See docs/design-system.md.",
  );
  process.exit(1);
}

console.log("Hard-color check: ok");
