// ============================================================
//  COPPER SPOON KITCHEN — App Logic
// ============================================================

"use strict";

// ---- State ----
let currentRecipe = null;
let currentStep = 0;
let speechTimer = null;
let idleTimer = null;

let favorites = new Set();
let showFavoritesOnly = false;
let searchScope = "both";

let narrationEnabled = false;
let narrationPaused = false;
let preferredNarrationVoice = null;

let soundEnabled = true;
let audioContext = null;
let audioUnlockPending = null;
let webRecipeCache = new Map();
let latestSearchRequest = 0;
let deferredInstallPrompt = null;

const FAVORITES_STORAGE_KEY = "chefFavorites";
const SOUND_STORAGE_KEY = "chefSoundEnabled";
const CONSENT_STORAGE_KEY = "chefConsentChoice";
const WEB_RECIPE_SEARCH_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const WEB_RECIPE_PROXY_URL = "https://api.allorigins.win/raw?url=";
const WEB_RECIPE_SEARCH_URL_2 = "https://dummyjson.com/recipes/search?q=";
const TASTE_PROXY_SEARCH_URL = "/api/taste/search?q=";
const WEB_RECIPE_SEARCH_URL_3 = "https://60secondrecipe.com/?s=";
const MOUTHSOFMUMS_PROXY_SEARCH_URL = "/api/mouthsofmums/search?q=";
const IDLE_PHRASES = [
  "Welcome to Copper Spoon Kitchen. What would you like to cook today?",
  "Ready when you are. Search for any dish to get started.",
  "Great choice. I can guide you step by step.",
  "Try searching by meal type, ingredient, or cuisine.",
  "You can also save favorite recipes for quick access later.",
  "Need inspiration? Try pasta, curry, soup, or tacos."
];

const SEARCH_PHRASES = [
  "Searching recipes now...",
  "Checking local and web recipe sources...",
  "Looking good. Here are matching results.",
  "Search complete. Pick any recipe to begin cooking."
];

const STEP_PHRASES = [
  [
    "Step one. Start with this first preparation step.",
    "Great start. Take your time and set up ingredients first.",
    "Perfect. Let’s begin with the fundamentals."
  ],
  [
    "Step two. Keep going with the same pace.",
    "Nice progress. This step builds flavor.",
    "Great work. You are moving smoothly through the recipe."
  ],
  [
    "Step three. You are doing well.",
    "Halfway there. Keep consistency and timing in check.",
    "Excellent control so far. Continue to the next step."
  ],
  [
    "Step four. This is where everything comes together.",
    "Nice momentum. Keep an eye on texture and heat.",
    "Great progress. You are close to finishing."
  ],
  [
    "Step five. Almost done.",
    "Excellent. Final adjustments make the difference.",
    "You are in the final stretch. Finish strong."
  ]
];

const DONE_PHRASES = [
  "Excellent work. Your dish is complete.",
  "Beautiful finish. You cooked that really well.",
  "Nice execution from start to finish.",
  "Recipe complete. Ready for plating and serving."
];

const COOK_PHRASES = [
  "Let’s get cooking.",
  "Great pace. Keep it steady.",
  "Flavors are developing nicely.",
  "You are doing great. Continue to the next step.",
  "This is coming together beautifully.",
  "Keep stirring and watch the heat level.",
  "Nice control. You are almost there."
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getConsentChoice() {
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function consentAllowsStorage() {
  return getConsentChoice() === "allow";
}

function setConsentChoice(choice) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Ignore storage errors; app still functions with in-memory state.
  }
}

function applyConsentChoice(choice) {
  setConsentChoice(choice);

  if (choice !== "allow") {
    favorites = new Set();
    soundEnabled = true;
    try {
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
      localStorage.removeItem(SOUND_STORAGE_KEY);
    } catch {
      // Ignore remove errors.
    }
  }

  const banner = document.getElementById("consent-banner");
  if (banner) {
    banner.hidden = true;
  }

  updateSoundButton();
  renderFavoritesPanel();
  searchRecipes();
}

function initConsentBanner() {
  const banner = document.getElementById("consent-banner");
  const acceptBtn = document.getElementById("consent-accept-btn");
  const declineBtn = document.getElementById("consent-decline-btn");
  if (!banner || !acceptBtn || !declineBtn) return;

  const choice = getConsentChoice();
  banner.hidden = choice === "allow" || choice === "decline";

  acceptBtn.addEventListener("click", () => applyConsentChoice("allow"));
  declineBtn.addEventListener("click", () => applyConsentChoice("decline"));
}

function chefSay(text, elementId = "speech-text") {
  const el = document.getElementById(elementId);
  if (!el) return;

  const bubble = el.closest(".speech-bubble");
  if (bubble) {
    bubble.style.animation = "none";
    void bubble.offsetWidth;
    bubble.style.animation = "bubblePop 0.4s ease-out";
  }

  el.textContent = text;
}

// ---- Audio SFX ----
function ensureAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    audioContext = new AudioCtx();
  }
  return audioContext;
}

function unlockAudioContext() {
  const ctx = ensureAudioContext();
  if (!ctx) return Promise.resolve(null);

  if (ctx.state === "running") {
    return Promise.resolve(ctx);
  }

  if (audioUnlockPending) {
    return audioUnlockPending;
  }

  audioUnlockPending = ctx.resume()
    .then(() => ctx)
    .catch(() => null)
    .finally(() => {
      audioUnlockPending = null;
    });

  return audioUnlockPending;
}

function scheduleTone(ctx, freq, duration, type, volume, startOffset) {
  if (!ctx || ctx.state !== "running") return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const startAt = ctx.currentTime + startOffset;
  const endAt = startAt + duration;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(endAt + 0.01);
}

function playTone(freq, duration, type = "sine", volume = 0.05, startOffset = 0) {
  if (!soundEnabled) return;
  unlockAudioContext().then(ctx => {
    scheduleTone(ctx, freq, duration, type, volume, startOffset);
  });
}

