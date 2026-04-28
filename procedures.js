// procedures.js
// Grabs a connection from the pool and uses it to call the stored procedure

import { pool } from './db.js';

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