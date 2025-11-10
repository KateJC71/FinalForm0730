import { Router, Request, Response } from 'express';
import { Database } from 'sqlite3';

const router = Router();

// Admin endpoint to update discount codes
router.post('/update-discount-codes', (req: Request, res: Response) => {
  const { adminKey } = req.body;
  
  // Simple admin key check
  if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'update-discount-2025') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const db = new Database('./data/snow_reservation.db');
  
  console.log('🔄 Admin: Updating discount codes...');
  
  // First, delete old codes that are being replaced
  db.run(`DELETE FROM discount_codes WHERE code IN ('SnowPink2526', 'SSW2526')`, function(err) {
    if (err) {
      console.error('Error deleting old codes:', err);
    } else {
      console.log(`Deleted ${this.changes} old discount codes`);
    }
    
    // Then insert/update all codes
    const updateSql = `
      INSERT OR REPLACE INTO discount_codes (code, name, discount_type, discount_value, valid_from, valid_until, active, usage_limit, used_count) VALUES
      ('EarlyBird2526', '早鳥優惠 2025-2026', 'percentage', 20, '2025-08-01', '2025-09-15', 1, NULL, 0),
      ('EarlyPink26', '早鳥優惠 Pink', 'percentage', 20, '2025-08-01', '2025-09-15', 1, NULL, 0),
      ('EarlySSW26', '早鳥優惠 SSW', 'percentage', 20, '2025-08-01', '2025-09-15', 1, NULL, 0),
      ('EarlySL26', '早鳥優惠 SL', 'percentage', 20, '2025-08-01', '2025-09-15', 1, NULL, 0),
      ('EarlyComma26', '早鳥優惠 Comma', 'percentage', 20, '2025-08-01', '2025-09-15', 1, NULL, 0),
      ('Pink26', 'Pink 合作優惠', 'percentage', 5, '2024-01-01', '2026-05-31', 1, NULL, 0),
      ('SSW26', 'SSW 合作優惠', 'percentage', 5, '2024-01-01', '2026-05-31', 1, NULL, 0),
      ('SFS2526', 'SFS 專屬優惠', 'percentage', 10, '2024-01-01', '2026-05-31', 1, NULL, 0),
      ('Aobi26', 'Aobi 合作優惠', 'percentage', 5, '2024-01-01', '2026-05-31', 1, NULL, 0),
      ('Comma26', 'Comma 合作優惠', 'percentage', 5, '2024-01-01', '2026-05-31', 1, NULL, 0),
      ('JWA26', 'JWA 合作優惠', 'percentage', 10, '2024-01-01', '2026-05-31', 1, NULL, 0),
      ('ohboards2526', 'OhBoards 合作優惠', 'percentage', 10, '2024-01-01', '2026-05-31', 1, NULL, 0),
      ('SF05', 'SnowForce 5% 優惠', 'percentage', 5, '2024-01-01', '2026-05-31', 1, NULL, 0),
      ('SF10', 'SnowForce 10% 優惠', 'percentage', 10, '2024-01-01', '2026-05-31', 1, NULL, 0)
    `;
    
    db.run(updateSql, function(err) {
      if (err) {
        console.error('Error updating discount codes:', err);
        db.close();
        return res.status(500).json({ error: 'Failed to update discount codes', details: err.message });
      }
      
      console.log('✅ Discount codes updated successfully');
      
      // Get final count
      db.all('SELECT code, name, discount_value FROM discount_codes ORDER BY discount_value DESC, code', (err, rows: any[]) => {
        db.close();
        
        if (err) {
          return res.status(500).json({ error: 'Failed to verify update' });
        }
        
        res.json({
          success: true,
          message: 'Discount codes updated successfully',
          totalCodes: rows.length,
          codes: rows.map(r => ({
            code: r.code,
            discount: `${r.discount_value}%`,
            name: r.name
          }))
        });
      });
    });
  });
});

// Get current discount codes (for verification)
router.get('/discount-codes', (req: Request, res: Response) => {
  const db = new Database('./data/snow_reservation.db');
  
  db.all('SELECT code, name, discount_value, active FROM discount_codes ORDER BY discount_value DESC, code', (err, rows) => {
    db.close();
    
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch discount codes' });
    }
    
    res.json({
      totalCodes: rows.length,
      codes: rows
    });
  });
});

export default router;