import { config } from 'dotenv';
config({ path: '.env.local' });
import { sql } from '@vercel/postgres';

async function main() {
  try {
    console.log('Creating tables...');

    // 1. Workshops Table
    await sql`
      CREATE TABLE IF NOT EXISTS workshops (
        id VARCHAR(255) PRIMARY KEY,
        status VARCHAR(50) NOT NULL,
        current_question TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Created "workshops" table');

    // 2. Participants Table
    await sql`
      CREATE TABLE IF NOT EXISTS participants (
        id VARCHAR(255) PRIMARY KEY,
        workshop_id VARCHAR(255) REFERENCES workshops(id),
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50),
        stance_energy INTEGER,
        stance_mode VARCHAR(50),
        stance_openness INTEGER,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Created "participants" table');

    // 3. Responses Table
    await sql`
      CREATE TABLE IF NOT EXISTS responses (
        id VARCHAR(255) PRIMARY KEY,
        workshop_id VARCHAR(255) REFERENCES workshops(id),
        participant_id VARCHAR(255) REFERENCES participants(id),
        participant_name VARCHAR(255),
        participant_role VARCHAR(50),
        answer TEXT,
        as_is_fact TEXT,
        as_is_score INTEGER,
        to_be_will TEXT,
        to_be_score INTEGER,
        solution_action TEXT,
        solution_tags TEXT[], 
        gap_interpretation TEXT,
        gap_tags TEXT[],
        hero_hope INTEGER,
        hero_efficacy INTEGER,
        hero_resilience INTEGER,
        hero_optimism INTEGER,
        vulnerability_honesty INTEGER,
        vulnerability_resistance INTEGER,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Created "responses" table');

    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

main();
