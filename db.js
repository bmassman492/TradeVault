// db.js
// Establishes a connection to mariadb using authentication information and creates a pool of usable connections

import * as mariadb from 'mariadb';

const pool = mariadb.createPool({ //I am aware that best practice is to store these in a .env file. That is not necessary in this instance. 
    host: 'washington.uww.edu',
    user: 'massmanbs23',
    password: 'bm2921',
    database: 'cs366-2261_massmanbs23',
    connectionLimit: 5
});

async function getConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Successfully connected to the database');
        return connection;
    } catch (err) {
        console.error('Error connecting to the database:', err);
        throw err;
    }
}

export { pool, getConnection };