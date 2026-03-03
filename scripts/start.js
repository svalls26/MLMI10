/**
 * scripts/start.js
 * ─────────────────
 * Starts DialogLab (server + client) and opens the quiz scene automatically.
 * No additional processes — just DialogLab running as normal.
 *
 * Run: npm start
 */

import { spawn }          from "child_process";
import { join, dirname }  from "path";
import { fileURLToPath }  from "url";
import { existsSync }     from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");
const DL_DIR    = join(ROOT, "dialoglab");

const R = "\x1b[0m";
const G = (s) => `\x1b[32m${s}${R}`;
const Y = (s) => `\x1b[33m${s}${R}`;
const C = (s) => `\x1b[36m${s}${R}`;
const P = (s) => `\x1b[35m${s}${R}`;
const B = (s) => `\x1b[1m${s}${R}`;

// ── Guard: setup must run first ───────────────────────────────────────────────
if (!existsSync(DL_DIR)) {
  console.error("\x1b[31m✗ DialogLab not found. Run: npm run setup\x1b[0m\n");
  process.exit(1);
}

// ── Guard: DialogLab needs at least one LLM key ───────────────────────────────
import { readFileSync } from "fs";
const dlEnv = join(DL_DIR, "server", ".env");
if (existsSync(dlEnv)) {
  const envContent = readFileSync(dlEnv, "utf8");
  const hasKey = envContent.includes("OPENAI_API_KEY=") || envContent.includes("GEMINI_API_KEY=");
  const isPlaceholder = envContent.includes("your_openai_key_here") && envContent.includes("your_gemini_key_here");
  if (!hasKey || isPlaceholder) {
    console.error(Y("⚠  No LLM key found in dialoglab/server/.env"));
    console.error(Y("   Add OPENAI_API_KEY or GEMINI_API_KEY and try again.\n"));
    process.exit(1);
  }
}

// ── Prefixed log streams ──────────────────────────────────────────────────────
function logger(prefix, colorFn) {
  return (data) =>
    data.toString().trim().split("\n")
      .filter(l => l.trim())
      .forEach(l => console.log(`${colorFn(`[${prefix}]`)} ${l}`));
}

// ── Spawn helper ──────────────────────────────────────────────────────────────
function launch(label, colorFn, cmd, args, cwd) {
  const proc = spawn(cmd, args, { cwd, shell: true });
  const log  = logger(label, colorFn);
  proc.stdout.on("data", log);
  proc.stderr.on("data", log);
  return proc;
}

// ── Banner ────────────────────────────────────────────────────────────────────
console.log(`
${B(C("╔══════════════════════════════════════════╗"))}
${B(C("║  🃏  DialogLab Flashcard Quiz · Starting  ║"))}
${B(C("╚══════════════════════════════════════════╝"))}
`);

const procs = [];

// ── Start DialogLab API server (port 3010) ────────────────────────────────────
console.log(Y("▶ Starting DialogLab server (port 3010)…"));
procs.push(launch("DL-Server", Y, "npm", ["run", "dev"], join(DL_DIR, "server")));

// ── Start DialogLab Vite client (port 5173) ───────────────────────────────────
console.log(G("▶ Starting DialogLab client (port 5173)…"));
procs.push(launch("DL-Client", G, "npm", ["run", "dev"], join(DL_DIR, "client")));

// ── Wait for Vite, then open browser ─────────────────────────────────────────
const QUIZ_URL = "http://localhost:5173/?scene=quiz-scene";

async function waitAndOpen() {
  console.log(C("\n⏳ Waiting for DialogLab client to be ready…\n"));

  const deadline = Date.now() + 40_000;
  let ready = false;

  while (Date.now() < deadline) {
    try {
      const r = await fetch("http://localhost:5173").catch(() => null);
      if (r) { ready = true; break; }
    } catch {}
    await new Promise(r => setTimeout(r, 700));
  }

  if (!ready) {
    console.log(Y(`\n⚠  Client is slow to start. Open manually: ${QUIZ_URL}\n`));
    return;
  }

  // Extra buffer for Vite to finish compiling
  await new Promise(r => setTimeout(r, 1800));

  console.log(`
${B(G("╔══════════════════════════════════════════╗"))}
${B(G("║        ✅  DialogLab is running!          ║"))}
${B(G("╠══════════════════════════════════════════╣"))}
${G("║  Quiz UI  →  http://localhost:5173        ║")}
${G("║  DL API   →  http://localhost:3010        ║")}
${B(G("╚══════════════════════════════════════════╝"))}
`);

  try {
    const { default: open } = await import("open");
    console.log(C("🚀 Opening quiz scene in browser…\n"));
    await open(QUIZ_URL);
  } catch {
    console.log(Y(`→ Open your browser at: ${QUIZ_URL}\n`));
  }
}

waitAndOpen();

// ── Graceful shutdown ─────────────────────────────────────────────────────────
function shutdown() {
  console.log(Y("\n\n⏹  Shutting down DialogLab…"));
  procs.forEach(p => { try { p.kill("SIGTERM"); } catch {} });
  setTimeout(() => process.exit(0), 400);
}

process.on("SIGINT",  shutdown);
process.on("SIGTERM", shutdown);
