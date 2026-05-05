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
