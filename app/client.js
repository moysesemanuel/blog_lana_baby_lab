import { studioTemplate } from "./data.js";

let currentUser = null;

const searchInput = document.querySelector("#recipe-search");
const ageButtons = document.querySelectorAll("[data-age-filter]");
const recipeCards = document.querySelectorAll(".recipe-card");
const emptyState = document.querySelector("#recipes-empty");
const newsletterForm = document.querySelector("#newsletter-form");
const newsletterFeedback = document.querySelector("#newsletter-feedback");
const title = document.querySelector("#recipe-title");
const description = document.querySelector("#recipe-description");
const topbarProfile = document.querySelector("#topbar-profile");
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

if (searchInput && emptyState) {
  let activeAgeFilter = "all";

  const applyRecipeFilters = () => {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    recipeCards.forEach((card) => {
      const age = card.dataset.age;
      const keywords = card.dataset.keywords ?? "";
      const text = card.textContent.toLowerCase();
      const matchesAge = activeAgeFilter === "all" || age === activeAgeFilter;
      const matchesQuery = !query || `${text} ${keywords}`.includes(query);
      const isVisible = matchesAge && matchesQuery;

      card.classList.toggle("is-hidden", !isVisible);
      if (isVisible) {
        visibleCount += 1;
      }
    });

    emptyState.hidden = visibleCount > 0;
  };

  searchInput.addEventListener("input", applyRecipeFilters);

  ageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeAgeFilter = button.dataset.ageFilter;
      ageButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");

      const firstVisibleRecipe = Array.from(recipeCards).find((card) => {
        const age = card.dataset.age;
        const keywords = card.dataset.keywords ?? "";
        const text = card.textContent.toLowerCase();
        const query = searchInput.value.trim().toLowerCase();

        return (
          (activeAgeFilter === "all" || age === activeAgeFilter) &&
          (!query || `${text} ${keywords}`.includes(query))
        );
      });

      if (firstVisibleRecipe && title && description) {
        title.textContent = firstVisibleRecipe.dataset.previewTitle || "";
        description.textContent = firstVisibleRecipe.dataset.previewDescription || "";
      }

      applyRecipeFilters();
    });
  });

  applyRecipeFilters();
}

if (newsletterForm && newsletterFeedback) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = new FormData(newsletterForm).get("name");
    newsletterFeedback.textContent = `Tudo certo, ${name}. Seu cantinho de inspirações já está reservado.`;
    newsletterForm.reset();
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.2 }
);

document
  .querySelectorAll(
    ".highlight-card, .recipe-card, .tips__list article, .tips__panel, .newsletter__content, .about-card, .recipe-panel, .site-footer"
  )
  .forEach((element) => {
    element.classList.add("reveal");
    observer.observe(element);
  });

let topbarProfileOutsideClickHandler = null;

const updateTopbarProfile = () => {
  if (!topbarProfile) {
    return;
  }

  if (currentUser) {
    const roleLabel = currentUser.role === "admin" ? "Administrador(a)" : "Colaborador(a)";

    topbarProfile.innerHTML = `
      <div class="profile-menu">
        <button
          class="profile-chip profile-chip--active profile-chip--profile"
          type="button"
          id="topbar-profile-toggle"
          aria-haspopup="menu"
          aria-expanded="false"
        >
        <span class="profile-chip__name">${currentUser.name}</span>
        <span class="profile-chip__role">${roleLabel}</span>
        </button>
        <div class="profile-dropdown" id="topbar-profile-menu" hidden>
          <a class="profile-dropdown__item profile-dropdown__item--link" href="/studio">
            Studio
          </a>
          <button class="profile-dropdown__item" type="button" id="topbar-logout">
            Sair
          </button>
        </div>
      </div>
    `;

    const profileToggle = topbarProfile.querySelector("#topbar-profile-toggle");
    const profileMenu = topbarProfile.querySelector("#topbar-profile-menu");
    const logoutButton = topbarProfile.querySelector("#topbar-logout");

    profileToggle?.addEventListener("click", () => {
      const isExpanded = profileToggle.getAttribute("aria-expanded") === "true";
      profileToggle.setAttribute("aria-expanded", String(!isExpanded));
      if (profileMenu) {
        profileMenu.hidden = isExpanded;
      }
    });

    logoutButton?.addEventListener("click", async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      currentUser = null;
      updateTopbarProfile();

      if (window.location.pathname === "/studio" || window.location.pathname === "/perfil") {
        window.location.assign("/perfil");
      }
    });

    if (topbarProfileOutsideClickHandler) {
      document.removeEventListener("click", topbarProfileOutsideClickHandler);
    }

    topbarProfileOutsideClickHandler = (event) => {
      if (!(event.target instanceof Node) || !topbarProfile.contains(event.target)) {
        profileToggle?.setAttribute("aria-expanded", "false");
        if (profileMenu) {
          profileMenu.hidden = true;
        }
      }
    };

    document.addEventListener("click", topbarProfileOutsideClickHandler);

    return;
  }

  if (topbarProfileOutsideClickHandler) {
    document.removeEventListener("click", topbarProfileOutsideClickHandler);
    topbarProfileOutsideClickHandler = null;
  }

  topbarProfile.innerHTML = "";
};

