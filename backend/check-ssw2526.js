const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/snow_reservation.db');

console.log('🔍 檢查 SSW2526 折扣碼...');
db.get('SELECT * FROM discount_codes WHERE code = ?', ['SSW2526'], (err, row) => {
  if (err) {
    console.error('錯誤:', err);
  } else {
    console.log('📦 SSW2526 查詢結果:', JSON.stringify(row, null, 2));
  }
  
  // 檢查所有折扣碼
  console.log('\n📋 所有折扣碼列表:');
  db.all('SELECT code, name, discount_type, discount_value, valid_from, valid_until, active FROM discount_codes ORDER BY code', [], (err, rows) => {
    if (err) {
      console.error('錯誤:', err);
    } else {
      rows.forEach(row => {
        const symbol = row.discount_type === 'percentage' ? '%' : '¥';
        const status = row.active ? 'ACTIVE' : 'INACTIVE';
        console.log(`- ${row.code}: ${row.name} (${row.discount_value}${symbol}) [${status}]`);
      });
    }
    
    // 測試部署環境的 API
    console.log('\n🧪 測試部署環境 SSW2526...');
    fetch('https://snowforce-reservation.onrender.com/api/discount/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'SSW2526' })
    })
    .then(response => response.json())
    .then(data => {
      console.log('🌐 部署環境回應:', JSON.stringify(data, null, 2));
    })
    .catch(error => {
      console.error('❌ 測試部署環境失敗:', error);
    })
    .finally(() => {
      db.close();
    });
  });
});