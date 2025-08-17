const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/snow_reservation.db');

console.log('📋 所有折扣碼詳細資訊:\n');
db.all(`SELECT * FROM discount_codes ORDER BY code`, [], (err, rows) => {
  if (err) {
    console.error('錯誤:', err);
  } else {
    rows.forEach(row => {
      console.log(`折扣碼: ${row.code}`);
      console.log(`  名稱: ${row.name}`);
      console.log(`  類型: ${row.discount_type === 'percentage' ? '百分比' : '固定金額'}`);
      console.log(`  折扣: ${row.discount_value}${row.discount_type === 'percentage' ? '%' : '¥'}`);
      console.log(`  生效日期: ${row.valid_from || '無限制'}`);
      console.log(`  截止日期: ${row.valid_until || '無限制'}`);
      console.log(`  使用限制: ${row.usage_limit || '無限制'}`);
      console.log(`  已使用: ${row.used_count} 次`);
      console.log(`  狀態: ${row.active ? '啟用' : '停用'}`);
      console.log('---');
    });
  }
  db.close();
});