/**
 * Migration: Add new discount codes
 * Date: 2025-11-10
 * Description: Add ohboards2526, SF05, and SF10 discount codes
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const migrations = [
  {
    query: `INSERT OR IGNORE INTO discount_codes
            (code, name, discount_type, discount_value, active, valid_from, valid_until, usage_limit, used_count)
            VALUES ('ohboards2526', 'OhBoards 合作優惠', 'percentage', 10, 1, '2024-01-01', '2026-05-31', NULL, 0)`,
    description: 'Add ohboards2526 (10% off)'
  },
  {
    query: `INSERT OR IGNORE INTO discount_codes
            (code, name, discount_type, discount_value, active, valid_from, valid_until, usage_limit, used_count)
            VALUES ('SF05', 'SnowForce 5% 優惠', 'percentage', 5, 1, '2024-01-01', '2026-05-31', NULL, 0)`,
    description: 'Add SF05 (5% off)'
  },
  {
    query: `INSERT OR IGNORE INTO discount_codes
            (code, name, discount_type, discount_value, active, valid_from, valid_until, usage_limit, used_count)
            VALUES ('SF10', 'SnowForce 10% 優惠', 'percentage', 10, 1, '2024-01-01', '2026-05-31', NULL, 0)`,
    description: 'Add SF10 (10% off)'
  }
];

function runMigration() {
  const dbPath = path.join(__dirname, '..', 'data', 'snow_reservation.db');
  const db = new sqlite3.Database(dbPath);

  console.log('Running migration: Add new discount codes');

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
