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

  try {
    await pool.query("ALTER TABLE `users` ADD COLUMN `email` VARCHAR(255) DEFAULT NULL UNIQUE");
    console.log("Database updated: added 'email' column to 'users' table.");
  } catch (err) {
    // Sütun veya kısıt zaten varsa hata yoksayılır
  }

  try {
    await pool.query("ALTER TABLE `users` MODIFY COLUMN `phone_number` VARCHAR(15) DEFAULT NULL");
    console.log("Database updated: modified 'phone_number' to be nullable in 'users' table.");
  } catch (err) {
    // Hata yoksayılır
  }

  try {
    await pool.query("ALTER TABLE `gifts` ADD COLUMN `buyer_user_id` INT DEFAULT NULL");
    console.log("Database updated: added 'buyer_user_id' column to 'gifts' table.");
  } catch (err) {
    // Hata yoksayılır
  }

  try {
    await pool.query("ALTER TABLE `gifts` ADD FOREIGN KEY (`buyer_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL");
    console.log("Database updated: added foreign key for 'buyer_user_id' in 'gifts' table.");
  } catch (err) {
    // Hata yoksayılır
  }

  try {
    await pool.query("ALTER TABLE `users` ADD COLUMN `reset_code` VARCHAR(10) DEFAULT NULL");
    console.log("Database updated: added 'reset_code' column to 'users' table.");
  } catch (err) {
    // Hata yoksayılır
  }

  try {
    await pool.query("ALTER TABLE `users` ADD COLUMN `reset_expires` TIMESTAMP DEFAULT NULL");
    console.log("Database updated: added 'reset_expires' column to 'users' table.");
  } catch (err) {
    // Hata yoksayılır
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`contact_messages\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`subject\` VARCHAR(255) DEFAULT NULL,
        \`message\` TEXT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("Database updated: created 'contact_messages' table if not exists.");
  } catch (err) {
    // Hata yoksayılır
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`processed_emails\` (
        \`message_key\` VARCHAR(255) PRIMARY KEY,
        \`processed_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("Database updated: created 'processed_emails' table if not exists.");
  } catch (err) {
    // Hata yoksayılır
  }
})();

module.exports = pool;

