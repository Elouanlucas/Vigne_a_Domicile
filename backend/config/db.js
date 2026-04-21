const mysql = require('mysql2');

const pool = mysql.createPool({
    // Il va chercher dans le .env, sinon il prend la valeur par défaut
    host: process.env.DB_HOST || 'e4a-db', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'e4a_db',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool.promise();