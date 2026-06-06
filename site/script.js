/* ==========================================================================
   Automation Portfolio — Site Script
   - Loads i18n strings and project data
   - Renders services and case study cards
   - Handles image lightbox
   ========================================================================== */

(() => {
  const DEFAULT_LANG = "en";

  async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    return res.json();
  }

  function applyI18n(strings) {
    // Replace elements with data-i18n="path.to.key"
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = key.split(".").reduce((obj, k) => (obj ? obj[k] : undefined), strings);
      if (typeof value === "string") {
        el.textContent = value;
      }
    });
  }

  function renderServices(items) {
    const host = document.getElementById("services");
    if (!host || !Array.isArray(items)) return;
    host.innerHTML = items
      .map(
        (s) => `
      <article class="service-card">
        <h3 class="service-card__name">${escape(s.name)}</h3>
        <p class="service-card__price">${escape(s.price)}</p>
        <p class="service-card__desc">${escape(s.description)}</p>
        <p class="service-card__examples">${escape(s.examples)}</p>
      </article>`
      )
      .join("");
  }

  function renderProjects(projects, labels) {
    const host = document.getElementById("projects");
    if (!host) return;

    host.innerHTML = projects
      .map((p, index) => {
        const thumb = p.images && p.images[0];
        const tags = (p.tags || []).map((t) => `<li class="project-card__tag">${escape(t)}</li>`).join("");
        const metrics = (p.metrics || [])
          .map(
            (m) => `
          <div class="metric">
            <div class="metric__label">${escape(m.label)}</div>
            <div class="metric__value">${escape(m.value)}</div>
          </div>`
          )
          .join("");

        return `
        <article class="project-card" data-project-index="${index}">
          ${
            thumb
              ? `<img class="project-card__thumb" src="${escape(thumb.src)}" alt="${escape(thumb.caption || p.title)}" loading="lazy" data-image-index="0" />`
              : ""
          }
          <div class="project-card__body">
            <span class="project-card__category">${escape(p.category)}</span>
            <h3 class="project-card__title">${escape(p.title)}</h3>
            <p class="project-card__tool">${escape(p.tool)}</p>
            <ul class="project-card__tags">${tags}</ul>

            <div class="project-card__section">
              <div class="project-card__label">${escape(labels.labelProblem)}</div>
              <p class="project-card__text">${escape(p.problem)}</p>
            </div>
            <div class="project-card__section">
              <div class="project-card__label">${escape(labels.labelSolution)}</div>
              <p class="project-card__text">${escape(p.solution)}</p>
            </div>
            <div class="project-card__section">
              <div class="project-card__label">${escape(labels.labelResult)}</div>
              <p class="project-card__text">${escape(p.result)}</p>
            </div>

            <div class="project-card__metrics">${metrics}</div>
          </div>
        </article>`;
      })
      .join("");
  }

  function escape(s) {
    if (s === undefined || s === null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ------------------------------------------------------------------------
     Lightbox
     ------------------------------------------------------------------------ */
  function initLightbox(projects) {
    const lightbox = document.getElementById("lightbox");
    const imgEl = lightbox.querySelector(".lightbox__img");
    const capEl = lightbox.querySelector(".lightbox__caption");
    const closeBtn = lightbox.querySelector(".lightbox__close");
    const prevBtn = lightbox.querySelector(".lightbox__nav--prev");
    const nextBtn = lightbox.querySelector(".lightbox__nav--next");

    let currentProject = null;
    let currentIndex = 0;

    function show(project, index) {
      currentProject = project;
      currentIndex = index;
      const img = project.images[index];
      imgEl.src = img.src;
      imgEl.alt = img.caption || project.title;
      capEl.textContent = img.caption || "";
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    }

    function close() {
      lightbox.hidden = true;
      imgEl.src = "";
      document.body.style.overflow = "";
    }

    function navigate(delta) {
      if (!currentProject) return;
      const count = currentProject.images.length;
      currentIndex = (currentIndex + delta + count) % count;
      show(currentProject, currentIndex);
    }

    // Event: card thumbnail click
    document.querySelectorAll(".project-card__thumb").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const card = thumb.closest(".project-card");
        const projectIndex = Number(card.getAttribute("data-project-index"));
        show(projects[projectIndex], 0);
      });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => navigate(-1));
    nextBtn.addEventListener("click", () => navigate(1));

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });

    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    });
  }

  /* ------------------------------------------------------------------------
     Init
     ------------------------------------------------------------------------ */
  async function init() {
    try {
      const lang = localStorage.getItem("portfolio:lang") || DEFAULT_LANG;
      const [strings, data] = await Promise.all([
        loadJSON(`i18n/${lang}.json`),
        loadJSON("data.json"),
      ]);

      applyI18n(strings);
      renderServices(strings.services && strings.services.items);
      renderProjects(data.projects || [], strings.cases || {});
      initLightbox(data.projects || []);
    } catch (err) {
      console.error("[init] failed:", err);
      const host = document.getElementById("projects");
      if (host) {
        host.innerHTML = `<p style="color:#c00;text-align:center;padding:40px;">Failed to load portfolio data. ${escape(err.message)}</p>`;
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
