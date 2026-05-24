require("dotenv").config();
const pool = require("./database/db");

async function main() {
  try {
    const [children] = await pool.query("SELECT * FROM children");
    const [orgs] = await pool.query("SELECT * FROM organizations");
    console.log("--- CHILDREN ---");
    console.log(children);
    console.log("--- ORGANIZATIONS ---");
    console.log(orgs);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

main();