function primeAudio() {
  if (!soundEnabled) return;
  unlockAudioContext();
}

function playUiSound() {
  playTone(540, 0.08, "triangle", 0.04);
}

function playStepSound() {
  if (currentStep % 2 === 0) {
    playTone(280, 0.07, "square", 0.035);
    playTone(340, 0.07, "square", 0.03, 0.09);
  } else {
    playTone(430, 0.06, "sawtooth", 0.03);
    playTone(390, 0.06, "sawtooth", 0.03, 0.08);
  }
}

function playCelebrationSound() {
  [523, 659, 784, 988].forEach((freq, idx) => {
    playTone(freq, 0.14, "triangle", 0.05, idx * 0.11);
  });
}

function updateSoundButton() {
  const btn = document.getElementById("sound-toggle-btn");
  if (!btn) return;
  btn.textContent = soundEnabled ? "🔔 Sound On" : "🔕 Sound Off";
  btn.classList.toggle("active", soundEnabled);
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  if (consentAllowsStorage()) {
    localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
  }
  updateSoundButton();
  if (soundEnabled) playUiSound();
}

// ---- Narration ----
function narrationSupported() {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function pickNarrationVoice() {
  if (!narrationSupported()) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferredPatterns = [
    /male/i,
    /daniel/i,
    /fred/i,
    /george/i,
    /david/i,
    /english/i,
    /uk/i,
    /scotland/i,
    /ireland/i
  ];

  const englishVoices = voices.filter(voice => /^en[-_]/i.test(voice.lang) || /english/i.test(voice.name));
  const rankedVoices = englishVoices.length ? englishVoices : voices;

  for (const pattern of preferredPatterns) {
    const match = rankedVoices.find(voice => pattern.test(voice.name) || pattern.test(voice.lang));
    if (match) return match;
  }

  return rankedVoices[0] || null;
}

function stylizeNarrationText(text) {
  if (!text) return "";

  return text.replace(/\s{2,}/g, " ").trim();
}

function updateNarrationButton() {
  const btn = document.getElementById("narration-btn");
  if (!btn) return;

  if (!narrationEnabled) {
    btn.textContent = "🔊 Start Narration";
    btn.classList.remove("active");
    return;
  }

  btn.classList.add("active");
  if (narrationPaused) {
    btn.textContent = "▶ Resume Narration";
  } else {
    btn.textContent = "⏸ Pause Narration";
  }
}

function currentStepNarrationText() {
  if (!currentRecipe) return "";
  const step = currentRecipe.steps[currentStep];
  if (!step) return "";
  return "Step " + (currentStep + 1) + ". " + step.instruction;
}

function speakText(text) {
  if (!narrationSupported() || !text) return;

  window.speechSynthesis.cancel();
  preferredNarrationVoice = preferredNarrationVoice || pickNarrationVoice();

  const utterance = new SpeechSynthesisUtterance(stylizeNarrationText(text));
  utterance.rate = 0.96;
  utterance.pitch = 1.22;
  utterance.volume = 1;
  utterance.lang = "en-US";
  if (preferredNarrationVoice) {
    utterance.voice = preferredNarrationVoice;
    utterance.lang = preferredNarrationVoice.lang || utterance.lang;
  }
  window.speechSynthesis.speak(utterance);
}

function speakCurrentStep() {
  if (!narrationEnabled || !currentRecipe) return;
  narrationPaused = false;
  updateNarrationButton();
  speakText(currentStepNarrationText());
}

function replayNarration() {
  if (!narrationSupported()) return;

  narrationEnabled = true;
  narrationPaused = false;
  updateNarrationButton();
  speakCurrentStep();
  playUiSound();
}

function toggleNarration() {
  if (!narrationSupported()) {
    chefSay("Narration is not available in this browser.", "cooking-speech-text");
    return;
  }

  if (!narrationEnabled) {
    narrationEnabled = true;
    narrationPaused = false;
    updateNarrationButton();
    speakCurrentStep();
    playUiSound();
    return;
  }

  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
    narrationPaused = true;
  } else {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      speakCurrentStep();
    }
    narrationPaused = false;
  }

  updateNarrationButton();
  playUiSound();
}

function stopNarration(resetMode = false) {
  if (narrationSupported()) {
    window.speechSynthesis.cancel();
  }
  narrationPaused = false;
  if (resetMode) narrationEnabled = false;
  updateNarrationButton();
}

// ---- Favorites ----
function loadFavorites() {
  if (!consentAllowsStorage()) return new Set();
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function saveFavorites() {
  if (!consentAllowsStorage()) return;
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favorites)));
}

function normalizeFavoriteIds(set) {
  const normalized = new Set();
  set.forEach(value => {
    if (typeof value === "string" || typeof value === "number") {
      normalized.add(value);
    }
  });
  return normalized;
}

function isFavorite(recipeId) {
  return favorites.has(recipeId);
}

function updateFilterButtons() {
  const allBtn = document.getElementById("show-all-btn");
  const favBtn = document.getElementById("show-favorites-btn");
  if (!allBtn || !favBtn) return;

  allBtn.classList.toggle("active", !showFavoritesOnly);
  favBtn.classList.toggle("active", showFavoritesOnly);
}

function updateScopeButtons() {
  const bothBtn = document.getElementById("scope-both-btn");
  const localBtn = document.getElementById("scope-local-btn");
  const webBtn = document.getElementById("scope-web-btn");
  if (!bothBtn || !localBtn || !webBtn) return;

  bothBtn.classList.toggle("active", searchScope === "both");
  localBtn.classList.toggle("active", searchScope === "local");
  webBtn.classList.toggle("active", searchScope === "web");
}

function setSearchScope(scope) {
  searchScope = scope;
  updateScopeButtons();
  searchRecipes();
  playUiSound();
}

