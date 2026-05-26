const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function main() {
  console.log("AWS RDS MySQL Sunucusuna Bağlanılıyor:", process.env.DB_HOST);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'gozbebegim',
    port: Number(process.env.DB_PORT || 3306),
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Bağlantı başarılı. Kolonlar kontrol ediliyor...");

    // Helper: Kolon var mı kontrol et
    async function columnExists(table, column) {
      const [rows] = await connection.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [process.env.DB_NAME || 'gozbebegim', table, column]
      );
      return rows.length > 0;
    }

    // 1. `organizations` tablosu güncellemeleri
    console.log("--- organizations Tablosu Güncelleniyor ---");
    const orgCols = {
      'surprise_mode': "BOOLEAN DEFAULT FALSE",
      'hospital_name': "VARCHAR(255) DEFAULT NULL",
      'hospital_room': "VARCHAR(50) DEFAULT NULL",
      'visit_hours': "VARCHAR(100) DEFAULT NULL",
      'maps_link': "VARCHAR(500) DEFAULT NULL",
      'flower_link': "VARCHAR(500) DEFAULT NULL"
    };

    for (const [col, definition] of Object.entries(orgCols)) {
      if (!(await columnExists('organizations', col))) {
        console.log(`organizations tablosuna ${col} kolonu ekleniyor...`);
        await connection.query(`ALTER TABLE \`organizations\` ADD COLUMN \`${col}\` ${definition}`);
      } else {
        console.log(`organizations tablosunda ${col} kolonu zaten mevcut.`);
      }
    }

    // 2. `general_messages` tablosu güncellemeleri
    console.log("--- general_messages Tablosu Güncelleniyor ---");
    const msgCols = {
      'is_time_capsule': "BOOLEAN DEFAULT FALSE",
      'unlock_date': "DATE DEFAULT NULL",
      'media_url': "VARCHAR(500) DEFAULT NULL",
      'media_type': "ENUM('Text', 'Video', 'Image', 'Audio') DEFAULT 'Text'"
    };

    for (const [col, definition] of Object.entries(msgCols)) {
      if (!(await columnExists('general_messages', col))) {
        console.log(`general_messages tablosuna ${col} kolonu ekleniyor...`);
        await connection.query(`ALTER TABLE \`general_messages\` ADD COLUMN \`${col}\` ${definition}`);
      } else {
        console.log(`general_messages tablosunda ${col} kolonu zaten mevcut.`);
      }
    }

    // 3. Yeni Tabloların Oluşturulması
    console.log("--- Yeni Tablolar Kuruluyor ---");

    // family_circles
    console.log("family_circles tablosu kuruluyor...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`family_circles\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`creator_id\` INT NOT NULL,
        \`invite_code\` VARCHAR(20) UNIQUE NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`creator_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // circle_members
    console.log("circle_members tablosu kuruluyor...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`circle_members\` (
        \`circle_id\` INT NOT NULL,
        \`user_id\` INT NOT NULL,
        \`role\` ENUM('Admin', 'Member') DEFAULT 'Member',
        \`joined_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`circle_id\`, \`user_id\`),
        FOREIGN KEY (\`circle_id\`) REFERENCES \`family_circles\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // gold_and_cash_gifts
    console.log("gold_and_cash_gifts tablosu kuruluyor...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`gold_and_cash_gifts\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`org_id\` INT NOT NULL,
        \`buyer_name\` VARCHAR(255) NOT NULL,
        \`buyer_phone\` VARCHAR(15) NOT NULL,
        \`gift_type\` ENUM('Ceyrek Altin', 'Gram Altin', 'Nakit Para') NOT NULL,
        \`amount\` DECIMAL(10,2) DEFAULT NULL,
        \`status\` ENUM('Pending', 'Confirmed') DEFAULT 'Pending',
        \`is_anonymous\` BOOLEAN DEFAULT FALSE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`org_id\`) REFERENCES \`organizations\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("🎉 Tebrikler! Tüm premium veritabanı geçişleri başarıyla tamamlandı.");
  } catch (error) {
    console.error("❌ Veritabanı geçişi başarısız oldu:", error);
  } finally {
    await connection.end();
  }
}

main();
