import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { categories, recipeList as baseRecipeList, recipes as baseRecipes } from "./data.js";
import { dbQuery, isDatabaseEnabled } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, "..", "content");
const publishedRecipesFile = path.join(contentDir, "published-recipes.json");

const ensureStore = () => {
  if (!existsSync(contentDir)) {
    mkdirSync(contentDir, { recursive: true });
  }

  if (!existsSync(publishedRecipesFile)) {
    writeFileSync(publishedRecipesFile, "[]\n", "utf8");
  }
};

const readPublishedRecipesFromFile = () => {
  ensureStore();

  try {
    const content = readFileSync(publishedRecipesFile, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getPublishedRecipes = async () => {
  if (isDatabaseEnabled()) {
    const result = await dbQuery(
      `
        SELECT recipe
        FROM published_recipes
        ORDER BY updated_at DESC, created_at DESC
      `
    );

    return result.rows.map((row) => row.recipe);
  }

  return readPublishedRecipesFromFile();
};

const writePublishedRecipes = (recipes) => {
  ensureStore();
  writeFileSync(publishedRecipesFile, `${JSON.stringify(recipes, null, 2)}\n`, "utf8");
};

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const ageToKey = (age) => {
  const match = age.match(/\d+/);
  return match ? match[0] : "8";
};

const resolveYoutubeThumbnail = (value = "") => {
  const input = String(value).trim();

  if (!input) {
    return "";
  }

  if (input.includes("i.ytimg.com") || input.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i)) {
    return input;
  }

  try {
    const url = new URL(input);
    let videoId = "";

    if (url.hostname.includes("youtu.be")) {
      videoId = url.pathname.replace(/\//g, "");
    } else if (url.hostname.includes("youtube.com")) {
      videoId = url.searchParams.get("v") || "";
      if (!videoId && url.pathname.startsWith("/shorts/")) {
        videoId = url.pathname.split("/")[2] || "";
      }
    }

    return videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : "";
  } catch {
    return "";
  }
};

const buildKeywords = (recipe) =>
  [
    recipe.title,
    recipe.excerpt,
    recipe.ingredients.join(" "),
    recipe.steps.join(" ")
  ]
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const getCatalog = async () => {
  const publishedRecipes = await getPublishedRecipes();
  const recipeList = [...publishedRecipes, ...baseRecipeList];
  const recipeBySlug = Object.fromEntries(recipeList.map((recipe) => [recipe.slug, recipe]));

  return {
    categories,
    recipeList,
    recipeBySlug,
    recipes: {
      ...baseRecipes,
      ...Object.fromEntries(publishedRecipes.map((recipe) => [recipe.slug, recipe]))
    }
  };
};

export const publishRecipe = async (input) => {
  const publishedRecipes = await getPublishedRecipes();
  const baseSlug = slugify(input.title || "receita");
  let slug = baseSlug || "receita";
  let suffix = 2;

  const slugAlreadyExists = (candidate) =>
    publishedRecipes.some((recipe) => recipe.slug === candidate) ||
    baseRecipeList.some((recipe) => recipe.slug === candidate);

  while (slugAlreadyExists(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const recipe = {
    slug,
    authorId: input.author.id,
    authorName: input.author.name,
    authorEmail: input.author.email,
    age: input.age,
    ageKey: ageToKey(input.age),
    title: input.title,
    excerpt: input.excerpt,
    keywords: buildKeywords(input),
    theme: input.theme,
    art: "custom",
    emoji: input.emoji || "🍽️",
    intro: input.intro,
    meta: [
      ["Tempo", input.prepTime],
      ["Rendimento", input.yield],
      ["Textura", input.texture]
    ],
    youtubeUrl: String(input.youtubeUrl || "").trim(),
    youtubeThumbnail: resolveYoutubeThumbnail(input.youtubeUrl || input.youtubeThumbnail || ""),
    ingredients: input.ingredients,
    steps: input.steps,
    tip: input.tip,
    serving: input.serving,
    createdAt: new Date().toISOString()
  };

  if (isDatabaseEnabled()) {
    await dbQuery(
      `
        INSERT INTO published_recipes (slug, recipe)
        VALUES ($1, $2::jsonb)
      `,
      [recipe.slug, JSON.stringify(recipe)]
    );
  } else {
    writePublishedRecipes([recipe, ...publishedRecipes]);
  }

  return recipe;
};

export const updatePublishedRecipe = async (slug, input) => {
  const publishedRecipes = await getPublishedRecipes();
  const recipeIndex = publishedRecipes.findIndex((recipe) => recipe.slug === slug);

  if (recipeIndex === -1) {
    return null;
  }

  const current = publishedRecipes[recipeIndex];
  const updated = {
    ...current,
    age: input.age,
    ageKey: ageToKey(input.age),
    title: input.title,
    excerpt: input.excerpt,
    keywords: buildKeywords(input),
    theme: input.theme,
    emoji: input.emoji || current.emoji || "🍽️",
    intro: input.intro,
    meta: [
      ["Tempo", input.prepTime],
      ["Rendimento", input.yield],
      ["Textura", input.texture]
    ],
    youtubeUrl: String(input.youtubeUrl || "").trim(),
    youtubeThumbnail: resolveYoutubeThumbnail(input.youtubeUrl || input.youtubeThumbnail || ""),
    ingredients: input.ingredients,
    steps: input.steps,
    tip: input.tip,
    serving: input.serving,
    updatedAt: new Date().toISOString()
  };

  publishedRecipes[recipeIndex] = updated;
  if (isDatabaseEnabled()) {
    await dbQuery(
      `
        UPDATE published_recipes
        SET recipe = $2::jsonb, updated_at = NOW()
        WHERE slug = $1
      `,
      [slug, JSON.stringify(updated)]
    );
  } else {
    writePublishedRecipes(publishedRecipes);
  }

  return updated;
};

export const deletePublishedRecipe = async (slug) => {
  const publishedRecipes = await getPublishedRecipes();
  const nextRecipes = publishedRecipes.filter((recipe) => recipe.slug !== slug);

  if (nextRecipes.length === publishedRecipes.length) {
    return false;
  }

  if (isDatabaseEnabled()) {
    await dbQuery(`DELETE FROM published_recipes WHERE slug = $1`, [slug]);
  } else {
    writePublishedRecipes(nextRecipes);
  }

  return true;
};

export const canManageRecipe = (user, recipe) =>
  Boolean(user) && (user.role === "admin" || recipe.authorId === user.id);
