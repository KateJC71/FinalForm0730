/**
 * Migration: Add Mako26 discount code
 * Date: 2026-01-25
 * Description: Add Mako26 discount code (10% off, valid from 2024-01-01 to 2026-05-31)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const migrations = [
  {
    query: `INSERT OR IGNORE INTO discount_codes
            (code, name, discount_type, discount_value, active, valid_from, valid_until, usage_limit, used_count)
            VALUES ('Mako26', 'Mako 合作優惠', 'percentage', 10, 1, '2024-01-01', '2026-05-31', NULL, 0)`,
    description: 'Add Mako26 (10% off)'
  }
];

function runMigration() {
  const dbPath = path.join(__dirname, '..', 'data', 'snow_reservation.db');
  const db = new sqlite3.Database(dbPath);

  console.log('Running migration: Add Mako26 discount code');

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
