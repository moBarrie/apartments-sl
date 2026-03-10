#!/usr/bin/env node

require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Database URL should be in format:
// postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("\n❌ Missing DATABASE_URL in .env.local");
  console.log("\n📝 To get your database URL:");
  console.log(
    "1. Go to: https://asauyvnlonlzgrdkxynl.supabase.co/project/default/settings/database",
  );
  console.log('2. Copy the "Connection string" (URI format)');
  console.log("3. Add to .env.local: DATABASE_URL=postgresql://...\n");
  process.exit(1);
}

async function runMigrations() {
  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    console.log("🔌 Connecting to database...");
    await client.connect();
    console.log("✅ Connected!\n");

    const files = [
      "supabase/001_schema.sql",
      "supabase/002_rls_policies.sql",
      "supabase/003_seed_amenities.sql",
    ];

    for (const file of files) {
      console.log(`📄 Running ${file}...`);
      const sql = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
      await client.query(sql);
      console.log(`✅ ${file} completed\n`);
    }

    console.log("🎉 All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
