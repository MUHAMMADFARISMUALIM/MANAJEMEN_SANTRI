const mysql = require('mysql2');
require('dotenv').config();

// Buat connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'manajemen_asrama',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // PENTING: Paksa MySQL2 kembalikan DATE column sebagai string YYYY-MM-DD
    // bukan sebagai JavaScript Date object, supaya format tanggal konsisten
    dateStrings: true
});

// Export promise-based pool
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        return;
    }
    console.log('✓ Database connected successfully');
    connection.release();
});

module.exports = promisePool;
