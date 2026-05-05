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

// ==================== Authentication ====================

export async function CreateUser(username, password) {
    return apiFetch('/api/register', 'POST', { username, password });
}

export async function GetAuthContext(username, password) {
    return apiFetch('/api/login', 'POST', { username, password });
}

export async function GetUsername(userId) {
    return apiFetch(`/api/username/${encodeURIComponent(userId)}`, 'GET');
}

// ==================== Strategy Triggers ====================

export async function GetBullishEngulfingTriggers(ticker) {
    return apiFetch(`/api/triggers/bullish-engulfing/${encodeURIComponent(ticker)}`, 'GET');
}

export async function GetInsideBarTriggers(ticker) {
    return apiFetch(`/api/triggers/inside-bar/${encodeURIComponent(ticker)}`, 'GET');
}

export async function GetOutsideBarTriggers(ticker) {
    return apiFetch(`/api/triggers/outside-bar/${encodeURIComponent(ticker)}`, 'GET');
}

export async function GetGoldenCrossTriggers(ticker) {
    return apiFetch(`/api/triggers/golden-cross/${encodeURIComponent(ticker)}`, 'GET');
}

export async function GetMAPullbackTriggers(ticker) {
    return apiFetch(`/api/triggers/ma-pullback/${encodeURIComponent(ticker)}`, 'GET');
}

export async function GetRSI14Triggers(ticker) {
    return apiFetch(`/api/triggers/rsi-14/${encodeURIComponent(ticker)}`, 'GET');
}

// ==================== Stock Pricing ====================

export async function GetStockDayPrice(ticker, date) {
    return apiFetch(`/api/price/${encodeURIComponent(ticker)}/${encodeURIComponent(date)}`, 'GET');
}

export async function GetFutureStockDayPrice(ticker, date, daysOffset) {
    return apiFetch(`/api/price/${encodeURIComponent(ticker)}/${encodeURIComponent(date)}/${encodeURIComponent(daysOffset)}`, 'GET');
}

// ==================== Favorited Stocks ====================

export async function AddFavoritedStock(userId, ticker) {
    return apiFetch('/api/favorited-stocks', 'POST', { userId, ticker });
}

export async function DeleteFavoritedStock(userId, ticker) {
    return apiFetch('/api/favorited-stocks', 'DELETE', { userId, ticker });
}

export async function GetFavoritedStocks(userId) {
    return apiFetch(`/api/favorited-stocks/${encodeURIComponent(userId)}`, 'GET');
}

// ==================== Favorited Strategies ====================

export async function AddFavoriteStrategy(userId, strategyId) {
    return apiFetch('/api/favorited-strategies', 'POST', { userId, strategyId });
}

export async function RemoveFavoriteStrategy(userId, strategyId) {
    return apiFetch('/api/favorited-strategies', 'DELETE', { userId, strategyId });
}

export async function GetFavoritedStrategies(userId) {
    return apiFetch(`/api/favorited-strategies/${encodeURIComponent(userId)}`, 'GET');
}

// ==================== Results ====================

export async function AddResult(userId, strategyId, name, description, notes) {
    return apiFetch('/api/results', 'POST', { userId, strategyId, name, description, notes });
}

export async function DeleteResult(resultId) {
    return apiFetch(`/api/results/${encodeURIComponent(resultId)}`, 'DELETE');
}

export async function GetResults(userId) {
    return apiFetch(`/api/results/${encodeURIComponent(userId)}`, 'GET');
}

// ==================== Stocks ====================

export async function GetStocks() {
    return apiFetch('/api/stocks', 'GET');
}

export async function GetStockTicker(name) {
    return apiFetch(`/api/stocks/ticker/${encodeURIComponent(name)}`, 'GET');
}

// ==================== Strategies ====================

export async function GetStrategies() {
    return apiFetch('/api/strategies', 'GET');
}

export async function GetStrategyID(strategyName) {
    return apiFetch(`/api/strategies/id/${encodeURIComponent(strategyName)}`, 'GET');
}