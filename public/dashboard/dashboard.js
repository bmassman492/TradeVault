// public/dashboard/dashboard.js

import { GetUsername, GetStrategies, GetFavoritedStrategies, AddFavoriteStrategy, RemoveFavoriteStrategy } from '../api.js';

const userId = sessionStorage.getItem('userId');

if (userId) {
    const rows = await GetUsername(userId);
    const username = rows[0]?.username;
    if (username) {
        document.getElementById('welcome-heading').textContent = `Welcome, ${username}`;
    }
}

async function loadStrategies() {
    const [all, favorited] = await Promise.all([
        GetStrategies(),
        GetFavoritedStrategies(userId)
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
                await RemoveFavoriteStrategy(userId, s.strategy_id);
            } else {
                await AddFavoriteStrategy(userId, s.strategy_id);
            }
            loadStrategies();
        });
        list.appendChild(li);
    }
}

if (userId) loadStrategies();