function setRecipeFilter(favoritesOnly) {
  showFavoritesOnly = favoritesOnly;
  updateFilterButtons();
  searchRecipes();
  playUiSound();
}

function updateCurrentRecipeFavoriteButton() {
  const btn = document.getElementById("recipe-favorite-btn");
  if (!btn || !currentRecipe) return;

  const active = isFavorite(currentRecipe.id);
  btn.classList.toggle("active", active);
  btn.textContent = active ? "★ Favorited" : "☆ Save Favorite";
}

function toggleFavoriteById(recipeId) {
  if (favorites.has(recipeId)) {
    favorites.delete(recipeId);
  } else {
    favorites.add(recipeId);
  }

  saveFavorites();
  updateCurrentRecipeFavoriteButton();
  renderFavoritesPanel();
  searchRecipes();
  playUiSound();
}

function toggleCurrentRecipeFavorite() {
  if (!currentRecipe) return;
  toggleFavoriteById(currentRecipe.id);
}

function inferRecipeEmoji(meal) {
  const category = (meal.strCategory || "").toLowerCase();
  const name = (meal.strMeal || "").toLowerCase();
  if (category.includes("beef")) return "🥩";
  if (category.includes("chicken")) return "🍗";
  if (category.includes("seafood") || name.includes("fish") || name.includes("shrimp")) return "🐟";
  if (category.includes("dessert")) return "🍰";
  if (category.includes("pasta")) return "🍝";
  if (name.includes("soup")) return "🥣";
  if (name.includes("salad")) return "🥗";
  if (name.includes("curry")) return "🍛";
  if (name.includes("taco")) return "🌮";
  return "🍽️";
}

function splitInstructionsToSteps(instructions) {
  const cleaned = (instructions || "").replace(/\r/g, "\n").trim();
  if (!cleaned) {
    return [{ instruction: "Follow your recipe notes and cook with confidence!", tip: "Taste as you go." }];
  }

  const chunks = cleaned
    .split(/\n+|\.\s+/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => (/[.!?]$/.test(line) ? line : line + "."));

  const limited = chunks.slice(0, 8);
  return limited.map((instruction, idx) => ({
    instruction,
    tip: idx % 2 === 0 ? "Keep an eye on texture and aroma as you cook." : "Season gradually, then adjust at the end."
  }));
}

function buildSearchCandidates(query) {
  const normalized = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return [];

  const words = normalized.split(" ").filter(word => word.length > 1);
  const candidates = new Set([normalized]);

  if (words.length > 1) {
    words.forEach(word => {
      if (word.length > 2) candidates.add(word);
      if (word.endsWith("s") && word.length > 3) candidates.add(word.slice(0, -1));
    });

    candidates.add(words[words.length - 1]);
    candidates.add(words.slice(0, 2).join(" "));
  }

  return Array.from(candidates).slice(0, 6);
}

function recipeMatchesTokens(recipe, tokens) {
  if (!tokens.length) return true;

  const name = recipe.name.toLowerCase();
  const tagsText = recipe.tags.join(" ").toLowerCase();
  const ingredientsText = recipe.ingredients.join(" ").toLowerCase();

  return tokens.some(token =>
    name.includes(token) ||
    tagsText.includes(token) ||
    ingredientsText.includes(token)
  );
}

function estimateWebMeta(steps, ingredientsCount) {
  const stepCount = steps.length;
  const wordCount = steps.reduce((total, step) => total + step.instruction.split(/\s+/).filter(Boolean).length, 0);
  const timeMinutes = Math.max(15, Math.round((stepCount * 4) + (wordCount / 18) + (ingredientsCount * 1.2)));

  let difficulty = "Easy";
  if (stepCount >= 6 || ingredientsCount >= 10 || wordCount >= 140) {
    difficulty = "Medium";
  }
  if (stepCount >= 8 || ingredientsCount >= 14 || wordCount >= 220) {
    difficulty = "Hard";
  }

  return {
    time: `${timeMinutes} min`,
    difficulty
  };
}

function parseMealDbRecipe(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = (meal[`strIngredient${i}`] || "").trim();
    const measure = (meal[`strMeasure${i}`] || "").trim();
    if (!ingredient) continue;
    ingredients.push(`• ${measure ? measure + " " : ""}${ingredient}`.trim());
  }

  const tags = ["web", "mealdb"];
  if (meal.strCategory) tags.push(meal.strCategory.toLowerCase());
  if (meal.strArea) tags.push(meal.strArea.toLowerCase());
  if (meal.strTags) {
    meal.strTags
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(Boolean)
      .forEach(tag => tags.push(tag));
  }

  const steps = splitInstructionsToSteps(meal.strInstructions);
  const meta = estimateWebMeta(steps, ingredients.length);

  const recipe = {
    id: `web-${meal.idMeal}`,
    name: meal.strMeal || "Web Recipe",
    emoji: inferRecipeEmoji(meal),
    time: meta.time,
    difficulty: meta.difficulty,
    servings: "2-4 servings",
    tags: Array.from(new Set(tags)),
    ingredients: ingredients.length ? ingredients : ["• Ingredients unavailable from source"],
    steps,
    source: "web",
    sourceLabel: "TheMealDB",
    sourceUrl: meal.strSource || meal.strYoutube || ""
  };

  webRecipeCache.set(recipe.id, recipe);
  return recipe;
}

