// procedures.js
// Grabs a connection from the pool and uses it to call the stored procedure

import { pool } from './db.js';

// ==================== Authentication ====================

export async function CreateUser(username, password) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('CALL CreateUser(?, ?)', [username, password]);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function GetAuthContext(username) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetAuthContext(?)', [username]);
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function GetUsername(userId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetUsername(?)', [userId]);
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

// ==================== Strategy Triggers ====================

export async function GetBullishEngulfingTriggers(ticker) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetBullishEngulfingTriggers(?)', [ticker]);
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function GetInsideBarTriggers(ticker) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetInsideBarTriggers(?)', [ticker]);
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function GetOutsideBarTriggers(ticker) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetOutsideBarTriggers(?)', [ticker]);
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function GetGoldenCrossTriggers(ticker) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetGoldenCrossTriggers(?)', [ticker]);
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function GetMAPullbackTriggers(ticker) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetMAPullbackTriggers(?)', [ticker]);
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function GetRSI14Triggers(ticker) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetRSI14Triggers(?)', [ticker]);
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

// ==================== Stock Pricing ====================

export async function GetStockDayPrice(ticker, date) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetStockDayPrice(?, ?)', [ticker, date]);
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function GetFutureStockDayPrice(ticker, date, daysOffset) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetFutureStockDayPrice(?, ?, ?)', [ticker, date, daysOffset]);
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

// ==================== Favorited Stocks ====================

export async function AddFavoritedStock(userId, ticker) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('CALL AddFavoritedStock(?, ?)', [userId, ticker]);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function DeleteFavoritedStock(userId, ticker) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('CALL DeleteFavoritedStock(?, ?)', [userId, ticker]);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function GetFavoritedStocks(userId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetFavoritedStocks(?)', [userId]);
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

// ==================== Favorited Strategies ====================

export async function AddFavoriteStrategy(userId, strategyId) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('CALL AddFavoriteStrategy(?, ?)', [userId, strategyId]);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function RemoveFavoriteStrategy(userId, strategyId) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('CALL RemoveFavoriteStrategy(?, ?)', [userId, strategyId]);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function GetFavoritedStrategies(userId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetFavoritedStrategies(?)', [userId]);
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

// ==================== Results ====================

export async function AddResult(userId, strategyId, name, description, notes) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('CALL AddResult(?, ?, ?, ?, ?)', [userId, strategyId, name, description, notes]);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function DeleteResult(resultId) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('CALL DeleteResult(?)', [resultId]);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function GetResults(userId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetResults(?)', [userId]);
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

// ==================== Stocks ====================

export async function GetStocks() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetStocks()');
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function GetStockTicker(name) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetStockTicker(?)', [name]);
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

// ==================== Strategies ====================

export async function GetStrategies() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetStrategies()');
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

export async function GetStrategyID(strategyName) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('CALL GetStrategyID(?)', [strategyName]);
        return rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}