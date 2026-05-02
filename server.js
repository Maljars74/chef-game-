"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);
const ROOT = process.cwd();

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon"
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function parseDurationToMinutes(duration) {
  if (!duration || typeof duration !== "string") return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!match) return 0;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  return (hours * 60) + minutes;
}

function normalizeRecipeFromJsonLd(node, query) {
  const name = String(node.name || "").trim();
  if (!name) return null;

  const sourceUrl = typeof node.url === "string" && node.url.trim()
    ? node.url.trim()
    : `https://www.taste.com.au/recipes?q=${encodeURIComponent(query)}`;

  const ingredients = Array.isArray(node.recipeIngredient)
    ? node.recipeIngredient.map(item => String(item).trim()).filter(Boolean)
    : [];

  let steps = [];
  if (typeof node.recipeInstructions === "string") {
    steps = node.recipeInstructions
      .split(/\n+|\.\s+/)
      .map(line => line.trim())
      .filter(Boolean)
      .slice(0, 8);
  } else if (Array.isArray(node.recipeInstructions)) {
    steps = node.recipeInstructions
      .map(item => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") return String(item.text || item.name || "").trim();
        return "";
      })
      .filter(Boolean)
      .slice(0, 8);
  }

  const minutes = parseDurationToMinutes(String(node.totalTime || ""));
  const time = minutes > 0 ? `${Math.max(10, minutes)} min` : "15-35 min";
  const difficulty = ingredients.length >= 12 ? "Medium" : "Easy";

  return {
    name,
    sourceUrl,
    time,
    difficulty,
    servings: "2-4 servings",
    tags: ["web", "taste", "australian"],
    ingredients,
    steps
  };
}

function collectRecipeNodes(node, out) {
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
}

function extractRecipesFromJsonLd(html, query) {
  const recipes = [];
  const seen = new Set();
  const scripts = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];

  scripts.forEach(scriptTag => {
    const contentMatch = scriptTag.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const jsonText = contentMatch ? contentMatch[1].trim() : "";
    if (!jsonText) return;

    try {
      const parsed = JSON.parse(jsonText);
      const recipeNodes = [];
      collectRecipeNodes(parsed, recipeNodes);

      recipeNodes.forEach(node => {
        const recipe = normalizeRecipeFromJsonLd(node, query);
        if (!recipe || !recipe.sourceUrl || seen.has(recipe.sourceUrl)) return;
        seen.add(recipe.sourceUrl);
        recipes.push(recipe);
      });
    } catch {
      // Ignore malformed JSON blocks.
    }
  });

  return recipes;
}

function extractRecipesFromLinks(html, query) {
  const recipes = [];
  const seen = new Set();
  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const queryLower = query.toLowerCase();

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const rawUrl = String(match[1] || "").trim();
    const rawTitle = String(match[2] || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!rawUrl || !rawTitle) continue;

    const absoluteUrl = rawUrl.startsWith("http")
      ? rawUrl
      : `https://www.taste.com.au${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

    if (!absoluteUrl.includes("taste.com.au/recipes")) continue;
    if (seen.has(absoluteUrl)) continue;

    const titleLower = rawTitle.toLowerCase();
    const looksLikeRecipe = /recipe|chicken|cake|pasta|beef|salad|soup|curry|taco/.test(titleLower) || titleLower.includes(queryLower);
    const isLikelyNav = titleLower.length < 8 || /(search|home|recipes|subscribe|login|sign up|profile|videos|articles)/i.test(titleLower);
    if (!looksLikeRecipe || isLikelyNav) continue;

    seen.add(absoluteUrl);
    recipes.push({
      name: rawTitle,
      sourceUrl: absoluteUrl,
      time: "15-35 min",
      difficulty: "Easy",
      servings: "2-4 servings",
      tags: ["web", "taste", "australian"],
      ingredients: [],
      steps: []
    });

    if (recipes.length >= 12) break;
  }

  return recipes;
}

async function searchTasteRecipes(query) {
  const url = `https://www.taste.com.au/recipes?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) {
    throw new Error(`Taste search failed with status ${response.status}`);
  }

  const html = await response.text();
  const jsonLdRecipes = extractRecipesFromJsonLd(html, query);
  if (jsonLdRecipes.length) return jsonLdRecipes;

  return extractRecipesFromLinks(html, query);
}

