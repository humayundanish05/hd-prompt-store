// =========================================================
// GET QUERY PARAMETER
// =========================================================
function getQueryParam(name) {
  return new URL(window.location.href).searchParams.get(name);
}

// =========================================================
// LOAD JSON (GitHub Pages Safe)
// =========================================================
async function loadPrompts() {
  const response = await fetch("data/prompts.json");
  return await response.json();
}

// =========================================================
// Escape HTML for prompt display
// =========================================================
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[m]);
}

// =========================================================
// GLOBAL PROMPT ARRAY
// =========================================================
let allPrompts = [];

// =========================================================
// SHOW PROMPTS LIST (prompts.html)
// =========================================================
async function showPrompts(prompts) {
  const container = document.getElementById("prompt-list");
  if (!container) return;

  container.innerHTML = prompts
    .map(
      (p) => `
      <div class="card">
        <img src="${p.image}" alt="${p.title}">
        <h3>${p.title}</h3>
        <div class="meta">Category: ${p.category}</div>

        <div class="actions">
          <a class="btn small" href="prompt-details.html?id=${p.id}">View</a>
          <button class="btn small" onclick="quickCopy(${p.id})">Copy</button>
        </div>
      </div>
    `
    )
    .join("");
}

// =========================================================
// COPY PROMPT QUICK (LIST PAGE)
// =========================================================
async function quickCopy(id) {
  const p = allPrompts.find((x) => x.id == id);
  if (!p) return alert("Prompt not found.");

  navigator.clipboard.writeText(p.prompt);
  alert("Prompt Copied!");
}

// =========================================================
// CATEGORY FILTER
// =========================================================
function filterByCategory(category) {
  if (!allPrompts.length) return;

  if (category === "All") {
    showPrompts(allPrompts);
  } else {
    const filtered = allPrompts.filter((p) => p.category === category);
    showPrompts(filtered);
  }
}

// =========================================================
// RENDER DETAILS PAGE (prompt-details.html)
// =========================================================
async function renderDetails() {
  const id = getQueryParam("id");
  const box = document.getElementById("details");

  if (!id || !box) return;

  const p = allPrompts.find((x) => x.id == id);
  if (!p) {
    box.innerHTML = "<p>Prompt not found.</p>";
    return;
  }

  box.innerHTML = `
    <div class="details-grid">

      <!-- IMAGE -->
      <div class="image-box">
        <img src="${p.image}" alt="${p.title}">
      </div>

      <!-- TEXT -->
      <div>
        <h2 class="title">${p.title}</h2>
        <div class="meta-line">Category: ${p.category}</div>

        <h3 class="section-title">Prompt</h3>
        <div class="prompt-box">${escapeHtml(p.prompt)}</div>

        <div class="btn-row">
          <button class="btn" onclick="copyText('${encodeURIComponent(p.prompt)}')">Copy Prompt</button>
          <button class="btn secondary" onclick="saveToCollection(${p.id})">Save to Collection</button>
        </div>
      </div>

    </div>
  `;
}

// Copy for details page
function copyText(text) {
  navigator.clipboard.writeText(decodeURIComponent(text));
  alert("Prompt Copied!");
}

// =========================================================
// SAVE TO COLLECTION (LOCAL STORAGE)
// =========================================================
function saveToCollection(id) {
  const key = "hd_prompts_collection";
  const p = allPrompts.find((x) => x.id == id);
  if (!p) return;

  let current = JSON.parse(localStorage.getItem(key) || "[]");

  if (current.some((x) => x.id == id))
    return alert("Already saved!");

  current.push(p);
  localStorage.setItem(key, JSON.stringify(current));

  alert("Saved to My Collection!");
}

// =========================================================
// MODAL (Image Preview)
// =========================================================
function openModal(src) {
  document.getElementById("modalImageWrap").innerHTML = `<img src="${src}" style="max-width:100%;">`;
  document.getElementById("modal").classList.remove("hidden");
}

document.addEventListener("click", (e) => {
  if (e.target.id === "closeModal") {
    document.getElementById("modal").classList.add("hidden");
  }
});

// =========================================================
// INIT AUTO DETECT PAGE
// =========================================================
(async function init() {
  allPrompts = await loadPrompts();

  if (document.getElementById("prompt-list")) {
    showPrompts(allPrompts);
  }

  if (document.getElementById("details")) {
    renderDetails();
  }
})();
