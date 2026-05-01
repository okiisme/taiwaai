const { sql } = require("@vercel/postgres");
require("dotenv").config({ path: ".env.local" });

async function main() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS response_analyses (
        id VARCHAR(255) PRIMARY KEY,
        response_id VARCHAR(255) NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
        analysis_result JSONB NOT NULL,
        model_name VARCHAR(255) NOT NULL,
        analyzed_at TIMESTAMP NOT NULL,
        version VARCHAR(50) NOT NULL
      );
    `;
    console.log("Table response_analyses created or already exists.");
  } catch (error) {
    console.error("Error creating table:", error);
  }
}

main();
