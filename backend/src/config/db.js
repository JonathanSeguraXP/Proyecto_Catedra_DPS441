const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.DB_HOST || 'localhost',
    user: process.DB_USER || 'root',
    password: process.DB_PASSWORD || '',
    database: process.DB_NAME || 'cafeteria_inventory',
    port: process.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4'
});

module.exports = pool;
