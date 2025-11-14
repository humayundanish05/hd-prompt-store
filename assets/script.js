// universal helper to get query param
function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

// load JSON (works on GitHub Pages if path correct)
async function loadPrompts() {
  const res = await fetch('/data/prompts.json');
  return await res.json();
}

// prompt list rendering on prompts.html (keep existing)
async function showPrompts(prompts) {
  const container = document.getElementById('prompt-list');
  if (!container) return;
  container.innerHTML = prompts.map(p => `
    <div class="card">
      <img src="${p.image}" alt="${p.title}" />
      <h3>${p.title}</h3>
      <div class="meta">Model: ${p.model || 'Any'}</div>
      <div class="actions">
        <a class="btn" href="prompt-details.html?id=${p.id}">View</a>
        <button class="btn" data-id="${p.id}" onclick="quickCopy(${p.id})">Copy</button>
      </div>
    </div>
  `).join('');
}

// quick copy used on list cards
async function quickCopy(id) {
  const prompts = await loadPrompts();
  const p = prompts.find(x => x.id == id);
  if (!p) return alert('Prompt not found');
  await navigator.clipboard.writeText(p.prompt);
  alert('Prompt copied to clipboard!');
}

// prompt details page logic
async function renderDetails() {
  const id = getQueryParam('id');
  if (!id) {
    document.getElementById('details').innerText = 'No prompt id.';
    return;
  }
  const prompts = await loadPrompts();
  const p = prompts.find(x => x.id == id);
  if (!p) {
    document.getElementById('details').innerText = 'Prompt not found.';
    return;
  }

  const html = `
    <div class="detail-grid">
      <div>
        <img class="hero-image" src="${p.image}" alt="${p.title}"/>
      </div>
      <div>
        <h2>${p.title}</h2>
        <p class="meta">Model: ${p.model || 'Midjourney/SD'}</p>
        <pre id="promptText" class="prompt-box">${escapeHtml(p.prompt)}</pre>
        <div class="actions">
          <button class="btn" id="copyBtn">Copy Prompt</button>
          <button class="btn" id="previewBtn">Preview Image</button>
          <button class="btn" id="saveBtn">Save to Collection</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('details').innerHTML = html;

  document.getElementById('copyBtn').addEventListener('click', async () => {
    await navigator.clipboard.writeText(p.prompt);
    alert('Prompt copied!');
  });

  document.getElementById('previewBtn').addEventListener('click', () => {
    openModal(p.image);
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    saveToCollection(p);
  });
}

// modal helpers
function openModal(src) {
  document.getElementById('modalImageWrap').innerHTML = `<img src="${src}" style="max-width:100%"/>`;
  document.getElementById('modal').classList.remove('hidden');
}
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'closeModal') document.getElementById('modal').classList.add('hidden');
});

// save to localStorage (simple collections)
function saveToCollection(p) {
  const key = 'hd_prompts_collection';
  const cur = JSON.parse(localStorage.getItem(key) || '[]');
  if (cur.find(x=>x.id==p.id)) return alert('Already saved');
  cur.push(p);
  localStorage.setItem(key, JSON.stringify(cur));
  alert('Saved to My Collection');
}

function escapeHtml(text){
  return text.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
}

// init
(async function init() {
  // if on list page
  if (document.getElementById('prompt-list')) {
    const prompts = await loadPrompts();
    showPrompts(prompts);
  }
  // if on details page
  if (document.getElementById('details')) {
    renderDetails();
  }
})();
let allPrompts = [];

function filterByCategory(category) {
    let filtered = [];

    if (category === "All") {
        filtered = allPrompts;
    } else {
        filtered = allPrompts.filter(p => p.category === category);
    }

    displayPrompts(filtered);
}


