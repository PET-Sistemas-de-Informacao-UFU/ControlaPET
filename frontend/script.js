const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>'
};

// Itens padrão (usados apenas na primeira vez, antes de existir algo salvo)
const DEFAULT_ITEMS = [
  { emoji: '📦', name: 'Resma de papel', qty: '10 Un.', status: 'Disponível — 10 unidades em estoque.' },
  { emoji: '🔌', name: 'Cabo HDMI', qty: '4 Un.', status: '3 disponíveis, 1 emprestado com Thiago.' },
  { emoji: '⌨️', name: 'Teclado', qty: '5 Un.', status: '5 disponíveis no armário PET.' },
  { emoji: '🔋', name: 'Extensão', qty: '7 Un.', status: '6 disponíveis, 1 em manutenção.' },
  { emoji: '🖥️', name: 'Monitor LG', qty: '2 Un.', status: 'Emprestado com Thiago desde hoje, 10:00.' },
  { emoji: '📽️', name: 'Projetor Epson', qty: '1 Un.', status: 'Disponível — reservar com antecedência.' },
];

const LOGS = []; // será preenchido com dados reais da API futuramente
let auditFilter = { date: null, name: null };
const STORAGE_KEY = 'inpetario_items';

// ---- Persistência (localStorage) ----
function loadItems(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){
    console.warn('Não foi possível ler o localStorage, usando itens padrão.', e);
  }
  return DEFAULT_ITEMS.slice();
}

function saveItems(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ITEMS));
}

let ITEMS = loadItems();
let currentTab = 'scanner';
let editingIndex = null; // null = modo "adicionar" | número = modo "editar"

function renderCatalogo(){
  return `
    <div class="search-bar">${ICONS.search}<span>Procurar...</span></div>
    <div class="section-label">Itens do catálogo</div>
    ${ITEMS.map((it,i) => `
      <div class="item-card">
        <div class="item-thumb" onclick="openModal(${i})">${it.emoji}</div>
        <div class="item-info" onclick="openModal(${i})">
          <div class="name">${it.name}</div>
          <div class="qty">${it.qty}</div>
        </div>
        <div class="item-edit-btn" onclick="event.stopPropagation(); openEditModal(${i})">${ICONS.edit}</div>
        <div class="item-arrow" onclick="openModal(${i})">${ICONS.chevron}</div>
      </div>
    `).join('')}
    <div class="fab-add" onclick="openAddModal()" title="Adicionar item">+</div>
  `;
}

function renderScanner(){
  return `
    <div class="scan-wrap">
      <div class="scan-frame">
        <div class="scan-corner tl"></div>
        <div class="scan-corner tr"></div>
        <div class="scan-corner bl"></div>
        <div class="scan-corner br"></div>
        <div class="scan-line"></div>
      </div>
      <div class="scan-status" id="scan-status">Procurando algo para escanear...</div>
      <div class="scan-hint">Aponte a câmera para o Data Matrix impresso no equipamento.</div>
      <button class="scan-demo-btn" onclick="simulateScan()">Simular leitura</button>
    </div>
  `;
}

function getFilteredLogs(){
  return LOGS.filter(l => {
    const matchesDate = !auditFilter.date || l.date === auditFilter.date;
    const matchesName = !auditFilter.name || l.who.toLowerCase().includes(auditFilter.name.toLowerCase());
    return matchesDate && matchesName;
  });
}

function getFilteredLogs(){
  return LOGS.filter(l => {
    const matchesDate = !auditFilter.date || l.date === auditFilter.date;
    const matchesName = !auditFilter.name || l.who.toLowerCase().includes(auditFilter.name.toLowerCase());
    return matchesDate && matchesName;
  });
}

function getFilteredLogs(){
  return LOGS.filter(l => {
    const matchesDate = !auditFilter.date || l.date === auditFilter.date;
    const matchesName = !auditFilter.name || l.who.toLowerCase().includes(auditFilter.name.toLowerCase());
    return matchesDate && matchesName;
  });
}

function getFilteredLogs(){
  return LOGS.filter(l => {
    const matchesDate = !auditFilter.date || l.date === auditFilter.date;
    const matchesName = !auditFilter.name || l.who.toLowerCase().includes(auditFilter.name.toLowerCase());
    return matchesDate && matchesName;
  });
}

function renderAuditoria(){
  const filtered = getFilteredLogs();
  return `
    <div class="search-bar" onclick="openAuditSearchModal()">${ICONS.filter}<span>Pesquisar / Filtrar...</span></div>
    <div class="section-label">Movimentações</div>
    <div id="log-list">
    ${filtered.length ? filtered.map(l => `
      <div class="log-item">
        <div class="log-dotline">
          <div class="log-dot" style="background:${l.color}"></div>
          <div class="log-thread"></div>
        </div>
        <div class="log-body">
          <div class="log-time"><b>${l.tag}</b> - ${l.time}</div>
          <div class="log-text"><b>${l.who}</b> ${l.text}</div>
        </div>
      </div>
    `).join('') : '<div style="padding:20px;text-align:center;color:#888;">Nenhuma movimentação encontrada.</div>'}
    </div>
  `;
}

