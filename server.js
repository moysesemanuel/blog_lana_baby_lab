import { createReadStream, existsSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  clearSessionCookie,
  createSessionCookie,
  readSessionFromCookies,
  verifyPassword
} from "./app/auth.js";
import { loadEnv } from "./app/env.js";
import {
  recipeThemes
} from "./app/data.js";
import {
  renderAbout,
  renderCategoryPage,
  renderHome,
  renderProfile,
  renderRecipePage,
  renderRecipesPage,
  renderStudio
} from "./app/components.js";
import {
  canManageRecipe,
  deletePublishedRecipe,
  getCatalog,
  getPublishedRecipes,
  publishRecipe,
  updatePublishedRecipe
} from "./app/store.js";
import { initDatabase, isDatabaseEnabled } from "./app/db.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  initUsersStore,
  isAdminEmail,
  updateUserPassword
} from "./app/users.js";

loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 3004);
const siteUrl = process.env.SITE_URL || `http://localhost:${port}`;
const RECIPES_PER_PAGE = 9;
const isDirectRun =
  Boolean(process.argv[1]) && path.resolve(process.argv[1]) === __filename;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".html": "text/html; charset=utf-8"
};

const sendHtml = (response, html, statusCode = 200) => {
  response.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
  response.end(html);
};

const sendJson = (response, payload, statusCode = 200) => {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
};

const sendJsonWithCookie = (response, payload, cookie, statusCode = 200) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Set-Cookie": cookie
  });
  response.end(JSON.stringify(payload));
};

const redirectTo = (response, location, statusCode = 302) => {
  response.writeHead(statusCode, { Location: location });
  response.end();
};

const sendNotFound = (response) => {
  sendHtml(
    response,
    `<!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Página não encontrada</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div class="page-shell">
          <main class="recipe-page">
            <section class="recipe-hero recipe-hero--berry">
              <a class="recipe-back" href="/">Voltar para a home</a>
              <p class="section-tag">404</p>
              <h1>Essa página não existe.</h1>
              <p class="recipe-page__intro">
                O caminho solicitado não foi encontrado. Use a navegação para voltar ao blog.
              </p>
            </section>
          </main>
        </div>
      </body>
    </html>`,
    404
  );
};

const serveStaticFile = async (response, relativePath) => {
  const filePath = path.join(__dirname, relativePath);

  if (!existsSync(filePath)) {
    sendNotFound(response);
    return;
  }

  const extension = path.extname(filePath);
  response.writeHead(200, {
    "Content-Type": mimeTypes[extension] || "application/octet-stream"
  });

  createReadStream(filePath).pipe(response);
};

const parseUrl = (url) => new URL(url, `http://localhost:${port}`);

const readJsonBody = async (request) =>
  new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });

const bootstrapApp = async () => {
  await initDatabase();
  await initUsersStore();
};

const bootstrapPromise = bootstrapApp();