const loadSession = async () => {
  try {
    const response = await fetch("/api/auth/session");
    const data = await response.json();
    currentUser = data.user;
  } catch {
    currentUser = null;
  }

  updateTopbarProfile();
};

const studioForm = document.querySelector("#studio-form");
const studioPreviewRoot = document.querySelector("#studio-preview-root");
const studioSaveButton = document.querySelector("#studio-save");
const studioPublishButton = document.querySelector("#studio-publish");
const studioResetButton = document.querySelector("#studio-reset");
const studioFeedback = document.querySelector("#studio-feedback");
const studioDraftsList = document.querySelector("#studio-drafts-list");
const studioPublishedList = document.querySelector("#studio-published-list");
const studioLocked = document.querySelector("#studio-locked");
const profileAuthForm = document.querySelector("#profile-auth-form");
const profileSubmit = document.querySelector("#profile-submit");
const studioLogoutButton = document.querySelector("#studio-logout");
const studioAuthStatus = document.querySelector("#studio-auth-status");
const studioAuthFeedback = document.querySelector("#studio-auth-feedback");
const profilePasswordPanel = document.querySelector("#profile-password-panel");
const profilePasswordForm = document.querySelector("#profile-password-form");
const profilePasswordFeedback = document.querySelector("#profile-password-feedback");

