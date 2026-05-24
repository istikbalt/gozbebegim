const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  console.log("AWS RDS MySQL Sunucusuna Bağlanılıyor:", process.env.DB_HOST);
  
  // İlk önce veritabanı ismi belirtmeden bağlanıyoruz ki database yoksa oluşturabilelim
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 3306),
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("gozbebegim veritabanı şeması oluşturuluyor (yoksa)...");
    await connection.query("CREATE DATABASE IF NOT EXISTS `gozbebegim` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    await connection.query("USE `gozbebegim`;");
    console.log("Veritabanı seçildi.");

    console.log("Geliştirme aşaması: Eski tablolar temizleniyor...");
    await connection.query("DROP TABLE IF EXISTS `general_messages`;");
    await connection.query("DROP TABLE IF EXISTS `gift_comments`;");
    await connection.query("DROP TABLE IF EXISTS `gifts`;");
    await connection.query("DROP TABLE IF EXISTS `organizations`;");
    await connection.query("DROP TABLE IF EXISTS `children`;");
    await connection.query("DROP TABLE IF EXISTS `users`;");
    console.log("Temizlik tamamlandı. Yeni tablolar kuruluyor...");

    // schema.sql dosyasını oku
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Önce tüm SQL yorum satırlarını (tüm satırı veya satır sonlarını) temizliyoruz
    schemaSql = schemaSql.replace(/--.*$/gm, '');

    // SQL dosyası içerisindeki komutları noktalı virgüle göre ayırıyoruz
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.toLowerCase().startsWith('use'));

    console.log(`Toplam ${statements.length} SQL sorgusu çalıştırılacak.`);

    for (let i = 0; i < statements.length; i++) {
      let statement = statements[i];
      statement = statement.replace(/--.*$/gm, '').trim();
      if (statement.length === 0) continue;

      const logSnippet = statement.split('\n')[0].substring(0, 50);
      console.log(`Sorgu ${i + 1} çalıştırılıyor: "${logSnippet}..."`);
      await connection.query(statement);
    }

    console.log("🎉 Tebrikler! Tüm tablolar başarıyla oluşturuldu ve veritabanı migrasyonu tamamlandı.");
  } catch (error) {
    console.error("❌ Veritabanı kurulumu başarısız oldu:", error);
  } finally {
    await connection.end();
  }
}

main();
