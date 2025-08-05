const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data/snow_reservation.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 更新折扣碼...');

db.serialize(() => {
  // 更新 EarlyBird2526 的有效期限
  db.run(`
    UPDATE discount_codes 
    SET valid_from = '2025-08-01', valid_until = '2025-09-15'
    WHERE code = 'EarlyBird2526'
  `, (err) => {
    if (err) {
      console.error('❌ 更新 EarlyBird2526 失敗:', err);
    } else {
      console.log('✅ 更新 EarlyBird2526 成功');
    }
  });

  // 插入新的早鳥優惠折扣碼
  const newCodes = [
    ['EarlyPink26', '早鳥優惠 Pink'],
    ['EarlySSW26', '早鳥優惠 SSW'],
    ['EarlySL26', '早鳥優惠 SL'],
    ['EarlyComma26', '早鳥優惠 Comma']
  ];

  newCodes.forEach(([code, name]) => {
    db.run(`
      INSERT OR IGNORE INTO discount_codes (code, name, discount_type, discount_value, valid_from, valid_until, active) 
      VALUES (?, ?, 'percentage', 20, '2025-08-01', '2025-09-15', 1)
    `, [code, name], (err) => {
      if (err) {
        console.error(`❌ 插入 ${code} 失敗:`, err);
      } else {
        console.log(`✅ 插入 ${code} 成功`);
      }
    });
  });

  // 查詢並顯示所有折扣碼
  setTimeout(() => {
    db.all('SELECT * FROM discount_codes ORDER BY code', [], (err, rows) => {
      if (err) {
        console.error('❌ 查詢折扣碼失敗:', err);
      } else {
        console.log('\n📋 所有折扣碼:');
        rows.forEach(row => {
          console.log(`- ${row.code}: ${row.discount_value}${row.discount_type === 'percentage' ? '%' : '¥'} (${row.valid_from} ~ ${row.valid_until})`);
        });
      }
      db.close();
    });
  }, 1000);
});