/**
 * Migration: Update discount codes
 * Date: 2025-01-15
 * 
 * Changes:
 * - Update SnowPink2526 to Pink26 (keep 5% discount)
 * - Update SSW2526 to SSW26 (keep 5% discount)  
 * - Add Yeti26 (5% discount)
 * - Add Comma26 (5% discount)
 * - Add JAW26 (10% discount)
 */

const Database = require('sqlite3').Database;
const path = require('path');

function runMigration() {
  const dbPath = path.join(__dirname, '../data/snow_reservation.db');
  const db = new Database(dbPath);
  
  console.log('Running discount code migration...\n');
  
  const operations = [
    // Update existing codes
    {
      sql: "UPDATE discount_codes SET code = 'Pink26', name = 'Pink 合作優惠' WHERE code = 'SnowPink2526'",
      description: 'Update SnowPink2526 to Pink26'
    },
    {
      sql: "UPDATE discount_codes SET code = 'SSW26', name = 'SSW 合作優惠' WHERE code = 'SSW2526'",
      description: 'Update SSW2526 to SSW26'
    },
    
    // Add new codes
    {
      sql: `INSERT OR IGNORE INTO discount_codes 
            (code, name, discount_type, discount_value, active, valid_from, valid_until, usage_limit, used_count)
            VALUES ('Yeti26', 'Yeti 合作優惠', 'percentage', 5, 1, '2024-01-01', '2026-05-31', NULL, 0)`,
      description: 'Add Yeti26 (5% off)'
    },
    {
      sql: `INSERT OR IGNORE INTO discount_codes 
            (code, name, discount_type, discount_value, active, valid_from, valid_until, usage_limit, used_count)
            VALUES ('Comma26', 'Comma 合作優惠', 'percentage', 5, 1, '2024-01-01', '2026-05-31', NULL, 0)`,
      description: 'Add Comma26 (5% off)'
    },
    {
      sql: `INSERT OR IGNORE INTO discount_codes 
            (code, name, discount_type, discount_value, active, valid_from, valid_until, usage_limit, used_count)
            VALUES ('JAW26', 'JAW 合作優惠', 'percentage', 10, 1, '2024-01-01', '2026-05-31', NULL, 0)`,
      description: 'Add JAW26 (10% off)'
    }
  ];
  
  let completed = 0;
  let errors = 0;
  
  function runNext(index) {
    if (index >= operations.length) {
      console.log('\n✅ Migration completed!');
      console.log(`   ${completed} operations successful`);
      if (errors > 0) {
        console.log(`   ${errors} operations failed`);
      }
      
      // Show final state
      db.all('SELECT code, name, discount_value FROM discount_codes ORDER BY discount_value DESC, code', 
        (err, rows) => {
          if (!err) {
            console.log('\nCurrent discount codes:');
            rows.forEach(row => {
              console.log(`  - ${row.code}: ${row.discount_value}% off (${row.name})`);
            });
          }
          db.close();
        }
      );
      return;
    }
    
    const op = operations[index];
    console.log(`Running: ${op.description}...`);
    
    db.run(op.sql, function(err) {
      if (err) {
        console.error(`  ❌ Error: ${err.message}`);
        errors++;
      } else {
        console.log(`  ✅ Success`);
        completed++;
      }
      runNext(index + 1);
    });
  }
  
  runNext(0);
}

// Run the migration
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };