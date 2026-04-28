// public/api.js
// Exports wrapped HTTP requests as function calls so that backend routes can be called with a simple function

const BASE_URL = 'http://localhost:3000';

async function apiFetch(endpoint, method, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    return response.json();
}

// Auth
export async function CreateUser(username, password) {
    return apiFetch('/api/register', 'POST', { username, password });
}