// db.js
import sql from 'mssql';

// -----------------------------
// CONFIG
// -----------------------------
const serverConfig = {
  user: 'sa',
  password: '@#Ikusasa2025',
  server: '173.249.32.152',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// Your application database name
const DB_NAME = 'GalleryDB';

// -----------------------------
// INIT DATABASE (create if missing)
// -----------------------------
async function initDatabase() {
  console.log("🔍 Checking database...");

  const masterConfig = {
    ...serverConfig,
    database: 'master'
  };

  try {
    const pool = await sql.connect(masterConfig);

    await pool.request().query(`
      IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '${DB_NAME}')
      BEGIN
        PRINT 'Creating database ${DB_NAME}...';
        CREATE DATABASE ${DB_NAME};
      END
    `);

    console.log(`✅ Database '${DB_NAME}' is ready.`);

    await pool.close();
  } catch (err) {
    console.error("❌ DB INIT ERROR:", err);
  }
}

// -----------------------------
// INIT TABLES (OPTIONAL)
// -----------------------------
async function initTables() {
  console.log("🔍 Checking tables...");

  const dbConfig = {
    ...serverConfig,
    database: DB_NAME
  };

  try {
    const pool = await sql.connect(dbConfig);

    // Create Users table if missing
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
      CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100)
      );
    `);

    console.log("✅ Tables are ready.");

    await pool.close();
  } catch (err) {
    console.error("❌ TABLE INIT ERROR:", err);
  }
}

// -----------------------------
// CONNECT FUNCTION (used in routes)
// -----------------------------
async function getPool() {
  const dbConfig = {
    ...serverConfig,
    database: DB_NAME
  };

  return await sql.connect(dbConfig);
}

// -----------------------------
// EXPORTS
// -----------------------------
export { sql, getPool, initDatabase, initTables };
