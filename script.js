const CATEGORY_MAP = {
  common: '基本法規',
  sanxia: '三峽校區自治法規',
  taipei: '臺北校區自治法規',
  judiciary: '司法法規'
};

const TAG_MAP = {
  finance: '財務',
  organization: '組織',
  personnel: '人事',
  delegate: '學生代表',
  election: '選舉',
  procedure: '議事'
};

async function fetchManifest() {
  const res = await fetch('./manifest.json');
  return await res.json();
}

function renderSidebar(files) {
  const sidebar = document.getElementById('lawList');
  sidebar.innerHTML = '';
  const grouped = {};

  for (const file of files) {
    if (!grouped[file.category]) grouped[file.category] = [];
    grouped[file.category].push(file);
  }

  for (const [cat, list] of Object.entries(grouped)) {
    const li = document.createElement('li');
    li.className = 'nav-item';
    li.innerHTML = `<div class="fw-bold px-3 mt-3">${CATEGORY_MAP[cat] || cat}</div>`;
    sidebar.appendChild(li);
    for (const item of list) {
      const link = document.createElement('a');
      link.className = 'nav-link px-3';
      link.href = `#${item.id}`;
      link.textContent = item.title;
      link.dataset.id = item.id;
      sidebar.appendChild(link);
    }
  }
}

function updateBreadcrumb(title) {
  const breadcrumb = document.getElementById('breadcrumbNav');
  breadcrumb.innerHTML = `<li class="breadcrumb-item"><a href="#">首頁</a></li><li class="breadcrumb-item active">${title}</li>`;
}

async function loadLaw(id, files) {
  const file = files.find(f => f.id === id);
  if (!file) return;

  const raw = await fetch(`./file/${file.filename}`).then(res => res.text());
  const [yamlText, ...body] = raw.split('---').filter(Boolean);
  const meta = jsyaml.load(yamlText);
  const content = body.join('---').trim();

  document.querySelectorAll('#lawList .nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.id === id);
  });

  const lawDiv = document.getElementById('lawContent');
  updateBreadcrumb(meta.title);
  lawDiv.innerHTML = `
    <h2>${meta.title}</h2>
    <p><strong>分類：</strong>${CATEGORY_MAP[meta.category]}</p>
    <p><strong>標籤：</strong>${(meta.tags || []).map(tag => TAG_MAP[tag] || tag).join(', ')}</p>
    <p><strong>最近異動：</strong>${meta.modified}</p>
    <p><strong>歷來修正：</strong>${meta.history}</p>
    <p><strong>狀態：</strong>${meta.status === 'abolished' ? '已廢止' : '施行中'}</p>
    <hr>
    <pre style="white-space: pre-wrap">${content}</pre>
  `;
}

(async () => {
  const files = await fetchManifest();
  renderSidebar(files);

  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (id) loadLaw(id, files);
  });

  if (location.hash) {
    loadLaw(location.hash.replace('#', ''), files);
  }
})();