function parseDummyJsonRecipe(item) {
  const ingredients = Array.isArray(item.ingredients)
    ? item.ingredients.map(ingredient => `• ${ingredient}`)
    : ["• Ingredients unavailable from source"];

  const steps = Array.isArray(item.instructions)
    ? item.instructions.map((instruction, idx) => ({
      instruction: /[.!?]$/.test(instruction) ? instruction : `${instruction}.`,
      tip: idx % 2 === 0 ? "Prep ingredients before cooking for smoother flow." : "Taste and adjust seasoning near the end."
    }))
    : splitInstructionsToSteps("");

  const totalMinutes = (item.prepTimeMinutes || 0) + (item.cookTimeMinutes || 0);
  const tags = ["web", "dummyjson", (item.cuisine || "international").toLowerCase(), ...(Array.isArray(item.tags) ? item.tags.map(t => String(t).toLowerCase()) : [])];

  const recipe = {
    id: `web-dummy-${item.id}`,
    name: item.name || "Web Recipe",
    emoji: inferRecipeEmoji({ strCategory: item.cuisine || "", strMeal: item.name || "" }),
    time: `${Math.max(15, totalMinutes || 30)} min`,
    difficulty: item.difficulty || "Medium",
    servings: `${item.servings || 2} servings`,
    tags: Array.from(new Set(tags)),
    ingredients,
    steps,
    source: "web",
    sourceLabel: "DummyJSON",
    sourceUrl: `https://dummyjson.com/recipes/${item.id}`
  };

  webRecipeCache.set(recipe.id, recipe);
  return recipe;
}

function parseBBCGoodFoodProxyRecipe(item, fallbackCandidate = "") {
  const name = String(item?.name || item?.title || fallbackCandidate || "BBC Good Food Recipe").trim();
  const sourceUrl = String(item?.sourceUrl || item?.url || "").trim();
  const idSuffix = sourceUrl
    ? encodeURIComponent(sourceUrl).replace(/%/g, "")
    : `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${fallbackCandidate}`;

  const ingredients = Array.isArray(item?.ingredients) && item.ingredients.length
    ? item.ingredients.map(ingredient => `• ${String(ingredient).trim()}`)
    : ["• Open source page for full ingredients list"];

  const rawSteps = Array.isArray(item?.steps) ? item.steps : [];
  const steps = rawSteps.length
    ? rawSteps.slice(0, 8).map((instruction, idx) => ({
      instruction: /[.!?]$/.test(instruction) ? instruction : `${instruction}.`,
      tip: idx % 2 === 0 ? "Keep prep organized for quick cooking." : "Taste and adjust as you go."
    }))
    : splitInstructionsToSteps("Open the source link for full method.");

  const time = typeof item?.time === "string" && item.time.trim()
    ? item.time.trim()
    : estimateWebMeta(steps, ingredients.length).time;

  const difficulty = typeof item?.difficulty === "string" && item.difficulty.trim()
    ? item.difficulty.trim()
    : estimateWebMeta(steps, ingredients.length).difficulty;

  const servings = typeof item?.servings === "string" && item.servings.trim()
    ? item.servings.trim()
    : "2-4 servings";

  const tags = Array.isArray(item?.tags) && item.tags.length
    ? item.tags.map(tag => String(tag).toLowerCase())
    : ["web", "bbcgoodfood", "british"];

  const recipe = {
    id: `web-bbcgoodfood-${idSuffix}`,
    name,
    emoji: inferRecipeEmoji({ strCategory: "", strMeal: name }),
    time,
    difficulty,
    servings,
    tags: Array.from(new Set(tags)),
    ingredients,
    steps,
    source: "web",
    sourceLabel: "BBC Good Food",
    sourceUrl
  };

  webRecipeCache.set(recipe.id, recipe);
  return recipe;
}

function parseMouthsOfMumsProxyRecipe(item, fallbackCandidate = "") {
  const name = String(item?.name || item?.title || fallbackCandidate || "Mouths of Mums Recipe").trim();
  const sourceUrl = String(item?.sourceUrl || item?.url || "").trim();
  const idSuffix = sourceUrl
    ? encodeURIComponent(sourceUrl).replace(/%/g, "")
    : `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${fallbackCandidate}`;

  const ingredients = Array.isArray(item?.ingredients) && item.ingredients.length
    ? item.ingredients.map(ingredient => `• ${String(ingredient).trim()}`)
    : ["• Open source page for full ingredients list"];

  const rawSteps = Array.isArray(item?.steps) ? item.steps : [];
  const steps = rawSteps.length
    ? rawSteps.slice(0, 8).map((instruction, idx) => ({
      instruction: /[.!?]$/.test(instruction) ? instruction : `${instruction}.`,
      tip: idx % 2 === 0 ? "Keep prep organized for quick cooking." : "Taste and adjust as you go."
    }))
    : splitInstructionsToSteps("Open the source link for full method.");

  const time = typeof item?.time === "string" && item.time.trim()
    ? item.time.trim()
    : estimateWebMeta(steps, ingredients.length).time;

  const difficulty = typeof item?.difficulty === "string" && item.difficulty.trim()
    ? item.difficulty.trim()
    : estimateWebMeta(steps, ingredients.length).difficulty;

  const servings = typeof item?.servings === "string" && item.servings.trim()
    ? item.servings.trim()
    : "2-4 servings";

  const tags = Array.isArray(item?.tags) && item.tags.length
    ? item.tags.map(tag => String(tag).toLowerCase())
    : ["web", "mouthsofmums", "australian"];

  const recipe = {
    id: `web-mouthsofmums-${idSuffix}`,
    name,
    emoji: inferRecipeEmoji({ strCategory: "", strMeal: name }),
    time,
    difficulty,
    servings,
    tags: Array.from(new Set(tags)),
    ingredients,
    steps,
    source: "web",
    sourceLabel: "Mouths of Mums",
    sourceUrl
  };

  webRecipeCache.set(recipe.id, recipe);
  return recipe;
}