async function searchMouthsOfMumsRecipes(query) {
  const url = `https://mouthsofmums.com.au/recipes/?s=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) {
    throw new Error(`Mouths of Mums search failed with status ${response.status}`);
  }

  const html = await response.text();
  const jsonLdRecipes = extractRecipesFromJsonLd(html, query);
  if (jsonLdRecipes.length) return jsonLdRecipes;

  return extractRecipesFromLinks(html, query);
}

async function searchBBCGoodFoodRecipes(query) {
  const url = `https://www.bbcgoodfood.com/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) {
    throw new Error(`BBC Good Food search failed with status ${response.status}`);
  }

  const html = await response.text();
  const jsonLdRecipes = extractRecipesFromJsonLd(html, query);
  if (jsonLdRecipes.length) return jsonLdRecipes;

  return extractRecipesFromLinks(html, query);
}

function serveStatic(req, res, parsedUrl) {
  const requestPath = decodeURIComponent(parsedUrl.pathname || "/");
  const safePath = path.normalize(requestPath).replace(/^\.\.(\/|\\|$)/, "");
  const resolvedPath = safePath === "/" ? "/index.html" : safePath;
  const filePath = path.join(ROOT, resolvedPath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
    const cacheControl = ext === ".html" ? "no-cache" : "public, max-age=3600";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": cacheControl
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || `localhost:${PORT}`}`);

    if (req.method === "GET" && parsedUrl.pathname === "/healthz") {
      sendJson(res, 200, { ok: true, service: "copper-spoon-kitchen" });
      return;
    }

    if (req.method === "GET" && parsedUrl.pathname === "/api/taste/search") {
      const q = String(parsedUrl.searchParams.get("q") || "").trim();
      if (!q) {
        sendJson(res, 200, { recipes: [] });
        return;
      }

      try {
        const recipes = await searchTasteRecipes(q);
        sendJson(res, 200, { recipes: recipes.slice(0, 12) });
      } catch (error) {
        sendJson(res, 200, {
          recipes: [],
          error: "Taste provider unavailable",
          detail: String(error && error.message ? error.message : error)
        });
      }
      return;
    }

    if (req.method === "GET" && parsedUrl.pathname === "/api/mouthsofmums/search") {
      const q = String(parsedUrl.searchParams.get("q") || "").trim();
      if (!q) {
        sendJson(res, 200, { recipes: [] });
        return;
      }

      try {
        const recipes = await searchMouthsOfMumsRecipes(q);
        sendJson(res, 200, { recipes: recipes.slice(0, 12) });
      } catch (error) {
        sendJson(res, 200, {
          recipes: [],
          error: "Mouths of Mums provider unavailable",
          detail: String(error && error.message ? error.message : error)
        });
      }
      return;
    }

    if (req.method === "GET" && parsedUrl.pathname === "/api/bbcgoodfood/search") {
      const q = String(parsedUrl.searchParams.get("q") || "").trim();
      if (!q) {
        sendJson(res, 200, { recipes: [] });
        return;
      }

      try {
        const recipes = await searchBBCGoodFoodRecipes(q);
        sendJson(res, 200, { recipes: recipes.slice(0, 12) });
      } catch (error) {
        sendJson(res, 200, {
          recipes: [],
          error: "BBC Good Food provider unavailable",
          detail: String(error && error.message ? error.message : error)
        });
      }
      return;
    }

    serveStatic(req, res, parsedUrl);
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Internal server error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Copper Spoon server running at http://${HOST}:${PORT}`);
});
