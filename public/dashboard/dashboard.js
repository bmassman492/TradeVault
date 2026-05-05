// public/dashboard/dashboard.js

import { GetUsername } from '../api.js';

const userId = sessionStorage.getItem('userId');

if (userId) {
    const rows = await GetUsername(userId);
    const username = rows[0]?.username;
    if (username) {
        document.getElementById('welcome-heading').textContent = `Welcome, ${username}`;
    }
}