function parseTasteProxyRecipe(item, fallbackCandidate = "") {
  const name = String(item?.name || item?.title || fallbackCandidate || "Taste Recipe").trim();
  const sourceUrl = String(item?.sourceUrl || item?.url || "").trim();
  const idSuffix = sourceUrl
    ? encodeURIComponent(sourceUrl).replace(/%/g, "")
    : `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${fallbackCandidate}`;

  const ingredients = Array.isArray(item?.ingredients) && item.ingredients.length
    ? item.ingredients.map(ingredient => `• ${String(ingredient).trim()}`)
    : ["• Open source page for full ingredients list"];

  const rawSteps = Array.isArray(item?.steps) ? item.steps : [];
  const steps = rawSteps.length
    ? rawSteps.slice(0, 8).map((instruction, idx) => ({
      instruction: /[.!?]$/.test(instruction) ? instruction : `${instruction}.`,
      tip: idx % 2 === 0 ? "Keep prep organized for quick cooking." : "Taste and adjust as you go."
    }))
    : splitInstructionsToSteps("Open the source link for full method.");

  const time = typeof item?.time === "string" && item.time.trim()
    ? item.time.trim()
    : estimateWebMeta(steps, ingredients.length).time;

  const difficulty = typeof item?.difficulty === "string" && item.difficulty.trim()
    ? item.difficulty.trim()
    : estimateWebMeta(steps, ingredients.length).difficulty;

  const servings = typeof item?.servings === "string" && item.servings.trim()
    ? item.servings.trim()
    : "2-4 servings";

  const tags = Array.isArray(item?.tags) && item.tags.length
    ? item.tags.map(tag => String(tag).toLowerCase())
    : ["web", "taste", "australian"];

  const recipe = {
    id: `web-taste-${idSuffix}`,
    name,
    emoji: inferRecipeEmoji({ strCategory: "", strMeal: name }),
    time,
    difficulty,
    servings,
    tags: Array.from(new Set(tags)),
    ingredients,
    steps,
    source: "web",
    sourceLabel: "Taste.com.au",
    sourceUrl
  };

  webRecipeCache.set(recipe.id, recipe);
  return recipe;
}

function parseDurationToMinutes(duration) {
  if (!duration || typeof duration !== "string") return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!match) return 0;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  return (hours * 60) + minutes;
}

function extract60SecondRecipesFromJsonLd(html, candidate) {
  const recipes = [];
  const scripts = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];

  const collectRecipeNodes = (node, out) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(item => collectRecipeNodes(item, out));
      return;
    }

    if (typeof node !== "object") return;
    const nodeType = node["@type"];
    const isRecipe = (Array.isArray(nodeType) && nodeType.includes("Recipe")) || nodeType === "Recipe";
    if (isRecipe) {
      out.push(node);
    }

    if (Array.isArray(node["@graph"])) {
      node["@graph"].forEach(item => collectRecipeNodes(item, out));
    }
  };

  scripts.forEach(scriptTag => {
    const contentMatch = scriptTag.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const jsonText = contentMatch ? contentMatch[1].trim() : "";
    if (!jsonText) return;

    try {
      const parsed = JSON.parse(jsonText);
      const recipeNodes = [];
      collectRecipeNodes(parsed, recipeNodes);

      recipeNodes.forEach((node, idx) => {
        const rawName = String(node.name || "").trim();
        if (!rawName) return;

        const url = typeof node.url === "string" && node.url
          ? node.url
          : `${WEB_RECIPE_SEARCH_URL_3}${encodeURIComponent(candidate)}`;

        const rawIngredients = Array.isArray(node.recipeIngredient) ? node.recipeIngredient : [];
        const ingredients = rawIngredients.length
          ? rawIngredients.slice(0, 14).map(item => `• ${String(item).trim()}`)
          : ["• Open source page for full ingredients list"];

        const instructionsSource = node.recipeInstructions;
        let steps = splitInstructionsToSteps("");
        if (typeof instructionsSource === "string") {
          steps = splitInstructionsToSteps(instructionsSource);
        } else if (Array.isArray(instructionsSource)) {
          const instructionLines = instructionsSource
            .map(item => {
              if (typeof item === "string") return item.trim();
              if (item && typeof item === "object") return String(item.text || item.name || "").trim();
              return "";
            })
            .filter(Boolean);

          if (instructionLines.length) {
            steps = instructionLines.slice(0, 8).map((instruction, stepIdx) => ({
              instruction: /[.!?]$/.test(instruction) ? instruction : `${instruction}.`,
              tip: stepIdx % 2 === 0
                ? "Work step by step for consistent results."
                : "Taste and adjust seasoning gradually."
            }));
          }
        }

        const totalMinutes = parseDurationToMinutes(String(node.totalTime || ""));
        const meta = totalMinutes
          ? { time: `${Math.max(10, totalMinutes)} min`, difficulty: ingredients.length >= 11 ? "Medium" : "Easy" }
          : estimateWebMeta(steps, ingredients.length);

        const recipe = {
          id: `web-60sr-jsonld-${idx}-${encodeURIComponent(url).replace(/%/g, "")}`,
          name: rawName,
          emoji: inferRecipeEmoji({ strMeal: rawName, strCategory: "" }),
          time: meta.time,
          difficulty: meta.difficulty,
          servings: "2-4 servings",
          tags: ["web", "60secondrecipe", "quick"],
          ingredients,
          steps,
          source: "web",
          sourceLabel: "60SecondRecipe",
          sourceUrl: url
        };

        webRecipeCache.set(recipe.id, recipe);
        recipes.push(recipe);
      });
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  });

  return recipes;
}

