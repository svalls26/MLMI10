/**
 * scripts/setup.js
 * ─────────────────
 * One-time setup:
 *   1. Clones DialogLab if not already present
 *   2. Installs its dependencies
 *   3. Copies the quiz scene into DialogLab's content directory
 *   4. Injects the Claude bridge config into DialogLab's server config
 *   5. Creates a .env template if none exists
 */

import { execSync, spawnSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");
const DL_DIR    = join(ROOT, "dialoglab");
const REPO_URL  = "https://github.com/ecruhue/DialogLab.git";

const GREEN  = (s) => `\x1b[32m${s}\x1b[0m`;
const YELLOW = (s) => `\x1b[33m${s}\x1b[0m`;
const CYAN   = (s) => `\x1b[36m${s}\x1b[0m`;
const BOLD   = (s) => `\x1b[1m${s}\x1b[0m`;

console.log(BOLD(CYAN("\n🃏  DialogLab Flashcard Quiz — Setup\n")));

// ── 1. Clone DialogLab ────────────────────────────────────────────────────────
if (existsSync(DL_DIR)) {
  console.log(GREEN("✓ DialogLab already cloned — skipping"));
} else {
  console.log(YELLOW("⬇  Cloning DialogLab…"));
  execSync(`git clone ${REPO_URL} ${DL_DIR}`, { stdio: "inherit" });
  console.log(GREEN("✓ DialogLab cloned"));
}

// ── 2. Install DialogLab dependencies ─────────────────────────────────────────
const clientPkg  = join(DL_DIR, "client", "package.json");
const serverPkg  = join(DL_DIR, "server", "package.json");
const clientNM   = join(DL_DIR, "client", "node_modules");
const serverNM   = join(DL_DIR, "server", "node_modules");

if (!existsSync(clientNM)) {
  console.log(YELLOW("📦  Installing DialogLab client dependencies…"));
  execSync("npm install", { cwd: join(DL_DIR, "client"), stdio: "inherit" });
  console.log(GREEN("✓ Client deps installed"));
}

if (!existsSync(serverNM)) {
  console.log(YELLOW("📦  Installing DialogLab server dependencies…"));
  execSync("npm install", { cwd: join(DL_DIR, "server"), stdio: "inherit" });
  console.log(GREEN("✓ Server deps installed"));
}

// ── 3. Copy quiz scene into DialogLab's content folder ────────────────────────
const contentDir  = join(DL_DIR, "content");
const sceneSource = join(ROOT, "scene", "quiz-scene.json");
const sceneDest   = join(contentDir, "quiz-scene.json");

mkdirSync(contentDir, { recursive: true });
copyFileSync(sceneSource, sceneDest);
console.log(GREEN("✓ Quiz scene copied → dialoglab/content/quiz-scene.json"));

// ── 4. Inject auto-load config into DialogLab client ─────────────────────────
// DialogLab reads a runtime config to know which scene to load on boot.
// We write/overwrite the autoload config so the quiz scene is preselected.
const clientPublic    = join(DL_DIR, "client", "public");
const autoloadConfig  = join(clientPublic, "autoload.json");
mkdirSync(clientPublic, { recursive: true });

writeFileSync(autoloadConfig, JSON.stringify({
  autoload: true,
  scene:    "quiz-scene",
  modelEndpoint: "http://localhost:3011/v1/chat/completions"
}, null, 2));
console.log(GREEN("✓ Auto-load config written → dialoglab/client/public/autoload.json"));

// ── 5. Register Claude bridge as LLM provider in DialogLab server config ─────
const serverConfigPath = join(DL_DIR, "server", "config.json");
const serverConfig = existsSync(serverConfigPath)
  ? JSON.parse(readFileSync(serverConfigPath, "utf8"))
  : {};

serverConfig.llmProviders = serverConfig.llmProviders || [];
const alreadyRegistered = serverConfig.llmProviders.some(p => p.id === "claude-proxy");
if (!alreadyRegistered) {
  serverConfig.llmProviders.push({
    id:       "claude-proxy",
    name:     "Claude (via Bridge)",
    endpoint: "http://localhost:3011/v1/chat/completions",
    model:    "claude-sonnet-4-20250514"
  });
  writeFileSync(serverConfigPath, JSON.stringify(serverConfig, null, 2));
  console.log(GREEN("✓ Claude bridge registered in DialogLab server config"));
} else {
  console.log(GREEN("✓ Claude bridge already registered — skipping"));
}

// ── 6. Ensure .env exists ─────────────────────────────────────────────────────
const envPath = join(ROOT, ".env");
if (!existsSync(envPath)) {
  writeFileSync(envPath, `# Anthropic API Key — required for Claude quiz master\nANTHROPIC_API_KEY=your_key_here\n`);
  console.log(YELLOW("⚠  Created .env — please add your ANTHROPIC_API_KEY before starting!"));
} else {
  console.log(GREEN("✓ .env found"));
}

console.log(BOLD(GREEN("\n✅  Setup complete! Run: npm start\n")));
