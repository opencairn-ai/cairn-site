// The use cases of a recipe: the ontology, the rules, and the benchmark data
// that the rules read. tools/gen-recipes.mjs calls this file.
//
// THE ONTOLOGY
// A use case is a workload pattern: how an application uses the model. It is
// not a subject (legal, finance): a subject is a second facet, not used here.
//
//   chat       A person talks with the model: questions, writing, explanation.
//   coding     The model writes and changes code, in an editor or a coding tool.
//   documents  The model reads documents as images: pages, tables, charts, forms.
// Two more patterns are not in use for now: `tasks` (one bounded job for each
// request) and `agents` (work in many steps with tools).
//
// THE EVIDENCE
// The rules read three sources:
//   - the recipe files (the stack repository): the model, and the reasoning
//     setting.
//   - Hugging Face (https://huggingface.co): the original model of the recipe
//     (`base_model`), its input type, and its rank on the leaderboards of the
//     benchmarks in BENCHMARKS. A rank says how well the model does one kind of work.
//   - Artificial Analysis (https://artificialanalysis.ai): the Intelligence
//     Index of the model, a general score.
//
// THE RULES
// A use case tag says what the recipe fits best, not all that it can do.
// The rules first find the use cases that the recipe reaches:
//   chat       The model is not below the floor.
//   coding     The model is in the top half of a coding leaderboard, and not below the floor.
//   documents  The model is in the top half of a document leaderboard, and it reads images.
// The floor is the first quartile of the Intelligence Index of all the models
// that Artificial Analysis measured. A model with no index is not held below it.
// Then the recipe keeps the most demanding use case that it reaches in DEMAND,
// and `documents` when it reaches it. A recipe that reaches `coding` can also
// do chat, but a smaller model does chat on less hardware: `chat` is not the
// best fit of that recipe.
//
// LIMITS
//   - The leaderboard results are not verified. Most come from the model card
//     of the publisher, and each publisher uses its own test setup.
//   - A model with no result on a leaderboard gets no tag from it: `coding`
//     and `documents` need a result.
//   - The benchmarks measure the original model. A recipe can serve a
//     quantized copy (FP8, NVFP4), which can score lower.

const AA_API = "https://artificialanalysis.ai/api/v2/language/models/free";
const HF_API = "https://huggingface.co/api";

// The use cases, in the order of the page.
export const USE_CASES = ["chat", "coding", "documents"];

// The use cases from the least demanding to the most demanding, and the
// number of these use cases that a recipe keeps.
const DEMAND = ["chat", "coding"];
const BEST_FIT = 1;

// The benchmarks of each use case: dataset names on Hugging Face. To add a
// benchmark, add its name here. A leaderboard that puts more than one metric
// in one list (for example internlm/WildClawBench) gives no clear rank: do not add it.
const BENCHMARKS = {
  coding: [
    "ScaleAI/SWE-bench_Pro",
    "SWE-bench/SWE-bench_Verified",
    "SWE-bench/SWE-bench_Multilingual",
    "datacurve/deep-swe",
    "harborframework/terminal-bench-2.0",
    "harborframework/terminal-bench-2.1",
    "harborframework/terminal-bench",
  ],
  documents: [
    "llamaindex/ParseBench",
    "llamaindex/ParseBench-2",
    "Delores-Lin/MDPBench",
  ],
};

// A leaderboard with fewer models than this gives no rank: the top half of a
// short list says little.
const SMALLEST_LEADERBOARD = 10;

// Marks of a quantized or converted copy at the end of a model name. Hugging
// Face names the original model of a copy; these marks are the fallback for a
// copy that does not.
const COPY_MARKS = /[-_.](fp4|fp8|nvfp4|int4|int8|awq|gptq|gguf|mlx|bnb|exl2|[0-9]+bit|q[0-9]+(_[a-z0-9]+)*)$/i;

