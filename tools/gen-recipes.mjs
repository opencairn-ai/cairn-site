// Writes public/js/recipes-data.js from the recipes of a cairn-stack checkout.
//
//   node tools/gen-recipes.mjs <path to cairn-stack> [output file]
//
// The site holds no recipe content of its own. Every value in the data file
// comes from the stack repository:
//   - the recipe path:            hardware, model, publisher, model server
//   - README.md:                  the names to show, the example mark, the source
//   - model-server-config.yaml:   the facts that become tags
//   - compose.yaml:               the model server image (or the default image
//                                 in docker/compose-<server>.yaml)
//   - .env.example:               the recipe that the page opens on
// A new recipe folder needs no change here. A new model server, or a new kind
// of tag, needs one new entry in FACT_KEYS.
//
// No dependencies: the script reads the few YAML keys it needs with patterns.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [stackRoot, outArg] = process.argv.slice(2);
if (!stackRoot) {
  console.error("Usage: node tools/gen-recipes.mjs <path to cairn-stack> [output file]");
  process.exit(1);
}
const outFile = outArg || join(dirname(fileURLToPath(import.meta.url)), "..", "public", "js", "recipes-data.js");
const recipesRoot = join(stackRoot, "recipes");

// The files of a recipe, in the order of the tabs on the page.
const FILE_ORDER = ["README.md", "model-server-config.yaml", "compose.yaml", ".env"];

// The keys of model-server-config.yaml that state each fact. Model servers name
// the same option differently, so each fact lists the key of each server.
const FACT_KEYS = {
  context: ["max-model-len", "context-length"],
  tools: ["tool-call-parser"],
  reasoning: ["reasoning-parser"],
  speculative: ["speculative-config", "speculative-algorithm"],
  parallel: ["max-num-seqs", "max-running-requests"],
  gpus: ["tensor-parallel-size"],
};

const read = (path) => readFileSync(path, "utf8");
const dirs = (path) => readdirSync(path, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();

// The top-level `key: value` pairs of a YAML file. Comments and nested keys are left out.
function topLevel(yaml) {
  const out = {};
  for (const line of yaml.split("\n")) {
    const m = /^([A-Za-z0-9_-]+):\s*(.*?)\s*(?:#.*)?$/.exec(line);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

// The image of the `model-server` service in a compose file. Other services are ignored.
function modelServerImage(yaml) {
  const lines = yaml.split("\n");
  const start = lines.findIndex((line) => /^\s+model-server:\s*$/.test(line));
  if (start < 0) return null;
  const indent = lines[start].search(/\S/);
  for (const line of lines.slice(start + 1)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (line.search(/\S/) <= indent) break; // The next service, or the end of `services`.
    const m = /^\s+image:\s*(\S+)/.exec(line);
    if (m) return m[1];
  }
  return null;
}

const firstValue = (config, keys) => keys.map((key) => config[key]).find((value) => value !== undefined);
const number = (value) => (value === undefined || value === "" || Number.isNaN(Number(value)) ? null : Number(value));

const recipes = [];
for (const hardware of dirs(recipesRoot)) {
  for (const model of dirs(join(recipesRoot, hardware))) {
    for (const publisher of dirs(join(recipesRoot, hardware, model))) {
      for (const server of dirs(join(recipesRoot, hardware, model, publisher))) {
        const dir = join(recipesRoot, hardware, model, publisher, server);
        // A recipe is a folder with a compose.yaml file: the same rule as model-selection.sh.
        if (!existsSync(join(dir, "compose.yaml"))) continue;

        const files = FILE_ORDER.filter((name) => existsSync(join(dir, name)))
          .map((name) => ({ name, text: read(join(dir, name)).replace(/\s+$/, "") }));
        const text = (name) => (files.find((file) => file.name === name) || {}).text || "";

        // README.md starts with "# <model> - <server> on <hardware>" and can have a "Source:" line.
        // Without that heading, the page shows the folder names.
        const readme = text("README.md");
        const heading = /^#\s+(.+?)\s+-\s+(.+?)\s+on\s+(.+)$/m.exec(readme) || [];
        const config = topLevel(text("model-server-config.yaml"));
        const defaultCompose = join(stackRoot, "docker", `compose-${server}.yaml`);

        recipes.push({
          id: `${hardware}/${model}/${publisher}/${server}`,
          hardware, model, publisher, server,
          hardwareLabel: heading[3] || hardware,
          serverLabel: heading[2] || server,
          example: /example recipe/i.test(readme),
          source: (/^Source:\s*(\S+)/m.exec(readme) || [])[1] || null,
          image: modelServerImage(text("compose.yaml")) || (existsSync(defaultCompose) ? modelServerImage(read(defaultCompose)) : null),
          facts: {
            context: number(firstValue(config, FACT_KEYS.context)),
            tools: firstValue(config, FACT_KEYS.tools) !== undefined,
            reasoning: firstValue(config, FACT_KEYS.reasoning) !== undefined,
            speculative: firstValue(config, FACT_KEYS.speculative) !== undefined,
            parallel: number(firstValue(config, FACT_KEYS.parallel)),
            gpus: number(firstValue(config, FACT_KEYS.gpus)),
          },
          files,
        });
      }
    }
  }
}

if (!recipes.length) {
  console.error(`No recipe found in ${recipesRoot}.`);
  process.exit(1);
}

// The recipe that .env.example selects: the one a new user starts with.
const example = Object.fromEntries([...read(join(stackRoot, ".env.example")).matchAll(/^([A-Z_]+)=(\S*)/gm)].map((m) => [m[1], m[2]]));
const defaultId = ["HARDWARE_TARGET", "MODEL_NAME", "MODEL_ORG", "MODEL_SERVER"].map((key) => example[key]).join("/");

// A folder that is not a git checkout has no commit: the data file then says "unknown".
const git = (...args) => {
  try { return execFileSync("git", ["-C", stackRoot, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { return "unknown"; }
};

const data = {
  repo: "https://github.com/opencairn-ai/cairn-stack",
  branch: "main",
  commit: git("rev-parse", "--short", "HEAD"),
  commitDate: git("log", "-1", "--format=%cs"),
  defaultId: recipes.some((recipe) => recipe.id === defaultId) ? defaultId : recipes[0].id,
  recipes,
};

writeFileSync(outFile, [
  `// Generated by tools/gen-recipes.mjs from cairn-stack@${data.commit} (${data.commitDate}).`,
  "// Do not edit this file. Change the recipes in the stack repository, then run the script again.",
  `window.CAIRN_RECIPES = ${JSON.stringify(data, null, 2)};`,
  "",
].join("\n"));

console.log(`${recipes.length} recipes from cairn-stack@${data.commit} (${data.commitDate}) -> ${outFile}`);
for (const recipe of recipes) {
  const facts = Object.entries(recipe.facts).filter(([, value]) => value).map(([key, value]) => (value === true ? key : `${key}=${value}`));
  console.log(`  ${recipe.id}  [${recipe.serverLabel} on ${recipe.hardwareLabel}]  ${recipe.image}  ${facts.join(", ")}${recipe.example ? "  (example)" : ""}`);
}
