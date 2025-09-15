import { Database } from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';

export function runMigrations(dbPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = new Database(dbPath);
    
    // Create migrations tracking table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Failed to create migrations table:', err);
        db.close();
        return reject(err);
      }
      
      // Get list of migration files
      const migrationsDir = path.join(__dirname, '../../migrations');
      
      // Create migrations directory if it doesn't exist
      if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
      }
      
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.js'))
        .sort(); // Sort to ensure migrations run in order
      
      // Check which migrations have been run
      db.all('SELECT filename FROM migrations', async (err, rows: any[]) => {
        if (err) {
          console.error('Failed to query migrations table:', err);
          db.close();
          return reject(err);
        }
        
        const executedMigrations = new Set(rows.map(row => row.filename));
        const pendingMigrations = migrationFiles.filter(file => !executedMigrations.has(file));
        
        if (pendingMigrations.length === 0) {
          console.log('✅ No pending migrations');
          db.close();
          return resolve();
        }
        
        console.log(`📦 Found ${pendingMigrations.length} pending migration(s)`);
        
        // Run pending migrations
        for (const migrationFile of pendingMigrations) {
          console.log(`🔄 Running migration: ${migrationFile}`);
          
          try {
            // Import and run the migration
            const migrationPath = path.join(migrationsDir, migrationFile);
            const migration = require(migrationPath);
            
            if (migration.runMigration) {
              await migration.runMigration();
            }
            
            // Record that this migration has been run
            await new Promise<void>((recordResolve, recordReject) => {
              db.run(
                'INSERT INTO migrations (filename) VALUES (?)',
                [migrationFile],
                (err) => {
                  if (err) {
                    console.error(`Failed to record migration ${migrationFile}:`, err);
                    recordReject(err);
                  } else {
                    console.log(`✅ Migration ${migrationFile} completed`);
                    recordResolve();
                  }
                }
              );
            });
            
          } catch (error) {
            console.error(`Failed to run migration ${migrationFile}:`, error);
            db.close();
            return reject(error);
          }
        }
        
        console.log('✅ All migrations completed successfully');
        db.close();
        resolve();
      });
    });
  });
}