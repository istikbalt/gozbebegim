/**
 * Migration Script to enhance gift_comments table with:
 * - parent_id: supports nested replies to specific comments
 * - likes: stores count of Heart (❤️) reactions
 * - laughs: stores count of Laugh (😂) reactions
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const pool = require('./db');

async function migrate() {
  console.log("🚀 Starting gift_comments table migration...");
  const conn = await pool.getConnection();

  try {
    // 1. Add parent_id column
    try {
      await conn.query("ALTER TABLE `gift_comments` ADD COLUMN `parent_id` INT DEFAULT NULL");
      console.log("✓ Added 'parent_id' column to 'gift_comments' table.");
    } catch (err) {
      console.log("ℹ 'parent_id' column already exists or failed to add.");
    }

    // 2. Add likes column
    try {
      await conn.query("ALTER TABLE `gift_comments` ADD COLUMN `likes` INT DEFAULT 0");
      console.log("✓ Added 'likes' column to 'gift_comments' table.");
    } catch (err) {
      console.log("ℹ 'likes' column already exists or failed to add.");
    }

    // 3. Add laughs column
    try {
      await conn.query("ALTER TABLE `gift_comments` ADD COLUMN `laughs` INT DEFAULT 0");
      console.log("✓ Added 'laughs' column to 'gift_comments' table.");
    } catch (err) {
      console.log("ℹ 'laughs' column already exists or failed to add.");
    }

    // 4. Add foreign key for parent_id
    try {
      await conn.query("ALTER TABLE `gift_comments` ADD FOREIGN KEY (`parent_id`) REFERENCES `gift_comments`(`id`) ON DELETE CASCADE");
      console.log("✓ Added foreign key constraint for 'parent_id' in 'gift_comments' table.");
    } catch (err) {
      console.log("ℹ Foreign key constraint for 'parent_id' already exists or failed to add.");
    }

    console.log("✨ Migration completed successfully!");

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    conn.release();
    pool.end();
  }
}

migrate();
