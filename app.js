(function () {
  var DATA_URL = "data/sources.json";
  var state = {
    categories: [],
    sources: [],
    active: "all"
  };

  var board = document.getElementById("board");
  var filters = document.getElementById("filters");
  var countEl = document.getElementById("count");
  var themeBtn = document.getElementById("theme-toggle");

  var ARROW =
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5 11.5 4.5M6.5 4.5h5v5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function isHttp(url) {
    return typeof url === "string" && /^https?:\/\//i.test(url);
  }

  function hostname(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch (e) {
      return "";
    }
  }

  function categoryTitle(category) {
    return category.title || category.id;
  }

  function sourceCategory(source) {
    var value = source.category;
    for (var i = 0; i < state.categories.length; i++) {
      var category = state.categories[i];
      if (value === category.id || value === category.title) return category;
    }
    var created = { id: "extra-" + state.categories.length, title: String(value || "未分类") };
    state.categories.push(created);
    return created;
  }

  function readHash() {
    var hash = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!hash || hash === "all") return "all";
    for (var i = 0; i < state.categories.length; i++) {
      var category = state.categories[i];
      if (hash === category.id || hash === category.title) return category.id;
    }
    return "all";
  }

  function sourcesIn(categoryId) {
    return state.sources.filter(function (source) {
      var category = sourceCategory(source);
      return category.id === categoryId;
    });
  }

  function setTheme(theme) {
    var dark = theme === "dark";
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem("im-theme", dark ? "dark" : "light");
    } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#000000" : "#f5f5f7");
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeBtn.setAttribute("aria-label", dark ? "切换到浅色" : "切换到深色");
  }

  themeBtn.addEventListener("click", function () {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    setTheme(dark ? "light" : "dark");
  });

  if (document.documentElement.getAttribute("data-theme") === "dark") {
    setTheme("dark");
  }

  function renderFilters() {
    filters.replaceChildren();
    var all = document.createElement("button");
    all.type = "button";
    all.className = "chip";
    all.dataset.filter = "all";
    all.textContent = "全部";
    filters.appendChild(all);

    state.categories.forEach(function (category) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "chip";
      button.dataset.filter = category.id;
      button.textContent = categoryTitle(category);
      filters.appendChild(button);
    });

    filters.onclick = function (event) {
      var button = event.target.closest("button[data-filter]");
      if (!button) return;
      setActive(button.dataset.filter, true);
    };

    updateChips();
  }

  function updateChips() {
    filters.querySelectorAll("[data-filter]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.filter === state.active));
    });
  }

  function createCard(source) {
    var external = isHttp(source.url);
    var card = document.createElement(external ? "a" : "article");
    card.className = "card";
    if (external) {
      card.href = source.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
    }

    var top = document.createElement("div");
    top.className = "card-top";

    var text = document.createElement("div");
    var host = document.createElement("p");
    host.className = "host";
    host.textContent = hostname(source.url);
    var title = document.createElement("h3");
    title.textContent = source.title || "未命名";
    text.appendChild(host);
    text.appendChild(title);

    var arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.innerHTML = ARROW;

    top.appendChild(text);
    if (external) top.appendChild(arrow);

    var note = document.createElement("p");
    note.className = "note";
    note.textContent = source.note || "";

    card.appendChild(top);
    card.appendChild(note);

    if (Array.isArray(source.tags) && source.tags.length) {
      var tags = document.createElement("ul");
      tags.className = "tags";
      source.tags.forEach(function (tag) {
        var item = document.createElement("li");
        item.textContent = String(tag);
        tags.appendChild(item);
      });
      card.appendChild(tags);
    }

    if (external) {
      var hidden = document.createElement("span");
      hidden.className = "sr-only";
      hidden.textContent = "（新窗口打开）";
      card.appendChild(hidden);
    }

    return card;
  }

  function renderBoard() {
    board.replaceChildren();
    var visible = state.categories.filter(function (category) {
      if (state.active !== "all" && category.id !== state.active) return false;
      return sourcesIn(category.id).length > 0;
    });

    if (!visible.length) {
      var empty = document.createElement("p");
      empty.className = "status";
      empty.textContent = "这个分类还没有条目。";
      board.appendChild(empty);
      return;
    }

    visible.forEach(function (category) {
      var items = sourcesIn(category.id);
      var section = document.createElement("section");
      section.className = "section";
      section.id = "cat-" + category.id;

      var head = document.createElement("div");
      head.className = "section-head";
      var heading = document.createElement("h2");
      heading.textContent = categoryTitle(category);
      var tally = document.createElement("span");
      tally.className = "section-count";
      tally.textContent = items.length + " 条";
      head.appendChild(heading);
      head.appendChild(tally);

      var grid = document.createElement("div");
      grid.className = "grid";
      items.forEach(function (source) {
        grid.appendChild(createCard(source));
      });

      section.appendChild(head);
      section.appendChild(grid);
      board.appendChild(section);
    });
  }

  function setActive(id, push) {
    state.active = id;
    var hash = id === "all" ? "" : "#" + encodeURIComponent(id);
    var next = location.pathname + location.search + hash;
    if (push) history.pushState(null, "", next);
    updateChips();
    renderBoard();
  }

  window.addEventListener("popstate", function () {
    state.active = readHash();
    updateChips();
    renderBoard();
  });

  fetch(DATA_URL)
    .then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(function (data) {
      state.categories = Array.isArray(data.categories) ? data.categories.slice() : [];
      state.sources = Array.isArray(data.sources) ? data.sources : [];
      state.sources.forEach(sourceCategory);
      countEl.textContent = state.sources.length ? "共 " + state.sources.length + " 条" : "";
      state.active = readHash();
      renderFilters();
      renderBoard();
    })
    .catch(function () {
      var status = document.getElementById("status");
      if (status) {
        status.textContent = "读不到 data/sources.json。请用本地服务器或 GitHub Pages 打开，不要直接双击 HTML。";
      }
    });
})();
