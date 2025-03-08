const mysql = require('mysql2/promise'); // Gunakan versi promise dari MySQL
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Cek koneksi ke database
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully!');
    connection.release(); // Lepaskan koneksi setelah pengecekan
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
})();

module.exports = pool;