export const handleRequest = async (request, response) => {
  await bootstrapPromise;

  if (!request.url) {
    sendNotFound(response);
    return;
  }

  const url = parseUrl(request.url);
  const { pathname } = url;
  const catalog = await getCatalog();
  const session = readSessionFromCookies(request.headers.cookie);
  const currentUser = session?.id ? await findUserById(session.id) : null;

  if (request.method === "POST" && pathname === "/api/auth/register") {
    try {
      const payload = await readJsonBody(request);
      const email = String(payload.email ?? "").trim().toLowerCase();
      const password = String(payload.password ?? "");

      if (!email || !password) {
        sendJson(response, { error: "E-mail e senha são obrigatórios." }, 400);
        return;
      }

      if (password.length < 6) {
        sendJson(response, { error: "A senha precisa ter pelo menos 6 caracteres." }, 400);
        return;
      }

      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        sendJson(response, { error: "Já existe uma conta com esse e-mail." }, 409);
        return;
      }

      const user = await createUser({ email, password });
      const publicUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdminEmail: isAdminEmail(user.email)
      };

      sendJsonWithCookie(
        response,
        { ok: true, user: publicUser },
        createSessionCookie(publicUser),
        201
      );
      return;
    } catch {
      sendJson(response, { error: "Corpo da requisição inválido." }, 400);
      return;
    }
  }

  if (request.method === "POST" && pathname === "/api/auth/login") {
    try {
      const payload = await readJsonBody(request);
      const email = String(payload.email ?? "").trim().toLowerCase();
      const password = String(payload.password ?? "");

      const user = await findUserByEmail(email);

      if (!user || !verifyPassword(password, user.passwordHash)) {
        sendJson(response, { error: "Credenciais inválidas." }, 401);
        return;
      }

      const publicUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdminEmail: isAdminEmail(user.email)
      };

      sendJsonWithCookie(
        response,
        { ok: true, user: publicUser },
        createSessionCookie(publicUser),
        200
      );
      return;
    } catch {
      sendJson(response, { error: "Corpo da requisição inválido." }, 400);
      return;
    }
  }

  if (request.method === "POST" && pathname === "/api/auth/logout") {
    sendJsonWithCookie(response, { ok: true }, clearSessionCookie(), 200);
    return;
  }

  if (request.method === "POST" && pathname === "/api/auth/change-password") {
    try {
      if (!currentUser) {
        sendJson(response, { error: "Faça login para alterar a senha." }, 401);
        return;
      }

      const payload = await readJsonBody(request);
      const currentPassword = String(payload.currentPassword ?? "");
      const newPassword = String(payload.newPassword ?? "");
      const confirmPassword = String(payload.confirmPassword ?? "");

      const user = await findUserById(currentUser.id);

      if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
        sendJson(response, { error: "Senha atual inválida." }, 401);
        return;
      }

      if (newPassword.length < 6) {
        sendJson(response, { error: "A nova senha precisa ter pelo menos 6 caracteres." }, 400);
        return;
      }

      if (newPassword !== confirmPassword) {
        sendJson(response, { error: "A confirmação da nova senha não confere." }, 400);
        return;
      }

      await updateUserPassword(user.id, newPassword);
      sendJson(response, { ok: true }, 200);
      return;
    } catch {
      sendJson(response, { error: "Corpo da requisição inválido." }, 400);
      return;
    }
  }

  if (request.method === "POST" && pathname === "/api/recipes") {
    try {
      if (!currentUser) {
        sendJson(response, { error: "Faça login para publicar receitas." }, 401);
        return;
      }

      const payload = await readJsonBody(request);
      const requiredFields = [
        "title",
        "age",
        "excerpt",
        "intro",
        "theme",
        "prepTime",
        "yield",
        "texture",
        "ingredients",
        "steps",
        "tip",
        "serving"
      ];

      const missingField = requiredFields.find((field) => {
        const value = payload[field];
        if (Array.isArray(value)) {
          return value.length === 0;
        }

        return !String(value ?? "").trim();
      });

      if (missingField) {
        sendJson(response, { error: `Campo obrigatório ausente: ${missingField}.` }, 400);
        return;
      }

      if (!recipeThemes.some((theme) => theme.value === payload.theme)) {
        sendJson(response, { error: "Tema visual inválido." }, 400);
        return;
      }

      const recipe = await publishRecipe({
        ...payload,
        author: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email
        },
        ingredients: Array.isArray(payload.ingredients) ? payload.ingredients : [],
        steps: Array.isArray(payload.steps) ? payload.steps : []
      });

      sendJson(response, { ok: true, url: `/receitas/${recipe.slug}`, recipe }, 201);
      return;
    } catch {
      sendJson(response, { error: "Corpo da requisição inválido." }, 400);
      return;
    }
  }

  if (request.method === "PUT" && pathname.startsWith("/api/recipes/")) {
    try {
      if (!currentUser) {
        sendJson(response, { error: "Faça login para editar receitas." }, 401);
        return;
      }

      const slug = pathname.replace("/api/recipes/", "");
      const existingRecipe = (await getPublishedRecipes()).find((recipe) => recipe.slug === slug);

      if (!existingRecipe) {
        sendJson(response, { error: "Receita publicada não encontrada." }, 404);
        return;
      }

      if (!canManageRecipe(currentUser, existingRecipe)) {
        sendJson(response, { error: "Você não pode editar essa receita." }, 403);
        return;
      }

      const payload = await readJsonBody(request);
      const recipe = await updatePublishedRecipe(slug, {
        ...payload,
        ingredients: Array.isArray(payload.ingredients) ? payload.ingredients : [],
        steps: Array.isArray(payload.steps) ? payload.steps : []
      });

      if (!recipe) {
        sendJson(response, { error: "Receita publicada não encontrada." }, 404);
        return;
      }

      sendJson(response, { ok: true, url: `/receitas/${recipe.slug}`, recipe }, 200);
      return;
    } catch {
      sendJson(response, { error: "Corpo da requisição inválido." }, 400);
      return;
    }
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/recipes/")) {
    if (!currentUser) {
      sendJson(response, { error: "Faça login para remover receitas." }, 401);
      return;
    }

    const slug = pathname.replace("/api/recipes/", "");
    const existingRecipe = (await getPublishedRecipes()).find((recipe) => recipe.slug === slug);

    if (!existingRecipe) {
      sendJson(response, { error: "Receita publicada não encontrada." }, 404);
      return;
    }

    if (!canManageRecipe(currentUser, existingRecipe)) {
      sendJson(response, { error: "Você não pode remover essa receita." }, 403);
      return;
    }

    const removed = await deletePublishedRecipe(slug);

    if (!removed) {
      sendJson(response, { error: "Receita publicada não encontrada." }, 404);
      return;
    }

    sendJson(response, { ok: true }, 200);
    return;
  }

  if (request.method !== "GET") {
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Método não permitido.");
    return;
  }

  if (pathname === "/") {
    sendHtml(response, renderHome(siteUrl, catalog));
    return;
  }

  if (pathname === "/sobre") {
    sendHtml(response, renderAbout(siteUrl));
    return;
  }

  if (pathname === "/receitas") {
    const requestedPage = Number(url.searchParams.get("page") || "1");
    const totalRecipes = catalog.recipeList.length;
    const totalPages = Math.max(1, Math.ceil(totalRecipes / RECIPES_PER_PAGE));
    const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
    const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
    const recipesPage = catalog.recipeList.slice(startIndex, startIndex + RECIPES_PER_PAGE);

    sendHtml(
      response,
      renderRecipesPage(
        {
          recipesPage,
          currentPage,
          totalPages,
          totalRecipes,
          perPage: RECIPES_PER_PAGE
        },
        siteUrl
      )
    );
    return;
  }

  if (pathname === "/perfil") {
    sendHtml(response, renderProfile(siteUrl));
    return;
  }

  if (pathname === "/studio") {
    if (!currentUser) {
      redirectTo(response, "/perfil");
      return;
    }

    sendHtml(response, renderStudio(siteUrl));
    return;
  }

  if (pathname.startsWith("/receitas/")) {
    const slug = pathname.replace("/receitas/", "");
    const recipe = catalog.recipeBySlug[slug];

    if (!recipe) {
      sendNotFound(response);
      return;
    }

    sendHtml(response, renderRecipePage(recipe, siteUrl));
    return;
  }

  if (pathname.startsWith("/categorias/")) {
    const slug = pathname.replace("/categorias/", "");
    const category = Object.values(catalog.categories).find((item) => item.slug === slug);

    if (!category) {
      sendNotFound(response);
      return;
    }

    const categoryRecipes = catalog.recipeList.filter(
      (recipe) => recipe.ageKey === category.label.match(/\d+/)?.[0]
    );

    sendHtml(response, renderCategoryPage(category, categoryRecipes, siteUrl));
    return;
  }

  if (pathname === "/api/recipes") {
    const scope = url.searchParams.get("scope");
    const recipes =
      scope === "published" ? await getPublishedRecipes() : catalog.recipeList;

    sendJson(
      response,
      {
        recipes:
          scope === "published"
            ? recipes.map((recipe) => ({
                ...recipe,
                permissions: {
                  canEdit: canManageRecipe(currentUser, recipe),
                  canDelete: canManageRecipe(currentUser, recipe)
                }
              }))
            : recipes,
        currentUser: currentUser
          ? {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              role: currentUser.role
            }
          : null,
        storage: isDatabaseEnabled() ? "database" : "file"
      },
      200
    );
    return;
  }

  if (pathname === "/api/auth/session") {
    sendJson(
      response,
      {
        user: currentUser
          ? {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              role: currentUser.role
            }
          : null
      },
      200
    );
    return;
  }

  if (pathname === "/styles.css") {
    await serveStaticFile(response, "styles.css");
    return;
  }

  if (pathname.startsWith("/app/")) {
    await serveStaticFile(response, pathname.slice(1));
    return;
  }

  if (pathname === "/health") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  sendNotFound(response);
};

export default handleRequest;

if (isDirectRun) {
  const server = http.createServer(handleRequest);

  bootstrapPromise
    .then(() => {
      server.listen(port, () => {
        console.log(
          `Lana Baby Lab rodando em http://localhost:${port} usando ${
            isDatabaseEnabled() ? "Neon/Postgres" : "arquivo local JSON"
          }`
        );
      });
    })
    .catch((error) => {
      console.error("Falha ao inicializar o banco:", error);
      process.exit(1);
    });
}
