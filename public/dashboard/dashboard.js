// public/dashboard/dashboard.js

import * as API from '../api.js';

const userId = sessionStorage.getItem('userId');

if (userId) {
    const rows = await API.GetUsername(userId);
    const username = rows[0]?.username;
    if (username) {
        document.getElementById('welcome-heading').textContent = `Welcome, ${username}`;
    }
}

async function loadStrategies() {
    const [all, favorited] = await Promise.all([
        API.GetStrategies(),
        API.GetFavoritedStrategies(userId)
    ]);

    const favNames = new Set(favorited.map(f => f.strategy_name));

    all.sort((a, b) => {
        const aFav = favNames.has(a.strategy_name);
        const bFav = favNames.has(b.strategy_name);
        if (aFav !== bFav) return aFav ? -1 : 1;
        return a.strategy_name.localeCompare(b.strategy_name);
    });

    const list = document.getElementById('strategy-list');
    list.innerHTML = '';

    for (const s of all) {
        const isFav = favNames.has(s.strategy_name);
        const li = document.createElement('li');
        li.textContent = s.strategy_name;
        li.classList.toggle('favorited', isFav);
        li.addEventListener('click', async () => {
            if (isFav) {
                await API.RemoveFavoriteStrategy(userId, s.strategy_id);
            } else {
                await API.AddFavoriteStrategy(userId, s.strategy_id);
            }
            loadStrategies();
        });
        list.appendChild(li);
    }
}

if (userId) loadStrategies();

async function loadStocks() {
    const [all, favorited] = await Promise.all([
        API.GetStocks(),
        API.GetFavoritedStocks(userId)
    ]);

    const favNames = new Set(favorited.map(f => f.name));

    all.sort((a, b) => {
        const aFav = favNames.has(a.name);
        const bFav = favNames.has(b.name);
        if (aFav !== bFav) return aFav ? -1 : 1;
        return a.name.localeCompare(b.name);
    });

    const list = document.getElementById('stock-list');
    list.innerHTML = '';

    for (const s of all) {
        const isFav = favNames.has(s.name);
        const li = document.createElement('li');
        li.classList.toggle('favorited', isFav);

        const tickerSpan = document.createElement('span');
        tickerSpan.className = 'stock-ticker';
        tickerSpan.textContent = s.ticker;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'stock-name';
        nameSpan.textContent = s.name;

        li.appendChild(tickerSpan);
        li.appendChild(nameSpan);
        li.addEventListener('click', async () => {
            if (isFav) {
                await API.DeleteFavoritedStock(userId, s.ticker);
            } else {
                await API.AddFavoritedStock(userId, s.ticker);
            }
            loadStocks();
        });
        list.appendChild(li);
    }
}

if (userId) loadStocks();

async function loadResults() {
    if (!userId) return;
    const results = await API.GetResults(userId);
    const list = document.getElementById('results-list');
    list.innerHTML = '';
    for (const r of results) {
        const li = document.createElement('li');
        li.textContent = r.name;
        li.addEventListener('click', () => openModal(r));
        list.appendChild(li);
    }
}

function openModal(r) {
    console.log('Result data:', r);
    document.getElementById('modal-name').textContent = r.name;
    document.getElementById('modal-strategy').textContent = r.strategy_name;
    document.getElementById('modal-description').textContent = r.description;
    document.getElementById('modal-notes').textContent = r.notes || '—';

    document.getElementById('modal-delete-btn').onclick = async () => {
        console.log('Deleting result_id:', r.result_id);
        const res = await API.DeleteResult(r.result_id);
        if (res?.error) {
            console.error('Delete failed:', res.error);
            return;
        }
        closeModal();
        loadResults();
    };

    document.getElementById('result-modal').removeAttribute('hidden');
}

function closeModal() {
    document.getElementById('result-modal').setAttribute('hidden', '');
}

document.getElementById('modal-close-btn').addEventListener('click', closeModal);
document.getElementById('result-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
});

window.addEventListener('result-saved', loadResults);

if (userId) loadResults();
