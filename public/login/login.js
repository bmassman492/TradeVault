import { CreateUser, GetAuthContext } from '../api.js';

document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const result = await GetAuthContext(username, password);
    if (result.userId) {
        sessionStorage.setItem('userId', result.userId);
        window.location.href = '../dashboard/dashboard.html';
    } else {
        document.getElementById('message').textContent = result.error || 'Login failed.';
    }
});

document.getElementById('createBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const result = await CreateUser(username, password);
    document.getElementById('message').textContent = result.message || result.error || 'Account created.';
});
