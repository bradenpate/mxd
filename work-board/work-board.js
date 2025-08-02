const state = {
  items: [],
  search: '',
  filters: {}
};

document.getElementById('refreshBtn').addEventListener('click', fetchData);
document.getElementById('searchInput').addEventListener('input', e => {
  state.search = e.target.value.toLowerCase();
  renderGallery();
});
document.getElementById('closeLightbox').addEventListener('click', closeLightbox);

fetchData();
setInterval(fetchData, 60000);

async function fetchData() {
  try {
    const res = await fetch('./api/list-images');
    state.items = await res.json();
    state.filters = buildFilterSets(state.items);
    renderFilters();
    renderGallery();
  } catch (err) {
    console.error('Failed to fetch images', err);
  }
}

function buildFilterSets(items) {
  const fields = ['agileTeam', 'assetType', 'status', 'user'];
  const sets = {};
  fields.forEach(f => sets[f] = new Set());
  items.forEach(item => fields.forEach(f => {
    const value = item.metadata[f];
    if (value) sets[f].add(value);
  }));
  return sets;
}

function renderFilters() {
  const filtersEl = document.getElementById('filters');
  filtersEl.innerHTML = '';
  Object.entries(state.filters).forEach(([field, values]) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'filter-group';
    const title = document.createElement('strong');
    title.textContent = field;
    wrapper.appendChild(title);
    values.forEach(val => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.field = field;
      input.value = val;
      input.addEventListener('change', renderGallery);
      label.appendChild(input);
      label.append(` ${val}`);
      wrapper.appendChild(label);
    });
    filtersEl.appendChild(wrapper);
  });
}

function renderGallery() {
  const activeFilters = {};
  document.querySelectorAll('#filters input:checked').forEach(cb => {
    const field = cb.dataset.field;
    activeFilters[field] = activeFilters[field] || [];
    activeFilters[field].push(cb.value);
  });

  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  state.items
    .filter(item => passesFilters(item.metadata, activeFilters))
    .filter(item => matchesSearch(item.metadata, state.search))
    .forEach(item => gallery.appendChild(createCard(item)));
}

function passesFilters(meta, filters) {
  return Object.entries(filters).every(([field, values]) => values.includes(meta[field]));
}

function matchesSearch(meta, query) {
  if (!query) return true;
  return Object.values(meta).some(v => (v || '').toString().toLowerCase().includes(query));
}

function createCard(item) {
  const card = document.createElement('div');
  card.className = 'card';
  const img = document.createElement('img');
  img.src = item.thumb;
  img.alt = item.metadata.alt || '';
  card.appendChild(img);
  card.addEventListener('click', () => openLightbox(item));
  return card;
}

function openLightbox(item) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightboxImg').src = item.url;

  const metaList = document.getElementById('metaList');
  metaList.innerHTML = '';
  Object.entries(item.metadata).forEach(([k, v]) => {
    if (!v) return;
    const li = document.createElement('li');
    li.innerHTML = `<strong>${k}:</strong> ${v}`;
    metaList.appendChild(li);
  });

  const fileLink = document.getElementById('fileLink');
  if (item.metadata.fileURL) {
    fileLink.href = item.metadata.fileURL;
    fileLink.classList.remove('hidden');
  } else {
    fileLink.classList.add('hidden');
  }

  lb.classList.remove('hidden');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
}