const TITLES = { catalogo: 'Catálogo', scanner: 'Ler', auditoria: 'Auditoria' };
const RENDERERS = { catalogo: renderCatalogo, scanner: renderScanner, auditoria: renderAuditoria };

function switchTab(tab){
  currentTab = tab;
  document.getElementById('header-title').textContent = TITLES[tab];
  document.getElementById('content').innerHTML = RENDERERS[tab]();
  document.querySelectorAll('.nav-item').forEach(el=>{
    el.classList.toggle('active', el.dataset.tab === tab);
  });
}

document.querySelectorAll('[data-tab]').forEach(el=>{
  el.addEventListener('click', ()=> switchTab(el.dataset.tab));
});

// ---- Modal de visualização (detalhes do item) ----
function openModal(index){
  const it = ITEMS[index];
  document.getElementById('modal-title').textContent = it.name;
  document.getElementById('modal-sub').textContent = it.status;
  document.getElementById('modal-overlay').classList.add('open');
}
document.getElementById('modal-close').addEventListener('click', ()=>{
  document.getElementById('modal-overlay').classList.remove('open');
});
document.getElementById('modal-overlay').addEventListener('click', (e)=>{
  if(e.target.id === 'modal-overlay') document.getElementById('modal-overlay').classList.remove('open');
});

// ---- Modal de adicionar/editar (CRUD) ----
function openAddModal(){
  editingIndex = null;
  document.getElementById('edit-modal-title').textContent = 'Novo item';
  document.getElementById('edit-emoji').value = '';
  document.getElementById('edit-name').value = '';
  document.getElementById('edit-qty').value = '';
  document.getElementById('edit-status').value = '';
  document.getElementById('edit-delete').style.display = 'none';
  document.getElementById('edit-modal-overlay').classList.add('open');
}

function openEditModal(index){
  editingIndex = index;
  const it = ITEMS[index];
  document.getElementById('edit-modal-title').textContent = 'Editar item';
  document.getElementById('edit-emoji').value = it.emoji;
  document.getElementById('edit-name').value = it.name;
  document.getElementById('edit-qty').value = parseInt(it.qty) || '';
  document.getElementById('edit-status').value = it.status;
  document.getElementById('edit-delete').style.display = 'block';
  document.getElementById('edit-modal-overlay').classList.add('open');
}

function closeEditModal(){
  document.getElementById('edit-modal-overlay').classList.remove('open');
  editingIndex = null;
}

document.getElementById('edit-modal-close').addEventListener('click', closeEditModal);
document.getElementById('edit-modal-overlay').addEventListener('click', (e)=>{
  if(e.target.id === 'edit-modal-overlay') closeEditModal();
});

document.getElementById('edit-save').addEventListener('click', ()=>{
  const emoji = document.getElementById('edit-emoji').value.trim() || '📦';
  const name = document.getElementById('edit-name').value.trim();
  const qty = document.getElementById('edit-qty').value.trim();
  const statusInput = document.getElementById('edit-status').value.trim();

  if(!name || !qty){
    alert('Preencha ao menos o nome e a quantidade.');
    return;
  }

  const status = statusInput || `Disponível — ${qty} unidades em estoque.`;
  const item = { emoji, name, qty: qty + ' Un.', status };

  if(editingIndex === null){
    ITEMS.push(item); // CREATE
  } else {
    ITEMS[editingIndex] = item; // UPDATE
  }

  saveItems();
  closeEditModal();
  document.getElementById('content').innerHTML = renderCatalogo();
});

document.getElementById('edit-delete').addEventListener('click', ()=>{
  if(editingIndex === null) return;
  const it = ITEMS[editingIndex];
  if(confirm(`Excluir "${it.name}" do catálogo?`)){
    ITEMS.splice(editingIndex, 1); // DELETE
    saveItems();
    closeEditModal();
    document.getElementById('content').innerHTML = renderCatalogo();
  }
});

function simulateScan(){
  const status = document.getElementById('scan-status');
  status.textContent = 'Lendo código...';
  setTimeout(()=>{
    status.textContent = 'Item encontrado!';
    openModal(4); // Monitor LG
  }, 700);
}

function openAuditSearchModal(){
  document.getElementById('audit-search-date').value = auditFilter.date || '';
  document.getElementById('audit-search-name').value = auditFilter.name || '';
  document.getElementById('audit-search-overlay').classList.add('open');
}

function closeAuditSearchModal(){
  document.getElementById('audit-search-overlay').classList.remove('open');
}

document.getElementById('audit-search-close').addEventListener('click', closeAuditSearchModal);
document.getElementById('audit-search-overlay').addEventListener('click', (e)=>{
  if(e.target.id === 'audit-search-overlay') closeAuditSearchModal();
});

document.getElementById('audit-search-apply').addEventListener('click', ()=>{
  const date = document.getElementById('audit-search-date').value;
  const name = document.getElementById('audit-search-name').value.trim();
  auditFilter = { date: date || null, name: name || null };
  closeAuditSearchModal();
  document.getElementById('content').innerHTML = renderAuditoria();
});

document.getElementById('audit-search-clear').addEventListener('click', ()=>{
  auditFilter = { date: null, name: null };
  closeAuditSearchModal();
  document.getElementById('content').innerHTML = renderAuditoria();
});

switchTab('scanner');
