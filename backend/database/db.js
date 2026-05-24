const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false }
});

// Otomatik şema güncellemesi (AWS RDS uyumlu)
(async () => {
  try {
    await pool.query("ALTER TABLE `gifts` ADD COLUMN `gift_photo` LONGTEXT DEFAULT NULL");
    console.log("Database updated: added 'gift_photo' column to 'gifts' table.");
  } catch (err) {
    // Sütun zaten varsa hata yoksayılır
  }

  try {
    await pool.query("ALTER TABLE `gifts` ADD COLUMN `gift_link` TEXT DEFAULT NULL");
    console.log("Database updated: added 'gift_link' column to 'gifts' table.");
  } catch (err) {
    // Sütun zaten varsa hata yoksayılır
  }
})();

module.exports = pool;

