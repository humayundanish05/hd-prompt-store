// ===============================
// Universal Helper (Get Query Param)
// ===============================
function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

// ===============================
// Load JSON (GitHub Pages friendly)
// ===============================
async function loadPrompts() {
  const res = await fetch('data/prompts.json'); // correct path
  return await res.json();
}

// ===============================
// Escape HTML
// ===============================
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

// ========================================
// Render Prompt List (Prompts Page)
// ========================================
let allPrompts = [];

async function showPrompts(prompts) {
  const container = document.getElementById('prompt-list');
  if (!container) return;

  container.innerHTML = prompts
    .map(
      (p) => `
    <div class="card">
      <img src="${p.image}" alt="${p.title}" />
      <h3>${p.title}</h3>
      <div class="meta">Category: ${p.category || "Unknown"}</div>
      <div class="actions">
        <a class="btn" href="prompt-details.html?id=${p.id}">View</a>
        <button class="btn" onclick="quickCopy(${p.id})">Copy</button>
      </div>
    </div>`
    )
    .join('');
}

// ===============================
// Quick Copy Button
// ===============================
async function quickCopy(id) {
  const prompts = await loadPrompts();
  const p = prompts.find((x) => x.id == id);
  if (!p) return alert('Prompt not found');

  await navigator.clipboard.writeText(p.prompt);
  alert('Prompt copied!');
}

// ========================================
// Category Filter
// ========================================
async function filterByCategory(category) {
  let filtered;

  if (category === "All") {
    filtered = allPrompts;
  } else {
    filtered = allPrompts.filter((p) => p.category === category);
  }

  showPrompts(filtered);
}

// ========================================
// Prompt Details Page Logic
// ========================================
async function renderDetails() {
  const id = getQueryParam('id');
  const detailsBox = document.getElementById('details');

  if (!id) {
    detailsBox.innerText = "No prompt id.";
    return;
  }

  const prompts = await loadPrompts();
  const p = prompts.find((x) => x.id == id);

  if (!p) {
    detailsBox.innerText = "Prompt not found.";
    return;
  }

  const html = `
    <div class="detail-grid">
      <div>
        <img class="hero-image" src="${p.image}" alt="${p.title}" />
      </div>
      <div>
        <h2>${p.title}</h2>
        <p class="meta">Category: ${p.category || "Unknown"}</p>

        <pre id="promptText" class="prompt-box">${escapeHtml(p.prompt)}</pre>

        <div class="actions">
          <button class="btn" id="copyBtn">Copy Prompt</button>
          <button class="btn" id="previewBtn">Preview Image</button>
          <button class="btn" id="saveBtn">Save to Collection</button>
        </div>
      </div>
    </div>
  `;

  detailsBox.innerHTML = html;

  // Buttons
  document.getElementById('copyBtn').addEventListener('click', async () => {
    await navigator.clipboard.writeText(p.prompt);
    alert('Prompt Copied!');
  });

  document.getElementById('previewBtn').addEventListener('click', () => {
    openModal(p.image);
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    saveToCollection(p);
  });
}

// ========================================
// Modal Helpers
// ========================================
function openModal(src) {
  document.getElementById('modalImageWrap').innerHTML = `
      <img src="${src}" style="max-width:100%" />
    `;
  document.getElementById('modal').classList.remove('hidden');
}

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'closeModal') {
    document.getElementById('modal').classList.add('hidden');
  }
});

// ========================================
// Save Prompt to Collection (LocalStorage)
// ========================================
function saveToCollection(p) {
  const key = 'hd_prompts_collection';
  const cur = JSON.parse(localStorage.getItem(key) || '[]');

  if (cur.find((x) => x.id == p.id))
    return alert('Already saved');

  cur.push(p);
  localStorage.setItem(key, JSON.stringify(cur));
  alert('Saved to My Collection');
}

// ========================================
// INIT — Auto detect page & load correct content
// ========================================
(async function init() {
  const listBox = document.getElementById('prompt-list');
  const detailsBox = document.getElementById('details');

  // If on prompt list page
  if (listBox) {
    allPrompts = await loadPrompts();
    showPrompts(allPrompts);
  }

  // If on details page
  if (detailsBox) {
    renderDetails();
  }
})();
