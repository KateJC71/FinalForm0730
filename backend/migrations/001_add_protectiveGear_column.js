const sqlite3 = require('sqlite3');
const path = require('path');

async function runMigration() {
  const dbPath = path.join(__dirname, '../data/reservations.db');
  const db = new sqlite3.Database(dbPath);

  return new Promise((resolve, reject) => {
    // Add protectiveGear column to reservation_persons table
    db.run(`
      ALTER TABLE reservation_persons
      ADD COLUMN protectiveGear TEXT DEFAULT '否'
    `, (err) => {
      if (err) {
        // Column might already exist
        if (err.message.includes('duplicate column name')) {
          console.log('✅ protectiveGear column already exists');
          db.close();
          resolve();
        } else {
          console.error('❌ Failed to add protectiveGear column:', err);
          db.close();
          reject(err);
        }
      } else {
        console.log('✅ Added protectiveGear column to reservation_persons table');
        db.close();
        resolve();
      }
    });
  });
}

module.exports = { runMigration };
