const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function main() {
  console.log("Bağlanılıyor:", process.env.DB_HOST);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'gozbebegim',
    port: Number(process.env.DB_PORT || 3306),
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Bağlantı başarılı. IBAN kolonları kontrol ediliyor...");

    const [rows] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'organizations' AND COLUMN_NAME = 'iban'`,
      [process.env.DB_NAME || 'gozbebegim']
    );

    if (rows.length === 0) {
      console.log("organizations tablosuna 'iban' ve 'iban_name' ekleniyor...");
      await connection.query("ALTER TABLE `organizations` ADD COLUMN `iban` VARCHAR(50) DEFAULT NULL");
      await connection.query("ALTER TABLE `organizations` ADD COLUMN `iban_name` VARCHAR(255) DEFAULT NULL");
      console.log("Kolonlar başarıyla eklendi! 🎉");
    } else {
      console.log("IBAN kolonları zaten mevcut.");
    }
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await connection.end();
  }
}

main();