// "Qwen3.8-27B-NVFP4" and "Qwen3.8 27B (Xhigh)" give the same key: "qwen3-8-27b".
export function modelKey(name) {
  let key = name.replace(/\s*\([^)]*\)\s*$/, "");
  while (COPY_MARKS.test(key)) key = key.replace(COPY_MARKS, "");
  return key.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function getJson(url, headers, service) {
  const response = await fetch(url, { headers });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${service} answered ${response.status} for ${url}: ${(await response.text()).slice(0, 200)}`);
  return response.json();
}

// --- Artificial Analysis -----------------------------------------------------

// All the language models of Artificial Analysis, with their Intelligence Index.
// One request for each page of 200 models. The free tier permits 100 requests a day.
export async function loadIndex(apiKey) {
  const models = [];
  let version = null;
  for (let page = 1; ; page += 1) {
    const body = await getJson(`${AA_API}?page=${page}`, { "x-api-key": apiKey }, "Artificial Analysis");
    if (!body) throw new Error("Artificial Analysis has no model list at the address in AA_API.");
    version = body.intelligence_index_version ?? version;
    for (const model of body.data) {
      models.push({
        slug: model.slug,
        key: modelKey(model.name),
        // One model can have a variant for each reasoning setting: "(Non-reasoning)", "(Low)", "(Xhigh)".
        reasoning: !/\(non-reasoning\)\s*$/i.test(model.name),
        intelligence: model.evaluations?.artificial_analysis_intelligence_index ?? null,
      });
    }
    if (!body.pagination?.has_more) break;
  }

  const scores = models.map((model) => model.intelligence).filter((score) => score !== null).sort((a, b) => a - b);
  if (!scores.length) throw new Error("Artificial Analysis gave no Intelligence Index. Check the API response.");
  return { models, version, measured: scores.length, floor: scores[Math.floor((scores.length - 1) / 4)] };
}

// The Intelligence Index of a model, with the reasoning setting of the recipe.
// A recipe does not set a reasoning effort, so the variant with the highest
// index is used. Returns null when the model has no index.
function intelligenceOf(modelName, reasoning, index) {
  const sameModel = index.models.filter((model) => model.key === modelKey(modelName));
  const sameSetting = sameModel.filter((model) => model.reasoning === reasoning);
  const scores = (sameSetting.length ? sameSetting : sameModel).map((model) => model.intelligence).filter((score) => score !== null);
  return scores.length ? Math.max(...scores) : null;
}

// --- Hugging Face ------------------------------------------------------------

// The leaderboards of all the benchmarks in BENCHMARKS: for each one, the rank
// of each model and the number of models. The token is optional: the data is public.
export async function loadLeaderboards(token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const boards = new Map();
  for (const benchmark of new Set(Object.values(BENCHMARKS).flat())) {
    const rows = await getJson(`${HF_API}/datasets/${benchmark}/leaderboard`, headers, "Hugging Face");
    if (!Array.isArray(rows) || rows.length < SMALLEST_LEADERBOARD) continue;
    // A model can be in the list more than one time: its best rank counts.
    const ranks = new Map();
    for (const row of rows) ranks.set(row.modelId, Math.min(row.rank, ranks.get(row.modelId) ?? Infinity));
    boards.set(benchmark, { ranks, size: rows.length });
  }
  return { boards, headers };
}

// The original model of a recipe on Hugging Face. A quantized copy names its
// original model in `base_model`. Returns null when the recipe model is not on Hugging Face.
const originals = new Map();
async function originalOf(repo, headers) {
  if (!originals.has(repo)) {
    const info = await getJson(`${HF_API}/models/${repo}`, headers, "Hugging Face");
    const base = info && [info.cardData?.base_model].flat().find(Boolean);
    const original = base && base !== repo ? await getJson(`${HF_API}/models/${base}`, headers, "Hugging Face") : info;
    originals.set(repo, original ? { id: original.id, readsImages: /image/.test(original.pipeline_tag || "") } : null);
  }
  return originals.get(repo);
}

// The best place of a model on the leaderboards of one use case: the
// benchmark, the rank, and the number of models. Null when it is on none of them.
function bestPlace(modelId, useCase, boards) {
  let best = null;
  for (const benchmark of BENCHMARKS[useCase]) {
    const board = boards.get(benchmark);
    const rank = board?.ranks.get(modelId);
    if (rank && (!best || rank / board.size < best.rank / best.of)) best = { benchmark, rank, of: board.size };
  }
  return best;
}

// --- The rules ---------------------------------------------------------------

// The evidence of a recipe: its original model, the general score, and the
// best place of the model on the leaderboards of each use case.
export async function findEvidence(recipe, index, leaderboards) {
  const original = await originalOf(`${recipe.publisher}/${recipe.model}`, leaderboards.headers);
  const modelName = original ? original.id.split("/").pop() : recipe.model;
  const places = {};
  for (const useCase of Object.keys(BENCHMARKS)) {
    const place = original && bestPlace(original.id, useCase, leaderboards.boards);
    if (place) places[useCase] = place;
  }
  return {
    model: original ? original.id : null,
    readsImages: Boolean(original && original.readsImages),
    intelligence: intelligenceOf(modelName, recipe.facts.reasoning, index),
    places,
  };
}

// The use cases that a recipe fits best, from its facts and its evidence.
export function classify(recipe, evidence, index) {
  const notBelowFloor = evidence.intelligence === null || evidence.intelligence >= index.floor;
  const inTopHalf = (useCase) => Boolean(evidence.places[useCase]) && evidence.places[useCase].rank <= evidence.places[useCase].of / 2;

  const reaches = {
    chat: notBelowFloor,
    coding: inTopHalf("coding") && notBelowFloor,
    documents: inTopHalf("documents") && evidence.readsImages,
  };
  const best = DEMAND.filter((useCase) => reaches[useCase]).slice(-BEST_FIT);
  if (reaches.documents) best.push("documents");
  return USE_CASES.filter((useCase) => best.includes(useCase));
}
