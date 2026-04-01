import {
  categories,
  recipeThemes,
  recipes,
  site,
  studioTemplate
} from "./data.js";

const stripTrailingSlash = (value) => value.replace(/\/$/, "");

const absoluteUrl = (siteUrl, pathname = "/") => {
  const normalizedSiteUrl = stripTrailingSlash(siteUrl);
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${normalizedSiteUrl}${normalizedPath}`;
};

const toJsonLd = (items = []) =>
  items
    .map(
      (item) =>
        `<script type="application/ld+json">${JSON.stringify(item)}</script>`
    )
    .join("");

const documentTemplate = ({
  title,
  body,
  pageClass = "",
  seo = {},
  siteUrl = site.url
}) => `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${seo.description ?? site.description}" />
    <link rel="canonical" href="${absoluteUrl(siteUrl, seo.pathname ?? "/")}" />
    <meta property="og:site_name" content="${site.name}" />
    <meta property="og:title" content="${seo.ogTitle ?? title}" />
    <meta property="og:description" content="${seo.description ?? site.description}" />
    <meta property="og:type" content="${seo.ogType ?? "website"}" />
    <meta property="og:url" content="${absoluteUrl(siteUrl, seo.pathname ?? "/")}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${seo.ogTitle ?? title}" />
    <meta name="twitter:description" content="${seo.description ?? site.description}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&family=Nunito:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/styles.css" />
    ${toJsonLd(seo.jsonLd)}
  </head>
  <body class="${pageClass}">
    <div class="page-shell">
      ${body}
    </div>
    <script type="module" src="/app/client.js"></script>
  </body>
</html>`;

const heroArt = () => `
  <div class="hero__art" aria-hidden="true">
    <div class="cloud cloud--one"></div>
    <div class="cloud cloud--two"></div>
    <div class="bowl">
      <div class="bowl__steam bowl__steam--one"></div>
      <div class="bowl__steam bowl__steam--two"></div>
      <div class="bowl__steam bowl__steam--three"></div>
      <div class="bowl__face">
        <span></span>
        <span></span>
        <div class="bowl__mouth"></div>
      </div>
    </div>
    <div class="star star--one"></div>
    <div class="star star--two"></div>
    <div class="star star--three"></div>
  </div>
`;

const topbar = (current = "") => `
  <nav class="topbar">
    <a class="brand" href="/">${site.name}</a>
    <div class="topbar__links">
      <a href="/#idades"${current === "idades" ? ' aria-current="page"' : ""}>Idades</a>
      <a href="/receitas"${current === "receitas" ? ' aria-current="page"' : ""}>Receitas</a>
      <a href="/#dicas">Dicas</a>
      <a href="/#rotina">Rotina</a>
      <a href="/sobre"${current === "sobre" ? ' aria-current="page"' : ""}>Sobre</a>
    </div>
    <div class="topbar__profile" id="topbar-profile"></div>
  </nav>
`;

const footer = () => `
  <footer class="site-footer">
    <div>
      <h2>${site.name}</h2>
      <p>${site.description}</p>
    </div>
    <div class="site-footer__links">
      <a href="/#idades">Por idade</a>
      <a href="/receitas">Receitas</a>
      <a href="/#newsletter">Newsletter</a>
      <a href="/sobre">Sobre o blog</a>
    </div>
    <div class="site-footer__bottom">
      <p class="site-footer__credit">DaBi Tech - Digital Solutions<br>
      Produtos digitais com posicionamento, clareza e execução.
      </p>
    </div>
  </footer>
`;

const recipeArt = (recipe) => `
  <div class="recipe-card__art recipe-card__art--${recipe.art}" aria-hidden="true">
    <span class="recipe-card__blob"></span>
    <span class="recipe-card__emoji">${recipe.emoji}</span>
  </div>
`;

export const recipeCard = (recipe) => `
  <article
    class="recipe-card recipe-card--${recipe.theme}"
    data-age="${recipe.ageKey}"
    data-keywords="${recipe.keywords}"
    data-preview-title="${recipe.title}"
    data-preview-description="${recipe.steps[0]} ${recipe.steps[1] ?? ""}"
  >
    ${recipeArt(recipe)}
    <span class="recipe-card__age">${recipe.age}</span>
    <h3>${recipe.title}</h3>
    <p>${recipe.excerpt}</p>
    <a class="recipe-card__button" href="/receitas/${recipe.slug}">
      Ver receita
    </a>
  </article>
`;

const categoryCard = (category) => `
  <a class="age-category-card age-category-card--${category.theme}" href="/categorias/${category.slug}">
    <strong>${category.label}</strong>
    <span>${category.description}</span>
  </a>
`;

const studioPreview = (recipe = studioTemplate) => `
  <section class="recipe-hero recipe-hero--${recipe.theme}" id="studio-preview">
    <a class="recipe-back" href="#studio-form">Template padrão</a>
    <p class="section-tag">${recipe.age}</p>
    <h1>${recipe.title}</h1>
    <p class="recipe-page__intro">${recipe.intro}</p>
    <div class="recipe-meta">
      <article><strong>Tempo</strong><span>${recipe.prepTime}</span></article>
      <article><strong>Rendimento</strong><span>${recipe.yield}</span></article>
      <article><strong>Textura</strong><span>${recipe.texture}</span></article>
    </div>
  </section>
  <section class="recipe-layout">
    <article class="recipe-panel">
      <h2>Ingredientes</h2>
      <ul class="recipe-list">
        ${recipe.ingredients.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </article>
    <article class="recipe-panel">
      <h2>Modo de preparo</h2>
      <ol class="recipe-list recipe-list--ordered">
        ${recipe.steps.map((item) => `<li>${item}</li>`).join("")}
      </ol>
    </article>
  </section>
  <section class="recipe-layout">
    <article class="recipe-panel">
      <h2>Dica carinhosa</h2>
      <p>${recipe.tip}</p>
    </article>
    <article class="recipe-panel">
      <h2>Como servir</h2>
      <p>${recipe.serving}</p>
    </article>
  </section>
`;

export const renderHome = (siteUrl = site.url, catalog = { categories, recipeList: Object.values(recipes) }) =>
  documentTemplate({
    title: site.name,
    siteUrl,
    seo: {
      pathname: "/",
      description:
        "Blog de receitas para bebês com receitas suaves, ideias por idade e dicas carinhosas para a introdução alimentar.",
      ogTitle: `${site.name} | Receitas Para Bebês`,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: absoluteUrl(siteUrl, "/"),
          description:
            "Blog de receitas para bebês com receitas suaves, ideias por idade e dicas carinhosas para a introdução alimentar."
        }
      ]
    },
    body: `
      <header class="hero">
        <div class="hero__badge">Receitas para 6+ meses</div>
        ${topbar("receitas")}
        <section class="hero__content">
          <div class="hero__text">
            <p class="eyebrow">Sabores suaves, cores alegres e muita fofura</p>
            <h1>Um blog de receitas para bebês com cara de brincadeira.</h1>
            <p class="hero__description">
              Ideias nutritivas, fáceis de preparar e apresentadas em um espaço leve, colorido e acolhedor para mães, pais e cuidadores.
            </p>
            <div class="hero__actions">
              <a class="button button--primary" href="/receitas">Ver receitas</a>
              <a class="button button--ghost" href="#dicas">Ler dicas</a>
            </div>
          </div>
          ${heroArt()}
        </section>
      </header>

      <main>
        <section class="highlight-grid" id="rotina">
          <article class="highlight-card">
            <h2>Texturas que acolhem</h2>
            <p>Papinhas, cremes e preparos macios pensados para cada fase da introdução alimentar.</p>
          </article>
          <article class="highlight-card">
            <h2>Ingredientes simples</h2>
            <p>Frutas, legumes, grãos e combinações do dia a dia em receitas práticas.</p>
          </article>
          <article class="highlight-card">
            <h2>Momento em família</h2>
            <p>Um cantinho carinhoso para transformar a refeição em descoberta e afeto.</p>
          </article>
        </section>

        <section class="age-categories" id="idades">
          <div class="section-heading">
            <p class="section-tag">Explore por fase</p>
            <h2>Receitas organizadas por idade do bebê</h2>
          </div>
          <div class="age-categories__grid">
            ${Object.values(catalog.categories).map((category) => categoryCard(category)).join("")}
          </div>
        </section>

        <section class="recipes" id="receitas">
          <div class="section-heading">
            <p class="section-tag">Receitas queridinhas</p>
            <h2>Algumas delícias suaves para pequenos exploradores</h2>
          </div>
          <div class="recipes-listing-intro">
            <p>
              Uma seleção especial para começar. Se quiser explorar mais combinações, veja a coleção completa de receitas.
            </p>
            <a class="button button--ghost" href="/receitas">Ver todas as receitas</a>
          </div>
          <div class="recipe-grid" id="recipe-grid">
            ${catalog.recipeList.slice(0, 6).map((recipe) => recipeCard(recipe)).join("")}
          </div>
        </section>

        <section class="tips" id="dicas">
          <div class="section-heading">
            <p class="section-tag">Dicas carinhosas</p>
            <h2>Pequenos cuidados que deixam tudo mais leve</h2>
          </div>
          <div class="tips__content">
            <div class="tips__list">
              <article>
                <h3>Ofereça cores diferentes</h3>
                <p>Misturar ingredientes de cores variadas deixa o prato mais divertido e estimula a curiosidade do bebê.</p>
              </article>
              <article>
                <h3>Respeite o tempo do bebê</h3>
                <p>Cada descoberta acontece aos poucos. O importante é manter o momento tranquilo e sem pressa.</p>
              </article>
              <article>
                <h3>Prefira preparos naturais</h3>
                <p>Temperos suaves, alimentos frescos e receitas caseiras ajudam a construir bons hábitos desde cedo.</p>
              </article>
            </div>
            <aside class="tips__panel">
              <p class="tips__panel-label">Receita em destaque</p>
              <h3>${recipes.abobora.title}</h3>
              <p>${recipes.abobora.steps[0]} ${recipes.abobora.steps[1]}</p>
            </aside>
          </div>
        </section>

        <section class="newsletter" id="newsletter">
          <div class="newsletter__content">
            <div>
              <p class="section-tag">Para mães, pais e cuidadores</p>
              <h2>Receba ideias semanais de receitinhas e rotina leve</h2>
              <p class="newsletter__text">
                Um lembrete fofo no seu e-mail com sugestões por idade, combinações de ingredientes e pequenas inspirações para a semana.
              </p>
            </div>
            <form class="newsletter__form" id="newsletter-form">
              <label for="newsletter-name">Nome</label>
              <input id="newsletter-name" name="name" type="text" placeholder="Quem vai cozinhar por aí?" required />
              <label for="newsletter-email">E-mail</label>
              <input id="newsletter-email" name="email" type="email" placeholder="voce@exemplo.com" required />
              <button class="button button--primary newsletter__submit" type="submit">Quero receber</button>
              <p class="newsletter__feedback" id="newsletter-feedback" aria-live="polite"></p>
            </form>
          </div>
        </section>
      </main>
      ${footer()}
    `
  });

export const renderRecipesPage = (
  {
    recipesPage,
    currentPage,
    totalPages,
    totalRecipes,
    perPage
  },
  siteUrl = site.url
) =>
  documentTemplate({
    title: `Receitas | ${site.name}`,
    siteUrl,
    seo: {
      pathname: currentPage > 1 ? `/receitas?page=${currentPage}` : "/receitas",
      description:
        "Coleção de receitas para bebês com ideias suaves, combinações práticas e inspirações para diferentes fases da introdução alimentar.",
      ogTitle: `Receitas | ${site.name}`
    },
    body: `
      <header class="hero">
        ${topbar("receitas")}
        <section class="hero__content">
          <div class="hero__text">
            <p class="eyebrow">Coleção de receitas</p>
            <h1>Encontre ideias gostosas e delicadas para cada momento do bebê.</h1>
            <p class="hero__description">
              Página ${currentPage} de ${totalPages}, com ${totalRecipes} receitas para explorar com calma.
            </p>
          </div>
          ${heroArt()}
        </section>
      </header>

      <main class="recipes-archive-page">
        <section class="recipes">
          <div class="section-heading">
            <p class="section-tag">Todas as receitas</p>
            <h2>Sabores suaves para acompanhar essa fase com carinho</h2>
          </div>
          <div class="recipes-listing-intro">
            <p>Explore as receitas aos poucos e escolha as combinações que mais combinam com a rotina da sua família.</p>
          </div>
          <div class="recipe-grid">
            ${recipesPage.map((recipe) => recipeCard(recipe)).join("")}
          </div>
          <nav class="pagination" aria-label="Paginação de receitas">
            ${
              currentPage > 1
                ? `<a class="pagination__button" href="/receitas?page=${currentPage - 1}">Anterior</a>`
                : `<span class="pagination__button pagination__button--disabled">Anterior</span>`
            }
            <div class="pagination__pages">
              ${Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                return `<a class="pagination__page${
                  page === currentPage ? " is-active" : ""
                }" href="/receitas?page=${page}">${page}</a>`;
              }).join("")}
            </div>
            ${
              currentPage < totalPages
                ? `<a class="pagination__button" href="/receitas?page=${currentPage + 1}">Próxima</a>`
                : `<span class="pagination__button pagination__button--disabled">Próxima</span>`
            }
          </nav>
        </section>
      </main>
      ${footer()}
    `
  });

export const renderAbout = (siteUrl = site.url) =>
  documentTemplate({
    title: `Sobre | ${site.name}`,
    siteUrl,
    seo: {
      pathname: "/sobre",
      description:
        "Conheça a proposta do Panelinha do Bebê, um blog com receitas infantis, rotina leve e inspiração para famílias.",
      ogTitle: `Sobre o ${site.name}`,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: `Sobre | ${site.name}`,
          url: absoluteUrl(siteUrl, "/sobre"),
          description:
            "Conheça a proposta do Panelinha do Bebê, um blog com receitas infantis, rotina leve e inspiração para famílias."
        }
      ]
    },
    body: `
      <header class="hero">
        ${topbar("sobre")}
        <section class="hero__content">
          <div class="hero__text">
            <p class="eyebrow">Quem está por trás desse cantinho</p>
            <h1>Um blog pensado para acolher a rotina alimentar dos pequenos.</h1>
            <p class="hero__description">
              O Panelinha do Bebê nasceu para reunir receitas delicadas, ideias práticas e uma linguagem leve para famílias que estão descobrindo novos sabores junto com seus bebês.
            </p>
          </div>
          ${heroArt()}
        </section>
      </header>

      <main>
        <section class="about-grid">
          <article class="about-card">
            <h2>Nosso jeitinho</h2>
            <p>A proposta é simples: mostrar que comida de bebê pode ser nutritiva, bonita, tranquila de preparar e apresentada com afeto.</p>
          </article>
          <article class="about-card">
            <h2>O que você encontra</h2>
            <p>Receitas por idade, combinações leves, ideias de lanches e sugestões para tornar a rotina alimentar mais gentil.</p>
          </article>
          <article class="about-card">
            <h2>Importante lembrar</h2>
            <p>Cada bebê tem seu tempo. O blog é um espaço de inspiração e não substitui a orientação do pediatra ou nutricionista.</p>
          </article>
        </section>
        <section class="about-story">
          <article class="recipe-panel">
            <h2>Por que esse blog existe</h2>
            <p>Porque a introdução alimentar costuma vir acompanhada de dúvidas, expectativas e muito carinho. A ideia aqui é reduzir a pressão e valorizar preparos simples, com ingredientes acessíveis e clima leve.</p>
          </article>
          <article class="recipe-panel">
            <h2>Como navegar</h2>
            <p>Você pode explorar as receitas pela idade do bebê, pela busca na home ou visitar as páginas individuais para ver ingredientes, preparo e dicas de servir.</p>
          </article>
        </section>
      </main>
      ${footer()}
    `
  });

export const renderStudio = (siteUrl = site.url) =>
  documentTemplate({
    title: `Studio | ${site.name}`,
    siteUrl,
    seo: {
      pathname: "/studio",
      description:
        "Área de criação de receitas com template padrão, visualização em tempo real e salvamento de rascunhos.",
      ogTitle: `Studio de Receitas | ${site.name}`
    },
    body: `
      <header class="hero">
        ${topbar("studio")}
        <section class="hero__content">
          <div class="hero__text">
            <p class="eyebrow">Cadastro simples para novas receitas</p>
            <h1>Monte a receita no formulário e veja na hora como ela vai ficar.</h1>
            <p class="hero__description">
              Esse studio foi pensado para preenchimento gradual. Dá para editar, salvar rascunhos no navegador e usar sempre o mesmo template visual.
            </p>
          </div>
          ${heroArt()}
        </section>
      </header>

      <main class="studio-page">
        <section class="studio-layout">
          <section class="studio-panel">
            <div class="section-heading">
              <p class="section-tag">Template padrão</p>
              <h2>Preenchimento da receita</h2>
            </div>

            <form class="studio-form" id="studio-form">
              <label>
                <span>Título</span>
                <input name="title" type="text" value="${studioTemplate.title}" />
              </label>
              <label>
                <span>Faixa etária</span>
                <input name="age" type="text" value="${studioTemplate.age}" />
              </label>
              <label>
                <span>Resumo curto</span>
                <textarea name="excerpt" rows="3">${studioTemplate.excerpt}</textarea>
              </label>
              <label>
                <span>Introdução</span>
                <textarea name="intro" rows="4">${studioTemplate.intro}</textarea>
              </label>
              <div class="studio-form__grid">
                <label>
                  <span>Tempo</span>
                  <input name="prepTime" type="text" value="${studioTemplate.prepTime}" />
                </label>
                <label>
                  <span>Rendimento</span>
                  <input name="yield" type="text" value="${studioTemplate.yield}" />
                </label>
              </div>
              <div class="studio-form__grid">
                <label>
                  <span>Textura</span>
                  <input name="texture" type="text" value="${studioTemplate.texture}" />
                </label>
                <label>
                  <span>Emoji da receita</span>
                  <input name="emoji" type="text" value="${studioTemplate.emoji}" />
                </label>
              </div>
              <label>
                <span>Tema visual</span>
                <select name="theme">
                  ${recipeThemes
                    .map(
                      (theme) =>
                        `<option value="${theme.value}"${
                          theme.value === studioTemplate.theme ? " selected" : ""
                        }>${theme.label}</option>`
                    )
                    .join("")}
                </select>
              </label>
              <label>
                <span>Ingredientes, um por linha</span>
                <textarea name="ingredients" rows="6">${studioTemplate.ingredients.join("\n")}</textarea>
              </label>
              <label>
                <span>Modo de preparo, um passo por linha</span>
                <textarea name="steps" rows="6">${studioTemplate.steps.join("\n")}</textarea>
              </label>
              <label>
                <span>Dica carinhosa</span>
                <textarea name="tip" rows="3">${studioTemplate.tip}</textarea>
              </label>
              <label>
                <span>Como servir</span>
                <textarea name="serving" rows="3">${studioTemplate.serving}</textarea>
              </label>

              <div class="studio-actions">
                <button class="button button--primary" type="button" id="studio-save">
                  Salvar rascunho
                </button>
                <button class="button button--primary studio-publish" type="button" id="studio-publish">
                  Publicar no blog
                </button>
                <button class="button button--ghost" type="button" id="studio-reset">
                  Novo rascunho
                </button>
              </div>

              <input type="hidden" name="publishedSlug" value="" />
              <p class="studio-feedback" id="studio-feedback" aria-live="polite"></p>
            </form>
            <div class="studio-locked" id="studio-locked" hidden>
              Faça login em <a href="/perfil">Perfil</a> para publicar, editar ou remover receitas.
            </div>

            <section class="studio-drafts">
              <div class="section-heading">
                <p class="section-tag">Rascunhos</p>
                <h2>Receitas salvas neste navegador</h2>
              </div>
              <div class="studio-drafts__list" id="studio-drafts-list"></div>
            </section>

            <section class="studio-drafts">
              <div class="section-heading">
                <p class="section-tag">Publicadas</p>
                <h2>Receitas já no blog</h2>
              </div>
              <div class="studio-drafts__list" id="studio-published-list"></div>
            </section>
          </section>

          <section class="studio-preview-wrap">
            <div class="section-heading">
              <p class="section-tag">Visualização</p>
              <h2>Prévia da receita</h2>
            </div>
            <div class="studio-preview-root" id="studio-preview-root">
              ${studioPreview(studioTemplate)}
            </div>
          </section>
        </section>
      </main>

      ${footer()}
    `
  });

export const renderProfile = (siteUrl = site.url) =>
  documentTemplate({
    title: `Perfil | ${site.name}`,
    siteUrl,
    seo: {
      pathname: "/perfil",
      description:
        "Área de perfil para login, cadastro e gerenciamento de acesso dos colaboradores do blog.",
      ogTitle: `Perfil | ${site.name}`
    },
    body: `
      <header class="hero">
        ${topbar("perfil")}
        <section class="hero__content">
          <div class="hero__text">
            <p class="eyebrow">Acesso da administradora</p>
            <h1>Entre com sua conta para publicar e gerenciar receitas.</h1>
            <p class="hero__description">
              Neste momento, o acesso ao Studio está restrito para manter o blog organizado enquanto as receitas são cadastradas com calma.
            </p>
          </div>
          ${heroArt()}
        </section>
      </header>

      <main class="profile-page">
        <section class="studio-panel">
          <div class="section-heading">
            <p class="section-tag">Perfil</p>
            <h2>Login</h2>
          </div>

          <div class="studio-auth__status" id="studio-auth-status">
            Verificando sessão...
          </div>

          <form class="studio-form profile-auth-form" id="profile-auth-form">
            <label>
              <span>E-mail</span>
              <input name="email" type="email" placeholder="voce@exemplo.com" />
            </label>
            <label>
              <span>Senha</span>
              <input name="password" type="password" placeholder="Sua senha" />
            </label>
            <div class="studio-actions">
              <button class="button button--primary" type="submit" id="profile-submit">
                Entrar
              </button>
              <button class="button button--ghost" type="button" id="studio-logout" hidden>
                Sair
              </button>
            </div>
          </form>

          <p class="studio-feedback" id="studio-auth-feedback" aria-live="polite"></p>
        </section>

        <section class="studio-panel profile-password-panel" id="profile-password-panel" hidden>
          <div class="section-heading">
            <p class="section-tag">Segurança</p>
            <h2>Redefinir senha</h2>
          </div>

          <form class="studio-form" id="profile-password-form">
            <label>
              <span>Senha atual</span>
              <input name="currentPassword" type="password" placeholder="Digite a senha atual" />
            </label>
            <label>
              <span>Nova senha</span>
              <input name="newPassword" type="password" placeholder="Digite a nova senha" />
            </label>
            <label>
              <span>Confirmar nova senha</span>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Repita a nova senha"
              />
            </label>
            <div class="studio-actions">
              <button class="button button--primary" type="submit" id="profile-password-submit">
                Atualizar senha
              </button>
            </div>
          </form>

          <p class="studio-feedback" id="profile-password-feedback" aria-live="polite"></p>
        </section>
      </main>

      ${footer()}
    `
  });

export const renderRecipePage = (recipe, siteUrl = site.url) => {

  return documentTemplate({
    title: recipe.title,
    siteUrl,
    seo: {
      pathname: `/receitas/${recipe.slug}`,
      description: `${recipe.excerpt} ${recipe.intro}`,
      ogTitle: `${recipe.title} | ${site.name}`,
      ogType: "article",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Recipe",
          name: recipe.title,
          description: `${recipe.excerpt} ${recipe.intro}`,
          url: absoluteUrl(siteUrl, `/receitas/${recipe.slug}`),
          recipeYield: recipe.meta.find(([label]) => label === "Rendimento")?.[1],
          totalTime: recipe.meta.find(([label]) => label === "Tempo")?.[1],
          recipeCategory: `Receitas para bebês ${recipe.age}`,
          recipeCuisine: "Brasileira",
          recipeIngredient: recipe.ingredients,
          recipeInstructions: recipe.steps.map((step) => ({
            "@type": "HowToStep",
            text: step
          }))
        }
      ]
    },
    body: `
      <header class="hero hero--compact">
        ${topbar("receitas")}
      </header>
      <main class="recipe-page">
        <section class="recipe-hero recipe-hero--${recipe.theme}">
          <a class="recipe-back" href="/receitas">Voltar para receitas</a>
          <p class="section-tag">${recipe.age}</p>
          <h1>${recipe.title}</h1>
          <p class="recipe-page__intro">${recipe.intro}</p>
          <div class="recipe-meta">
            ${recipe.meta
              .map(
                ([label, value]) =>
                  `<article><strong>${label}</strong><span>${value}</span></article>`
              )
              .join("")}
          </div>
        </section>
        <section class="recipe-layout">
          <article class="recipe-panel">
            <h2>Ingredientes</h2>
            <ul class="recipe-list">
              ${recipe.ingredients.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </article>
          <article class="recipe-panel">
            <h2>Modo de preparo</h2>
            <ol class="recipe-list recipe-list--ordered">
              ${recipe.steps.map((item) => `<li>${item}</li>`).join("")}
            </ol>
          </article>
        </section>
        <section class="recipe-layout">
          <article class="recipe-panel">
            <h2>Dica carinhosa</h2>
            <p>${recipe.tip}</p>
          </article>
          <article class="recipe-panel">
            <h2>Como servir</h2>
            <p>${recipe.serving}</p>
          </article>
        </section>
      </main>
      ${footer()}
    `
  });
};

export const renderCategoryPage = (category, categoryRecipes, siteUrl = site.url) => {
  return documentTemplate({
    title: `${category.label} | ${site.name}`,
    siteUrl,
    seo: {
      pathname: `/categorias/${category.slug}`,
      description: category.description,
      ogTitle: `${category.label} | ${site.name}`,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${category.label} | ${site.name}`,
          url: absoluteUrl(siteUrl, `/categorias/${category.slug}`),
          description: category.description
        }
      ]
    },
    body: `
      <header class="hero hero--compact">
        ${topbar("idades")}
      </header>
      <main class="recipe-page">
        <section class="recipe-hero recipe-hero--${category.theme}">
          <a class="recipe-back" href="/#idades">Voltar para a home</a>
          <p class="section-tag">${category.label}</p>
          <h1>${category.title}</h1>
          <p class="recipe-page__intro">${category.description}</p>
        </section>
        <section class="recipe-grid recipe-grid--category">
          ${categoryRecipes.map((recipe) => recipeCard(recipe)).join("")}
        </section>
      </main>
      ${footer()}
    `
  });
};
