const generatedCard = document.getElementById('generatedCard');
const categorySelect = document.getElementById('categorySelect');
const generateBtn = document.getElementById('generateBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const submitText = document.getElementById('submitText');
const submitCategory = document.getElementById('submitCategory');
const submitBtn = document.getElementById('submitBtn');
const submitMessage = document.getElementById('submitMessage');
const favoritesList = document.getElementById('favoritesList');

const FAVORITES_KEY = 'pickupzz-favorites';

const getFavorites = () => JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
const saveFavorites = (items) => localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));

function renderFavorites() {
  const favorites = getFavorites();
  favoritesList.innerHTML = favorites.length
    ? favorites.map((line) => `<li>${line.text} <span class="muted">(${line.category})</span></li>`).join('')
    : '<li class="muted">No favorites yet.</li>';
}

function lineHTML(line) {
  return `
    <p>${line.text}</p>
    <p class="muted">Category: ${line.category} • Likes: ${line.likes}</p>
    <button id="copyBtn" class="small-btn">Copy</button>
    <button id="favoriteBtn" class="small-btn">Favorite</button>
  `;
}

generateBtn.addEventListener('click', async () => {
  const category = categorySelect.value;
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const res = await fetch(`/api/generate${query}`);

  if (!res.ok) {
    generatedCard.innerHTML = '<p class="muted">No lines found for that category.</p>';
    return;
  }

  const line = await res.json();
  generatedCard.innerHTML = lineHTML(line);

  document.getElementById('copyBtn').onclick = async () => {
    await navigator.clipboard.writeText(line.text);
  };

  document.getElementById('favoriteBtn').onclick = async () => {
    const favorites = getFavorites();
    if (!favorites.find((item) => item.id === line.id)) {
      favorites.unshift(line);
      saveFavorites(favorites);
      renderFavorites();
      await fetch('/api/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: line.id })
      });
    }
  };
});

searchBtn.addEventListener('click', async () => {
  const q = searchInput.value.trim();
  if (!q) return;

  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const results = await res.json();
  searchResults.innerHTML = results.length
    ? results.map((line) => `<li>${line.text} <span class="muted">(${line.category})</span></li>`).join('')
    : '<li class="muted">No matching lines found.</li>';
});

submitBtn.addEventListener('click', async () => {
  const text = submitText.value.trim();
  if (!text) {
    submitMessage.textContent = 'Please enter a pickup line.';
    return;
  }

  const payload = { text, category: submitCategory.value.trim() || 'user' };
  const res = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    submitMessage.textContent = 'Submission failed.';
    return;
  }

  submitText.value = '';
  submitCategory.value = '';
  submitMessage.textContent = 'Submitted successfully.';
});

renderFavorites();
