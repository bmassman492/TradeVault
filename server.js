// server.js
// Starts a server that listens for HTTP requests from the frontend and calls procedures.js functions
// Input validation and status handling are also written here

import express from 'express';
import cors from 'cors';
import {
    CreateUser,
    GetAuthContext,
    GetBullishEngulfingTriggers,
    GetInsideBarTriggers,
    GetOutsideBarTriggers,
    GetGoldenCrossTriggers,
    GetMAPullbackTriggers,
    GetRSI14Triggers,
    GetStockDayPrice,
    GetFutureStockDayPrice,
    AddFavoritedStock,
    DeleteFavoritedStock,
    GetFavoritedStocks,
    AddFavoriteStrategy,
    RemoveFavoriteStrategy,
    GetFavoritedStrategies,
    AddResult,
    DeleteResult,
    GetResults,
    GetStocks,
    GetStockTicker,
    GetStrategies,
    GetStrategyID,
    GetUsername
} from './procedures.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ==================== Authentication ====================

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        await CreateUser(username, password);
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Username already exists' });
        }
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const rows = await GetAuthContext(username);
        if (!rows || rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        if (rows[0].password !== password) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        res.status(200).json({ message: 'Login successful', userId: rows[0].user_id });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/username/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const rows = await GetUsername(userId);
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetUsername error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== Strategy Triggers ====================

app.get('/api/triggers/bullish-engulfing/:ticker', async (req, res) => {
    const { ticker } = req.params;

    try {
        const rows = await GetBullishEngulfingTriggers(ticker);
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetBullishEngulfingTriggers error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/triggers/inside-bar/:ticker', async (req, res) => {
    const { ticker } = req.params;

    try {
        const rows = await GetInsideBarTriggers(ticker);
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetInsideBarTriggers error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/triggers/outside-bar/:ticker', async (req, res) => {
    const { ticker } = req.params;

    try {
        const rows = await GetOutsideBarTriggers(ticker);
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetOutsideBarTriggers error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/triggers/golden-cross/:ticker', async (req, res) => {
    const { ticker } = req.params;

    try {
        const rows = await GetGoldenCrossTriggers(ticker);
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetGoldenCrossTriggers error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/triggers/ma-pullback/:ticker', async (req, res) => {
    const { ticker } = req.params;

    try {
        const rows = await GetMAPullbackTriggers(ticker);
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetMAPullbackTriggers error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/triggers/rsi-14/:ticker', async (req, res) => {
    const { ticker } = req.params;

    try {
        const rows = await GetRSI14Triggers(ticker);
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetRSI14Triggers error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== Stock Pricing ====================

app.get('/api/price/:ticker/:date', async (req, res) => {
    const { ticker, date } = req.params;

    try {
        const rows = await GetStockDayPrice(ticker, date);
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetStockDayPrice error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/price/:ticker/:date/:daysOffset', async (req, res) => {
    const { ticker, date, daysOffset } = req.params;

    try {
        const rows = await GetFutureStockDayPrice(ticker, date, parseInt(daysOffset));
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetFutureStockDayPrice error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== Favorited Stocks ====================

app.post('/api/favorited-stocks', async (req, res) => {
    const { userId, ticker } = req.body;

    if (!userId || !ticker) {
        return res.status(400).json({ error: 'userId and ticker are required' });
    }

    try {
        await AddFavoritedStock(userId, ticker);
        res.status(201).json({ message: 'Stock favorited successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Stock already favorited' });
        }
        console.error('AddFavoritedStock error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/favorited-stocks', async (req, res) => {
    const { userId, ticker } = req.body;

    if (!userId || !ticker) {
        return res.status(400).json({ error: 'userId and ticker are required' });
    }

    try {
        await DeleteFavoritedStock(userId, ticker);
        res.status(200).json({ message: 'Favorited stock removed successfully' });
    } catch (err) {
        console.error('DeleteFavoritedStock error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/favorited-stocks/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const rows = await GetFavoritedStocks(userId);
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetFavoritedStocks error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== Favorited Strategies ====================

app.post('/api/favorited-strategies', async (req, res) => {
    const { userId, strategyId } = req.body;

    if (!userId || !strategyId) {
        return res.status(400).json({ error: 'userId and strategyId are required' });
    }

    try {
        await AddFavoriteStrategy(userId, strategyId);
        res.status(201).json({ message: 'Strategy favorited successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Strategy already favorited' });
        }
        console.error('AddFavoriteStrategy error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/favorited-strategies', async (req, res) => {
    const { userId, strategyId } = req.body;

    if (!userId || !strategyId) {
        return res.status(400).json({ error: 'userId and strategyId are required' });
    }

    try {
        await RemoveFavoriteStrategy(userId, strategyId);
        res.status(200).json({ message: 'Favorited strategy removed successfully' });
    } catch (err) {
        console.error('RemoveFavoriteStrategy error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/favorited-strategies/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const rows = await GetFavoritedStrategies(userId);
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetFavoritedStrategies error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== Results ====================

app.post('/api/results', async (req, res) => {
    const { userId, strategyId, name, description, notes } = req.body;

    if (!userId || !strategyId || !name) {
        return res.status(400).json({ error: 'userId, strategyId, and name are required' });
    }

    try {
        await AddResult(userId, strategyId, name, description || null, notes || null);
        res.status(201).json({ message: 'Result saved successfully' });
    } catch (err) {
        console.error('AddResult error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/results/:resultId', async (req, res) => {
    const { resultId } = req.params;

    try {
        await DeleteResult(resultId);
        res.status(200).json({ message: 'Result deleted successfully' });
    } catch (err) {
        console.error('DeleteResult error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/results/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const rows = await GetResults(userId);
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetResults error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== Stocks ====================

app.get('/api/stocks', async (req, res) => {
    try {
        const rows = await GetStocks();
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetStocks error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/stocks/ticker/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const rows = await GetStockTicker(name);
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetStockTicker error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== Strategies ====================

app.get('/api/strategies', async (req, res) => {
    try {
        const rows = await GetStrategies();
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetStrategies error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/strategies/id/:strategyName', async (req, res) => {
    const { strategyName } = req.params;

    try {
        const rows = await GetStrategyID(strategyName);
        res.status(200).json(rows);
    } catch (err) {
        console.error('GetStrategyID error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});