const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/snow_reservation.db');

console.log('📝 更新折扣碼有效期限...\n');

const updates = [
  {
    code: 'EarlyBird2526',
    valid_until: '2025-08-31',
    name: '早鳥優惠 2025-2026'
  },
  {
    code: 'SnowPink2526',
    valid_until: '2026-05-31',
    name: 'Snow Pink 合作優惠'
  },
  {
    code: 'SSW2526',
    valid_until: '2026-05-31',
    name: 'SSW 合作優惠'
  },
  {
    code: 'SFS2526',
    valid_until: '2026-05-31',
    name: 'SFS 專屬優惠'
  }
];

let completed = 0;

updates.forEach(update => {
  db.run(
    'UPDATE discount_codes SET valid_until = ? WHERE code = ?',
    [update.valid_until, update.code],
    function(err) {
      if (err) {
        console.error(`❌ 更新 ${update.code} 失敗:`, err);
      } else if (this.changes > 0) {
        console.log(`✅ ${update.code} (${update.name}) - 有效期限更新至 ${update.valid_until}`);
      } else {
        console.log(`⚠️  ${update.code} - 找不到此折扣碼`);
      }
      
      completed++;
      if (completed === updates.length) {
        console.log('\n📋 驗證更新結果...\n');
        
        db.all(`SELECT code, name, discount_value, valid_from, valid_until FROM discount_codes ORDER BY code`, [], (err, rows) => {
          if (err) {
            console.error('查詢錯誤:', err);
          } else {
            rows.forEach(row => {
              console.log(`${row.code}:`);
              console.log(`  名稱: ${row.name}`);
              console.log(`  折扣: ${row.discount_value}%`);
              console.log(`  有效期: ${row.valid_from} 至 ${row.valid_until}`);
              console.log('---');
            });
          }
          db.close();
        });
      }
    }
  );
});