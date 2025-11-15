/**
 * Migration: Add Snowy2526 discount code
 * Date: 2025-11-15
 * Description: Add Snowy2526 discount code (5% off, valid from 2025-11-15 to 2026-05-31)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const migrations = [
  {
    query: `INSERT OR IGNORE INTO discount_codes
            (code, name, discount_type, discount_value, active, valid_from, valid_until, usage_limit, used_count)
            VALUES ('Snowy2526', 'Snowy 合作優惠 2025-2026', 'percentage', 5, 1, '2025-11-15', '2026-05-31', NULL, 0)`,
    description: 'Add Snowy2526 (5% off)'
  }
];

function runMigration() {
  const dbPath = path.join(__dirname, '..', 'data', 'snow_reservation.db');
  const db = new sqlite3.Database(dbPath);

  console.log('Running migration: Add Snowy2526 discount code');

  db.serialize(() => {
    migrations.forEach((migration, index) => {
      console.log(`\nStep ${index + 1}: ${migration.description}`);

      db.run(migration.query, function(err) {
        if (err) {
          console.error(`❌ Failed: ${err.message}`);
        } else {
          console.log(`✅ Success: ${this.changes} row(s) updated`);
        }
      });
    });
  });

  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('\nMigration completed successfully!');
    }
  });
}

// Run the migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
