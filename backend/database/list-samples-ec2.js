require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const pool = require('./db');

async function main() {
  try {
    const [rows] = await pool.query(`
      SELECT u.first_name, u.last_name, u.email,
             c.name AS child_name, c.gender AS child_gender, c.age AS child_age,
             o.type AS event_type, o.title AS event_title, o.slug AS org_slug, o.parent_slug
      FROM users u
      JOIN children c ON u.id = c.parent_id
      JOIN organizations o ON c.id = o.child_id
      LIMIT 15
    `);
    
    console.log("=== ACTUAL SEEDED ACTIVE SAMPLE ACCOUNTS ===");
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      console.log(`${i + 1}. Parent: ${row.first_name} ${row.last_name}`);
      console.log(`   Email: ${row.email}`);
      console.log(`   Password: password123`);
      console.log(`   Child: ${row.child_name} (${row.child_gender}, ${row.child_age} Yaş)`);
      console.log(`   Event: ${row.event_type} (${row.event_title})`);
      console.log(`   Registry Link: /${row.parent_slug}/${row.org_slug}`);
      console.log("-----------------------------------------");
    }
  } catch (error) {
    console.error("Query failed:", error);
  } finally {
    process.exit(0);
  }
}

main();