if (
  studioForm &&
  studioPreviewRoot &&
  studioSaveButton &&
  studioPublishButton &&
  studioResetButton &&
  studioDraftsList &&
  studioPublishedList &&
  studioLocked
) {
  const storageKey = "lana-baby-lab-studio-drafts";

  const normalizeLines = (value) =>
    value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  const isRecipeEmpty = (recipe) =>
    !recipe.title &&
    !recipe.age &&
    !recipe.excerpt &&
    !recipe.intro &&
    recipe.ingredients.length === 0 &&
    recipe.steps.length === 0;

  const getFormRecipe = () => {
    const formData = new FormData(studioForm);
    return {
      title: formData.get("title")?.toString().trim() || studioTemplate.title,
      age: formData.get("age")?.toString().trim() || studioTemplate.age,
      excerpt: formData.get("excerpt")?.toString().trim() || studioTemplate.excerpt,
      intro: formData.get("intro")?.toString().trim() || studioTemplate.intro,
      theme: formData.get("theme")?.toString().trim() || studioTemplate.theme,
      emoji: formData.get("emoji")?.toString().trim() || studioTemplate.emoji,
      prepTime: formData.get("prepTime")?.toString().trim() || studioTemplate.prepTime,
      yield: formData.get("yield")?.toString().trim() || studioTemplate.yield,
      texture: formData.get("texture")?.toString().trim() || studioTemplate.texture,
      youtubeUrl: formData.get("youtubeUrl")?.toString().trim() || studioTemplate.youtubeUrl,
      youtubeThumbnail: resolveYoutubeThumbnail(
        formData.get("youtubeUrl")?.toString().trim() || ""
      ),
      ingredients: normalizeLines(formData.get("ingredients")?.toString() || ""),
      steps: normalizeLines(formData.get("steps")?.toString() || ""),
      tip: formData.get("tip")?.toString().trim() || studioTemplate.tip,
      serving: formData.get("serving")?.toString().trim() || studioTemplate.serving
    };
  };

  const previewMarkup = (recipe) => `
    <section class="recipe-hero recipe-hero--${recipe.theme}">
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
    <section class="recipe-layout recipe-layout--single">
      <article class="recipe-panel">
        <h2>Ingredientes</h2>
        <ul class="recipe-list">
          ${recipe.ingredients.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </article>
    </section>
    ${
      recipe.youtubeThumbnail
        ? `
          <section class="recipe-layout recipe-layout--single">
            <article class="recipe-panel recipe-panel--video">
              <h2>Vídeo da receita</h2>
              ${
                recipe.youtubeUrl
                  ? `
                    <a href="${recipe.youtubeUrl}" target="_blank" rel="noreferrer">
                      <img
                        class="recipe-video-thumb"
                        src="${recipe.youtubeThumbnail}"
                        alt="Thumbnail do vídeo da receita ${recipe.title}"
                      />
                    </a>
                  `
                  : `
                    <img
                      class="recipe-video-thumb"
                      src="${recipe.youtubeThumbnail}"
                      alt="Thumbnail do vídeo da receita ${recipe.title}"
                    />
                  `
              }
            </article>
          </section>
        `
        : ""
    }
    <section class="recipe-layout recipe-layout--single">
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

  const renderPreview = () => {
    const recipe = getFormRecipe();

    if (isRecipeEmpty(recipe)) {
      studioPreviewRoot.innerHTML = `
        <div class="studio-preview-empty">
          <p>Preencha os campos da receita para ver a prévia aparecer aqui.</p>
        </div>
      `;
      return;
    }

    studioPreviewRoot.innerHTML = previewMarkup(recipe);
  };

  const getDrafts = () => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  };

  const setDrafts = (drafts) => {
    localStorage.setItem(storageKey, JSON.stringify(drafts));
  };

  const fillForm = (draft) => {
    const values = {
      ...studioTemplate,
      ...draft,
      publishedSlug: draft.publishedSlug || draft.slug || "",
      ingredients: (draft.ingredients || studioTemplate.ingredients).join("\n"),
      steps: (draft.steps || studioTemplate.steps).join("\n")
    };

    Object.entries(values).forEach(([key, value]) => {
      const field = studioForm.elements.namedItem(key);
      if (field) {
        field.value = value;
      }
    });

    renderPreview();
    updatePublishState(values.publishedSlug);
  };

  const resetFormToTemplate = () => {
    fillForm({ ...studioTemplate, publishedSlug: "" });
  };

  const clearForm = () => {
    const emptyValues = {
      title: "",
      age: "",
      excerpt: "",
      intro: "",
      theme: studioTemplate.theme,
      emoji: "",
      prepTime: "",
      yield: "",
      texture: "",
      youtubeUrl: "",
      ingredients: "",
      steps: "",
      tip: "",
      serving: "",
      publishedSlug: ""
    };

    Object.entries(emptyValues).forEach(([key, value]) => {
      const field = studioForm.elements.namedItem(key);
      if (field) {
        field.value = value;
      }
    });

    updatePublishState("");
    renderPreview();
  };

  const updatePublishState = (publishedSlug = "") => {
    const slugField = studioForm.elements.namedItem("publishedSlug");

    if (slugField) {
      slugField.value = publishedSlug;
    }

    studioPublishButton.textContent = publishedSlug ? "Salvar alterações" : "Publicar no blog";
  };

  const updateAuthUi = () => {
    if (currentUser) {
      studioLocked.hidden = true;
    } else {
      studioLocked.hidden = false;
    }
  };

  const renderDrafts = () => {
    const drafts = getDrafts();

    if (!drafts.length) {
      studioDraftsList.innerHTML =
        '<p class="studio-drafts__empty">Nenhum rascunho salvo ainda.</p>';
      return;
    }

    studioDraftsList.innerHTML = drafts
      .map(
        (draft, index) => `
          <article class="studio-draft-card">
            <div>
              <strong>${draft.title}</strong>
              <p>${draft.age} • ${draft.updatedAt}</p>
            </div>
            <div class="studio-draft-card__actions">
              <button type="button" data-draft-load="${index}">Abrir</button>
              <button type="button" data-draft-delete="${index}">Excluir</button>
            </div>
          </article>
        `
      )
      .join("");
  };

  const loadPublishedRecipes = async () => {
    try {
      const response = await fetch("/api/recipes?scope=published");
      const data = await response.json();

      if (!response.ok) {
        studioPublishedList.innerHTML =
          '<p class="studio-drafts__empty">Não foi possível carregar as receitas publicadas.</p>';
        return;
      }

      const publishedRecipes = data.recipes || [];
      updateAuthUi();

      if (!publishedRecipes.length) {
        studioPublishedList.innerHTML =
          '<p class="studio-drafts__empty">Nenhuma receita publicada ainda.</p>';
        return;
      }

      studioPublishedList.innerHTML = publishedRecipes
        .map(
          (recipe) => `
            <article class="studio-draft-card">
              <div>
                <strong>${recipe.title}</strong>
                <p>${recipe.age} • ${recipe.authorName || "Sem autor"} • /receitas/${recipe.slug}</p>
              </div>
              <div class="studio-draft-card__actions">
                ${
                  recipe.permissions?.canEdit
                    ? `<button type="button" data-published-edit="${recipe.slug}">Editar</button>`
                    : ""
                }
                ${
                  recipe.permissions?.canDelete
                    ? `<button type="button" data-published-delete="${recipe.slug}">Remover</button>`
                    : ""
                }
                <a href="/receitas/${recipe.slug}" target="_blank" rel="noreferrer">Abrir</a>
              </div>
            </article>
          `
        )
        .join("");
    } catch {
      studioPublishedList.innerHTML =
        '<p class="studio-drafts__empty">Não foi possível carregar as receitas publicadas.</p>';
    }
  };

  studioForm.addEventListener("input", renderPreview);

  studioSaveButton.addEventListener("click", () => {
    const recipe = getFormRecipe();
    const publishedSlug =
      studioForm.elements.namedItem("publishedSlug")?.value?.toString().trim() || "";
    const drafts = getDrafts();
    const updatedDrafts = [
      {
        ...recipe,
        publishedSlug,
        updatedAt: new Date().toLocaleString("pt-BR")
      },
      ...drafts
    ].slice(0, 12);

    setDrafts(updatedDrafts);
    renderDrafts();
    studioFeedback.textContent = "Rascunho salvo neste navegador.";
  });

  studioPublishButton.addEventListener("click", async () => {
    if (!currentUser) {
      studioFeedback.innerHTML =
        'Faça login em <a href="/perfil">Perfil</a> para publicar receitas.';
      updateAuthUi();
      return;
    }

    const recipe = getFormRecipe();
    const publishedSlug = new FormData(studioForm).get("publishedSlug")?.toString().trim();
    studioFeedback.textContent = "Publicando receita...";

    try {
      const response = await fetch(publishedSlug ? `/api/recipes/${publishedSlug}` : "/api/recipes", {
        method: publishedSlug ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(recipe)
      });

      const data = await response.json();

      if (!response.ok) {
        studioFeedback.textContent = data.error || "Não foi possível publicar a receita.";
        return;
      }

      const slugField = studioForm.elements.namedItem("publishedSlug");
      if (slugField) {
        slugField.value = data.recipe.slug;
      }

      updatePublishState(data.recipe.slug);

      studioFeedback.innerHTML = `${
        publishedSlug ? "Receita atualizada com sucesso." : "Receita publicada com sucesso."
      } <a href="${data.url}">Abrir página publicada</a>`;
      await loadPublishedRecipes();
    } catch {
      studioFeedback.textContent = "Erro ao publicar a receita.";
    }
  });

  studioResetButton.addEventListener("click", () => {
    clearForm();
    studioFeedback.textContent = "Formulário limpo.";
  });

  studioDraftsList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const loadIndex = target.dataset.draftLoad;
    const deleteIndex = target.dataset.draftDelete;
    const drafts = getDrafts();

    if (loadIndex) {
      fillForm(drafts[Number(loadIndex)]);
      studioFeedback.textContent = "Rascunho carregado na edição.";
      return;
    }

    if (deleteIndex) {
      drafts.splice(Number(deleteIndex), 1);
      setDrafts(drafts);
      renderDrafts();
      studioFeedback.textContent = "Rascunho removido.";
    }
  });

  studioPublishedList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const editSlug = target.getAttribute("data-published-edit");
    const deleteSlug = target.getAttribute("data-published-delete");

    if (editSlug) {
      try {
        const response = await fetch("/api/recipes?scope=published");
        const data = await response.json();
        const recipe = (data.recipes || []).find((item) => item.slug === editSlug);

        if (!recipe) {
          studioFeedback.textContent = "Receita publicada não encontrada.";
          return;
        }

        fillForm({
          ...recipe,
          prepTime: recipe.meta?.find((item) => item[0] === "Tempo")?.[1] || "",
          yield: recipe.meta?.find((item) => item[0] === "Rendimento")?.[1] || "",
          texture: recipe.meta?.find((item) => item[0] === "Textura")?.[1] || "",
          publishedSlug: recipe.slug
        });
        studioFeedback.textContent = "Receita publicada carregada para edição.";
        studioForm.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        studioFeedback.textContent = "Não foi possível carregar a receita publicada.";
      }
      return;
    }

    if (deleteSlug) {
      try {
        const response = await fetch(`/api/recipes/${deleteSlug}`, {
          method: "DELETE"
        });
        const data = await response.json();

        if (!response.ok) {
          studioFeedback.textContent = data.error || "Não foi possível remover a receita.";
          return;
        }

        if (studioForm.elements.namedItem("publishedSlug")?.value === deleteSlug) {
          resetFormToTemplate();
        }

        studioFeedback.textContent = "Receita removida do blog.";
        await loadPublishedRecipes();
      } catch {
        studioFeedback.textContent = "Não foi possível remover a receita.";
      }
    }
  });

  clearForm();
  renderDrafts();
  await loadSession();
  updateAuthUi();
  loadPublishedRecipes();
}

if (
  profileAuthForm &&
  profileSubmit &&
  studioLogoutButton &&
  studioAuthStatus &&
  studioAuthFeedback &&
  !studioForm
) {
  const updateProfileAuthUi = () => {
    if (currentUser) {
      studioAuthStatus.textContent = `${currentUser.name} • ${
        currentUser.role === "admin" ? "Administrador(a)" : "Colaborador(a)"
      }`;
      studioLogoutButton.hidden = false;
      profileAuthForm.hidden = true;
      if (profilePasswordPanel) {
        profilePasswordPanel.hidden = true;
      }
    } else {
      studioAuthStatus.textContent =
        "Entre com e-mail e senha para acessar o Studio e publicar receitas.";
      studioLogoutButton.hidden = true;
      profileAuthForm.hidden = false;
      if (profilePasswordPanel) {
        profilePasswordPanel.hidden = true;
      }
    }
  };

  profileAuthForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(profileAuthForm).entries());
    studioAuthFeedback.textContent = "Entrando...";

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        studioAuthFeedback.textContent = data.error || "Não foi possível entrar.";
        return;
      }

      currentUser = data.user;
      profileAuthForm.reset();
      studioAuthFeedback.textContent = "Sessão iniciada.";
      updateProfileAuthUi();
      updateTopbarProfile();
      window.location.assign("/studio");
    } catch {
      studioAuthFeedback.textContent = "Não foi possível entrar.";
    }
  });

  studioLogoutButton.addEventListener("click", async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    currentUser = null;
    studioAuthFeedback.textContent = "Sessão encerrada.";
    if (profilePasswordFeedback) {
      profilePasswordFeedback.textContent = "";
    }
    updateProfileAuthUi();
    updateTopbarProfile();
  });

  profilePasswordForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(profilePasswordForm).entries());
    profilePasswordFeedback.textContent = "Atualizando senha...";

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        profilePasswordFeedback.textContent =
          data.error || "Não foi possível atualizar a senha.";
        return;
      }

      profilePasswordForm.reset();
      profilePasswordFeedback.textContent = "Senha atualizada com sucesso.";
    } catch {
      profilePasswordFeedback.textContent = "Não foi possível atualizar a senha.";
    }
  });

  await loadSession();
  updateProfileAuthUi();
}

if (!studioForm && !profileAuthForm) {
  await loadSession();
}
