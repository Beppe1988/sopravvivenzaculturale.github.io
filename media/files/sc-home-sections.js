(function () {
  "use strict";

  const FEED_URL = "./feed.json";

  document.addEventListener("DOMContentLoaded", function () {
    const isHomepage = document.body.classList.contains("home-template");

    if (!isHomepage) {
      return;
    }

    const mainColumn = document.querySelector("main.main");

    if (!mainColumn) {
      return;
    }

    if (document.querySelector(".sc-home-insert")) {
      return;
    }

    insertHomeBlocks(mainColumn);
    loadLatestPosts();
    insertSidebarBlocks();
    loadRubricPostsFromFeed();
  });

  function insertHomeBlocks(mainColumn) {
    const firstCard = mainColumn.querySelector(".c-card");

    const wrapper = document.createElement("div");
    wrapper.className = "sc-home-insert";

    wrapper.innerHTML = `
      <section class="sc-sections" aria-label="Sezioni principali">
        <a class="sc-section sc-section--geo" href="/tags/geopolitica/">
          <div class="sc-section__icon">◉</div>
          <h2>Geopolitica</h2>
          <p>Scenari globali, strategie e conflitti del nuovo ordine mondiale.</p>
          <span>Scopri di più →</span>
        </a>

        <a class="sc-section sc-section--socio" href="/tags/sociologia/">
          <div class="sc-section__icon">●</div>
          <h2>Sociologia</h2>
          <p>Dinamiche sociali, identità, masse e mutamenti contemporanei.</p>
          <span>Scopri di più →</span>
        </a>

        <a class="sc-section sc-section--culture" href="/tags/cultura/">
          <div class="sc-section__icon">Ⅲ</div>
          <h2>Cultura</h2>
          <p>Storia, arte, simboli e pensiero per comprendere il presente.</p>
          <span>Scopri di più →</span>
        </a>

        <a class="sc-section sc-section--tech" href="/tags/tecnologia-e-societa/">
          <div class="sc-section__icon">▣</div>
          <h2>Tecnologia e società</h2>
          <p>Innovazione, sorveglianza e impatto della tecnica sul potere.</p>
          <span>Scopri di più →</span>
        </a>
      </section>

      <section class="sc-latest" aria-label="Ultimi articoli">
        <div class="sc-heading">
          <h2>Ultimi articoli</h2>
        </div>

        <div class="sc-latest__grid" id="sc-latest-grid">
          <p class="sc-latest__loading">Caricamento ultimi articoli...</p>
        </div>
      </section>
    `;

    if (firstCard) {
      firstCard.insertAdjacentElement("afterend", wrapper);
    } else {
      mainColumn.appendChild(wrapper);
    }
  }

  async function loadLatestPosts() {
    const grid = document.querySelector("#sc-latest-grid");

    if (!grid) {
      return;
    }

    try {
      const items = await fetchFeedItems();

      const posts = items
        .map(normalizeFeedItem)
        .filter(Boolean)
        .slice(1, 4); // salta il primo articolo, perché è già quello in evidenza

      renderLatestPosts(posts);
    } catch (error) {
      console.warn("[Sopravvivenza Culturale] Errore ultimi articoli:", error);

      grid.innerHTML = `
        <p class="sc-latest__empty">
          Non è stato possibile caricare gli ultimi articoli.
        </p>
      `;
    }
  }

  function renderLatestPosts(posts) {
    const grid = document.querySelector("#sc-latest-grid");

    if (!grid) {
      return;
    }

    if (!posts.length) {
      grid.innerHTML = `
        <p class="sc-latest__empty">
          Nessun articolo trovato.
        </p>
      `;
      return;
    }

    grid.innerHTML = posts
      .map(function (post) {
        return `
          <article class="sc-post">
            <a href="${escapeAttr(post.url)}">
              <div class="sc-post__image">
                <img src="${escapeAttr(post.image)}" alt="${escapeAttr(post.title)}" loading="lazy">
              </div>

              <div class="sc-post__content">
                <span class="sc-post__tag">${escapeHtml(post.tag)}</span>
                <h3>${escapeHtml(post.title)}</h3>
                <p>${escapeHtml(post.summary)}</p>
                <small>${escapeHtml(post.date)} · ${post.readingTime} min</small>
              </div>
            </a>
          </article>
        `;
      })
      .join("");
  }

  function insertSidebarBlocks() {
    const sidebar = document.querySelector(".sidebar");

    if (!sidebar) {
      return;
    }

    if (document.querySelector(".sc-sidebar-insert")) {
      return;
    }

    const sidebarInsert = document.createElement("div");
    sidebarInsert.className = "sc-sidebar-insert";

    sidebarInsert.innerHTML = `
      ${renderSidebarManifesto()}
      ${renderSidebarRubrics()}
    `;

    sidebar.prepend(sidebarInsert);
  }

  function renderSidebarManifesto() {
    return `
      <section class="sc-sidebox sc-side-manifesto" aria-label="Manifesto">
        <h3 class="sc-sidebox__title">Manifesto</h3>

        <div class="sc-side-manifesto__card">
          <div class="sc-side-manifesto__content">
            <p>
              Per una rinascita culturale
              nell'età della tecnica.
            </p>

            <a class="sc-side-manifesto__button" href="/manifesto/">
              Leggi il manifesto
            </a>
          </div>

          <div class="sc-side-manifesto__visual" aria-hidden="true"></div>
        </div>
      </section>
    `;
  }

  function renderSidebarRubrics() {
    return `
      <section class="sc-sidebox sc-side-rubrics" aria-label="Rubriche">
        <div class="sc-sidebox__header">
          <h3 class="sc-sidebox__title">Rubriche</h3>
          <a class="sc-sidebox__all" href="/tags/rubrica/">Tutte →</a>
        </div>

        <div class="sc-side-rubric__list" id="sc-side-rubric-list">
          <p class="sc-side-rubric__loading">Caricamento rubriche...</p>
        </div>
      </section>
    `;
  }

  async function loadRubricPostsFromFeed() {
    const container = document.querySelector("#sc-side-rubric-list");

    if (!container) {
      return;
    }

    try {
      const items = await fetchFeedItems();

      const rubricPosts = items
        .map(normalizeFeedItem)
        .filter(Boolean)
        .filter(function (post) {
          return post.tags.some(function (tag) {
            return normalizeText(tag) === "rubrica";
          });
        })
        .slice(0, 5);

      renderRubricPosts(rubricPosts);
    } catch (error) {
      console.warn("[Sopravvivenza Culturale] Errore rubriche:", error);

      container.innerHTML = `
        <p class="sc-side-rubric__empty">
          Nessuna rubrica disponibile.
        </p>
      `;
    }
  }

  function renderRubricPosts(posts) {
    const container = document.querySelector("#sc-side-rubric-list");

    if (!container) {
      return;
    }

    if (!posts.length) {
      container.innerHTML = `
        <p class="sc-side-rubric__empty">
          Nessun post con tag Rubrica trovato.
        </p>
      `;
      return;
    }

    container.innerHTML = posts
      .map(function (post) {
        return `
          <article class="sc-side-rubric__item">
            <a href="${escapeAttr(post.url)}">
              <div class="sc-side-rubric__body">
                <h4>${escapeHtml(post.title)}</h4>
                <p>${escapeHtml(post.summary)}</p>
                <small>${escapeHtml(post.date)} · ${post.readingTime} min</small>
              </div>
            </a>
          </article>
        `;
      })
      .join("");
  }

  async function fetchFeedItems() {
    const response = await fetch(FEED_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Impossibile leggere feed.json");
    }

    const feed = await response.json();

    return Array.isArray(feed.items) ? feed.items : [];
  }

  function normalizeFeedItem(item) {
    if (!item || !item.title || !item.url) {
      return null;
    }

    const title = stripHtml(item.title);
    const url = item.url;
    const summary = stripHtml(item.summary || item.content_text || item.content_html || "");
    const date = formatDate(item.date_published || item.date_modified);
    const image = getPostImage(item);
    const tag = getPostTag(item);
    const tags = getFeedItemTags(item);
    const readingTime = estimateReadingTime(summary);

    return {
      title,
      url,
      summary: truncate(summary, 115),
      date,
      image,
      tag,
      tags,
      readingTime
    };
  }

  function getPostImage(item) {
    if (item.image) {
      return item.image;
    }

    if (item.banner_image) {
      return item.banner_image;
    }

    if (item.content_html) {
      const match = item.content_html.match(/<img[^>]+src=["']([^"']+)["']/i);

      if (match && match[1]) {
        return match[1];
      }
    }

    return "./media/website/logo.png";
  }

  function getPostTag(item) {
    const tags = getFeedItemTags(item);

    if (tags.length > 0) {
      return tags[0];
    }

    return "Analisi";
  }

  function getFeedItemTags(item) {
    const tags = [];

    if (Array.isArray(item.tags)) {
      tags.push(...item.tags);
    }

    if (Array.isArray(item.categories)) {
      tags.push(...item.categories);
    }

    return tags.map(String);
  }

  function stripHtml(value) {
    const div = document.createElement("div");
    div.innerHTML = String(value || "");
    return div.textContent || div.innerText || "";
  }

  function truncate(value, maxLength) {
    const text = String(value || "").trim();

    if (text.length <= maxLength) {
      return text;
    }

    return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
  }

  function formatDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function estimateReadingTime(text) {
    const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 220));
  }

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();