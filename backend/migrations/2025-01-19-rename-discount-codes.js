/**
 * Migration: Rename discount codes
 * Date: 2025-01-19
 * Description: Update JAW26 to JWA26 and Yeti26 to Aobi26
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const migrations = [
  {
    query: `UPDATE discount_codes SET
            code = 'JWA26',
            name = 'JWA 合作優惠'
            WHERE code = 'JAW26'`,
    description: 'Update JAW26 to JWA26'
  },
  {
    query: `UPDATE discount_codes SET
            code = 'Aobi26',
            name = 'Aobi 合作優惠'
            WHERE code = 'Yeti26'`,
    description: 'Update Yeti26 to Aobi26'
  }
];

function runMigration() {
  const dbPath = path.join(__dirname, '..', 'data', 'snow_reservation.db');
  const db = new sqlite3.Database(dbPath);

  console.log('Running migration: Rename discount codes');

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