function extract60SecondRecipeLinksFromHtml(html, candidate) {
  const recipes = [];
  const seenUrls = new Set();
  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const fallbackSteps = splitInstructionsToSteps("Open the source link for full ingredients and cooking steps.");

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const rawUrl = String(match[1] || "").trim();
    const rawTitle = String(match[2] || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (!rawUrl || !rawTitle) continue;

    const absoluteUrl = rawUrl.startsWith("http") ? rawUrl : `https://60secondrecipe.com${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
    if (!absoluteUrl.includes("60secondrecipe.com")) continue;
    if (seenUrls.has(absoluteUrl)) continue;

    const titleLower = rawTitle.toLowerCase();
    const candidateLower = candidate.toLowerCase();
    const looksLikeRecipe = absoluteUrl.includes("recipe") || titleLower.includes(candidateLower);
    const isLikelyNav = titleLower.length < 8 || /(home|about|contact|privacy|terms|menu|login|sign up)/i.test(titleLower);
    if (!looksLikeRecipe || isLikelyNav) continue;

    seenUrls.add(absoluteUrl);
    const recipe = {
      id: `web-60sr-link-${encodeURIComponent(absoluteUrl).replace(/%/g, "")}`,
      name: rawTitle,
      emoji: inferRecipeEmoji({ strMeal: rawTitle, strCategory: "" }),
      time: "10-30 min",
      difficulty: "Easy",
      servings: "2-4 servings",
      tags: ["web", "60secondrecipe", "quick"],
      ingredients: ["• Open source page for ingredients"],
      steps: fallbackSteps,
      source: "web",
      sourceLabel: "60SecondRecipe",
      sourceUrl: absoluteUrl
    };

    webRecipeCache.set(recipe.id, recipe);
    recipes.push(recipe);
    if (recipes.length >= 8) break;
  }

  return recipes;
}

async function fetchWebRecipes(query) {
  if (!query) return [];

  const searchCandidates = buildSearchCandidates(query);
  if (!searchCandidates.length) return [];

  const fetchMealDbByCandidate = async (candidate) => {
    const apiUrl = `${WEB_RECIPE_SEARCH_URL}${encodeURIComponent(candidate)}`;

    const tryFetch = async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Web recipe search failed");
      }
      const data = await response.json();
      const meals = Array.isArray(data.meals) ? data.meals : [];
      return meals.map(parseMealDbRecipe);
    };

    try {
      return await tryFetch(apiUrl);
    } catch {
      return await tryFetch(`${WEB_RECIPE_PROXY_URL}${encodeURIComponent(apiUrl)}`);
    }
  };

  const fetchDummyByCandidate = async (candidate) => {
    const response = await fetch(`${WEB_RECIPE_SEARCH_URL_2}${encodeURIComponent(candidate)}`);
    if (!response.ok) throw new Error("DummyJSON search failed");
    const data = await response.json();
    const items = Array.isArray(data.recipes) ? data.recipes : [];
    return items.map(parseDummyJsonRecipe);
  };

  const fetch60SecondByCandidate = async (candidate) => {
    const searchUrl = `${WEB_RECIPE_SEARCH_URL_3}${encodeURIComponent(candidate)}`;

    try {
      const response = await fetch(`${WEB_RECIPE_PROXY_URL}${encodeURIComponent(searchUrl)}`);
      if (!response.ok) return [];
      const html = await response.text();

      // Cloudflare challenge pages are not parseable recipe data.
      if (/just a moment/i.test(html) || /enable javascript and cookies to continue/i.test(html) || /_cf_chl_opt/i.test(html)) {
        return [];
      }

      const jsonLdRecipes = extract60SecondRecipesFromJsonLd(html, candidate);
      if (jsonLdRecipes.length) return jsonLdRecipes;

      return extract60SecondRecipeLinksFromHtml(html, candidate);
    } catch {
      return [];
    }
  };

  const fetchBBCGoodFoodByCandidate = async (candidate) => {
    try {
      const response = await fetch(`${BBCGOODFOOD_PROXY_SEARCH_URL}${encodeURIComponent(candidate)}`);
      if (!response.ok) return [];
      const data = await response.json();
      const items = Array.isArray(data?.recipes) ? data.recipes : [];
      return items.map(item => parseBBCGoodFoodProxyRecipe(item, candidate));
    } catch {
      return [];
    }
  };

  const fetchMouthsOfMumsByCandidate = async (candidate) => {
    try {
      const response = await fetch(`${MOUTHSOFMUMS_PROXY_SEARCH_URL}${encodeURIComponent(candidate)}`);
      if (!response.ok) return [];
      const data = await response.json();
      const items = Array.isArray(data?.recipes) ? data.recipes : [];
      return items.map(item => parseMouthsOfMumsProxyRecipe(item, candidate));
    } catch {
      return [];
    }
  };

  const fetchTasteByCandidate = async (candidate) => {
    try {
      const response = await fetch(`${TASTE_PROXY_SEARCH_URL}${encodeURIComponent(candidate)}`);
      if (!response.ok) return [];
      const data = await response.json();
      const items = Array.isArray(data?.recipes) ? data.recipes : [];
      return items.map(item => parseTasteProxyRecipe(item, candidate));
    } catch {
      return [];
    }
  };

  const allResults = [];
  const seen = new Set();

  for (const candidate of searchCandidates) {
    const settled = await Promise.allSettled([
      fetchMealDbByCandidate(candidate),
      fetchDummyByCandidate(candidate),
      fetch60SecondByCandidate(candidate),
      fetchTasteByCandidate(candidate),
      fetchMouthsOfMumsByCandidate(candidate),
      fetchBBCGoodFoodByCandidate(candidate)
    ]);

    settled.forEach(result => {
      if (result.status !== "fulfilled") return;
      result.value.forEach(recipe => {
        const key = recipe.name.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        allResults.push(recipe);
      });
    });

    if (allResults.length >= 24) break;
  }

  if (!allResults.length) {
    throw new Error("All web providers failed");
  }

  return allResults;
}

function createRecipeCard(recipe, idx) {
  const card = document.createElement("div");
  card.className = "recipe-card";
  card.style.animationDelay = `${idx * 0.07}s`;

  const favorited = isFavorite(recipe.id);
  card.innerHTML = `
    <button class="favorite-btn ${favorited ? "active" : ""}" aria-label="Toggle favorite">${favorited ? "★" : "☆"}</button>
    <span class="card-emoji">${recipe.emoji}</span>
    <h3>${recipe.name}</h3>
    <div class="card-meta">${recipe.time} | ${recipe.difficulty}${recipe.source === "web" ? ` | ${recipe.sourceLabel || "Web"}` : " | Local"}</div>
    <div class="card-tags">${recipe.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
  `;

  const favBtn = card.querySelector(".favorite-btn");
  favBtn.addEventListener("click", event => {
    event.stopPropagation();
    toggleFavoriteById(recipe.id);
  });

  card.addEventListener("click", () => startCooking(recipe));
  return card;
}

function renderFavoritesPanel() {
  const container = document.getElementById("favorites-list");
  if (!container) return;

  const allKnownRecipes = [...RECIPES, ...Array.from(webRecipeCache.values())];
  const favoriteRecipes = allKnownRecipes.filter(recipe => favorites.has(recipe.id));
  container.innerHTML = "";

  if (favoriteRecipes.length === 0) {
    container.innerHTML = '<div class="no-results"><p>No favorites yet. Tap ☆ on any recipe card.</p></div>';
    return;
  }

  favoriteRecipes.forEach((recipe, idx) => {
    container.appendChild(createRecipeCard(recipe, idx));
  });
}

// ---- Rotate cooking speech ----
function startCookingChatter() {
  if (speechTimer) clearInterval(speechTimer);
  speechTimer = setInterval(() => {
    chefSay(randomFrom(COOK_PHRASES), "cooking-speech-text");
  }, 3000);
}

function stopCookingChatter() {
  if (speechTimer) clearInterval(speechTimer);
}

function startIdleChatter() {
  if (idleTimer) clearInterval(idleTimer);
  idleTimer = setInterval(() => {
    chefSay(randomFrom(IDLE_PHRASES), "speech-text");
  }, 5000);
}

// ---- Search Recipes ----
async function searchRecipes() {
  const input = document.getElementById("search-input");
  const container = document.getElementById("search-results");
  if (!input || !container) return;

  const requestId = ++latestSearchRequest;
  const query = input.value.trim().toLowerCase();
  const tokens = buildSearchCandidates(query);
  chefSay(randomFrom(SEARCH_PHRASES), "speech-text");

  if (!query) {
    setSearchStatus("Showing available recipes. Use search to refine results.");
  } else {
    setSearchStatus("Searching recipes...");
  }

  let localResults = RECIPES.filter(recipe => recipeMatchesTokens(recipe, tokens));

  if (searchScope === "web") {
    localResults = [];
  }

  let webResults = [];
  if (query.length >= 1 && searchScope !== "local") {
    renderLoadingCards(container, 6);
    try {
      webResults = await fetchWebRecipes(query);
    } catch {
      chefSay("Web search is temporarily unavailable. Local recipes are still available.", "speech-text");
      setSearchStatus("Web provider unavailable right now. Showing local results.");
    }
  }

  if (requestId !== latestSearchRequest) return;

  const dedupe = new Set();
  let results = [...localResults, ...webResults].filter(recipe => {
    const key = recipe.name.toLowerCase();
    if (dedupe.has(key)) return false;
    dedupe.add(key);
    return true;
  });

  if (showFavoritesOnly) {
    results = results.filter(r => favorites.has(r.id));
  }

  container.innerHTML = "";

  if (results.length === 0) {
    const webHint = query.length < 1 ? "Type something to search web recipes too." : "Try another keyword.";
    container.innerHTML = `<div class="no-results"><p>Hmm... no matches! ${webHint}</p></div>`;
    setSearchStatus("No recipe matches found.");
    return;
  }

  const webCount = results.filter(r => r.source === "web").length;
  const localCount = results.length - webCount;
  setSearchStatus(`Showing ${results.length} recipes (${localCount} local, ${webCount} web).`);

  results.forEach((recipe, idx) => {
    container.appendChild(createRecipeCard(recipe, idx));
  });
}

// ---- Enter Cooking Mode ----
function startCooking(recipe) {
  currentRecipe = recipe;
  currentStep = 0;

  document.getElementById("recipe-emoji").textContent = recipe.emoji;
  document.getElementById("recipe-title").textContent = recipe.name;
  document.getElementById("recipe-time").textContent = "⏱️ " + recipe.time;
  document.getElementById("recipe-difficulty").textContent = "👨‍🍳 " + recipe.difficulty;
  document.getElementById("recipe-servings").textContent = "🍽️ " + recipe.servings;
  const sourceLabel = document.getElementById("recipe-source-label");
  if (sourceLabel) {
    sourceLabel.textContent = recipe.source === "web"
      ? `🌐 Source: ${recipe.sourceLabel || "Web"}`
      : "📚 Source: Local Recipe Library";
  }
  updateRecipeSourceButton(recipe);

  updateCurrentRecipeFavoriteButton();

  const ul = document.getElementById("ingredients-list");
  ul.innerHTML = recipe.ingredients.map(ing => `<li>${ing}</li>`).join("");

  const stepsContainer = document.getElementById("steps-container");
  stepsContainer.innerHTML = recipe.steps.map((step, i) => `
    <div class="step-card ${i === 0 ? "active" : ""}" id="step-${i}">
      <div class="step-number">${i + 1}</div>
      <p class="step-instruction">${step.instruction}</p>
      ${step.tip ? `<div class="step-tip">${step.tip}</div>` : ""}
    </div>
  `).join("");

  updateStepNav();

  stopCookingChatter();
  if (idleTimer) clearInterval(idleTimer);

  document.getElementById("search-screen").classList.remove("active");
  document.getElementById("cooking-screen").classList.add("active");

  chefSay("Let’s cook " + recipe.name + ". Follow the guided steps.", "cooking-speech-text");
  startCookingChatter();
  playUiSound();

  if (narrationEnabled) {
    speakCurrentStep();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateRecipeSourceButton(recipe) {
  const sourceBtn = document.getElementById("recipe-source-btn");
  if (!sourceBtn) return;

  const hasSource = recipe && recipe.source === "web" && recipe.sourceUrl;
  sourceBtn.hidden = !hasSource;
  if (hasSource) {
    sourceBtn.textContent = `🔗 Open ${recipe.sourceLabel || "Source"}`;
  }
}

function openRecipeSource() {
  if (!currentRecipe || currentRecipe.source !== "web" || !currentRecipe.sourceUrl) return;
  window.open(currentRecipe.sourceUrl, "_blank", "noopener,noreferrer");
}

function setSearchStatus(message) {
  const status = document.getElementById("search-status");
  if (!status) return;
  status.textContent = message;
}

function renderLoadingCards(container, count = 6) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "loading-card";
    card.setAttribute("aria-hidden", "true");
    container.appendChild(card);
  }
}

function setupInstallPrompt() {
  const installBtn = document.getElementById("install-btn");
  if (!installBtn) return;

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installBtn.hidden = false;
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installBtn.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    installBtn.hidden = true;
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js")
      .then(reg => {
        // When a new SW is found, watch for it to finish installing.
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            // Only show toast if there's already a controller (not first install).
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              showUpdateToast();
            }
          });
        });
      })
      .catch(() => {
        // Ignore registration errors for local/dev previews.
      });

    // If the controller changes (skipWaiting activated), auto-reload if toast was accepted,
    // otherwise the reload button triggers it.
    let reloadPending = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloadPending) window.location.reload();
    });

    function showUpdateToast() {
      const toast = document.getElementById("update-toast");
      if (!toast) return;
      toast.hidden = false;
      document.getElementById("update-reload-btn").onclick = () => {
        reloadPending = true;
        // Tell the waiting SW to skip waiting and take over.
        if (reg && reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
        else window.location.reload();
      };
      document.getElementById("update-dismiss-btn").onclick = () => {
        toast.hidden = true;
      };
    }
  });
}

// ---- Step Navigation ----
function updateStepNav() {
  if (!currentRecipe) return;
  const total = currentRecipe.steps.length;

  document.getElementById("step-counter").textContent = `Step ${currentStep + 1} / ${total}`;
  document.getElementById("prev-step-btn").disabled = currentStep === 0;
  document.getElementById("next-step-btn").disabled = false;
  document.getElementById("next-step-btn").textContent =
    currentStep === total - 1 ? "Done!" : "Next";
}

function showStep(index) {
  document.querySelectorAll(".step-card").forEach(el => el.classList.remove("active"));
  const el = document.getElementById(`step-${index}`);
  if (el) el.classList.add("active");

  updateStepNav();

  const phrases = STEP_PHRASES[index] || COOK_PHRASES;
  chefSay(randomFrom(phrases), "cooking-speech-text");

  if (narrationEnabled) {
    speakCurrentStep();
  }
}

function nextStep() {
  if (!currentRecipe) return;
  const total = currentRecipe.steps.length;

  if (currentStep < total - 1) {
    currentStep++;
    showStep(currentStep);
    playStepSound();
  } else {
    finishRecipe();
  }
}

function prevStep() {
  if (!currentRecipe || currentStep <= 0) return;
  currentStep--;
  showStep(currentStep);
  playStepSound();
}

// ---- Finish ----
function finishRecipe() {
  stopCookingChatter();
  stopNarration(false);

  const stepsContainer = document.getElementById("steps-container");
  stepsContainer.innerHTML = `
    <div class="done-banner">
      <h2>Recipe Complete</h2>
      <p>${currentRecipe.emoji} <strong>${currentRecipe.name}</strong> is complete!</p>
      <p style="margin-top:10px; font-size:0.95rem;">Great work. Your dish is ready to serve.</p>
    </div>
  `;

  document.getElementById("step-counter").textContent = "Complete!";
  document.getElementById("prev-step-btn").style.display = "none";
  document.getElementById("next-step-btn").style.display = "none";

  chefSay(randomFrom(DONE_PHRASES), "cooking-speech-text");
  playCelebrationSound();
}

// ---- Go Back ----
function goBack() {
  stopCookingChatter();
  stopNarration(true);

  currentRecipe = null;
  currentStep = 0;

  document.getElementById("prev-step-btn").style.display = "";
  document.getElementById("next-step-btn").style.display = "";
  document.getElementById("next-step-btn").textContent = "Next";
  document.getElementById("steps-container").innerHTML = "";

  document.getElementById("cooking-screen").classList.remove("active");
  document.getElementById("search-screen").classList.add("active");

  chefSay(randomFrom(IDLE_PHRASES), "speech-text");
  startIdleChatter();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
  initConsentBanner();

  favorites = normalizeFavoriteIds(loadFavorites());

  if (consentAllowsStorage()) {
    const savedSound = localStorage.getItem(SOUND_STORAGE_KEY);
    if (savedSound === "false") {
      soundEnabled = false;
    }
  }

  const input = document.getElementById("search-input");
  if (input) {
    input.addEventListener("keydown", event => {
      if (event.key === "Enter") searchRecipes();
    });
  }

  document.addEventListener("pointerdown", primeAudio, { once: true });
  document.addEventListener("keydown", primeAudio, { once: true });

  const currentYear = document.getElementById("current-year");
  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  if (narrationSupported()) {
    preferredNarrationVoice = pickNarrationVoice();
    window.speechSynthesis.addEventListener("voiceschanged", () => {
      preferredNarrationVoice = pickNarrationVoice();
    });
  }

  updateFilterButtons();
  updateScopeButtons();
  updateNarrationButton();
  updateSoundButton();
  renderFavoritesPanel();
  searchRecipes();
  startIdleChatter();

  setupInstallPrompt();
  registerServiceWorker();
});
