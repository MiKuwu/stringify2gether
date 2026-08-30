const { Client } = require("pg");

const OLD_URL = "postgresql://neondb_owner:npg_YL7swMAf0KjV@ep-small-hill-aw1t8127.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require"; // Neon US East
const NEW_URL = "postgresql://neondb_owner:npg_AUl7J3EOaweb@ep-royal-grass-b300m73r.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"; // Neon Singapore (Direct)

// Ordered by dependency
const tables = [
  "User",
  "Account",
  "Session",
  "VerificationToken",
  "Follows",
  "Category",
  "SiteSettings",
  "Post",
  "Media",
  "Suggestion",
  "Comment",
  "CommentVote",
  "Like",
  "SavedPost",
  "Report",
  "Notification",
  "MutedPost",
  "AdminLog",
  "Poll",
  "PollOption",
  "PollVote",
  "Appeal",
  "AppealVote"
];

async function migrate() {
  const oldClient = new Client({ connectionString: OLD_URL });
  const newClient = new Client({ connectionString: NEW_URL });

  await oldClient.connect();
  await newClient.connect();

  console.log("Connected to both databases.");

  try {
    for (const table of tables) {
      console.log(`Migrating table: ${table}`);
      const { rows } = await oldClient.query(`SELECT * FROM "${table}"`);
      if (rows.length === 0) {
        console.log(`No rows in ${table}. Skipping.`);
        continue;
      }

      console.log(`Found ${rows.length} rows in ${table}. Inserting...`);
      
      const columns = Object.keys(rows[0]).map(c => `"${c}"`).join(", ");
      
      for (const row of rows) {
        const values = Object.values(row);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
        const query = `INSERT INTO "${table}" (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
        await newClient.query(query, values);
      }
      console.log(`Successfully migrated ${table}.`);
    }
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await oldClient.end();
    await newClient.end();
    console.log("Done.");
  }
}

migrate();