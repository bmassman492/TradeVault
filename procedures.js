import { pool } from './db.js';

export async function createUser(username, password) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('CALL CreateUser(?, ?)', [username, password]);
        console.log(`User '${username}' created successfully`);
    } catch (err) {
        console.error('Error calling CreateUser:', err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}