import * as mariadb from 'mariadb';

const pool = mariadb.createPool({
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