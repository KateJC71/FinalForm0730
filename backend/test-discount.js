const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/snow_reservation.db');

console.log('🎯 測試完整的驗證查詢...');
const query = `
  SELECT * FROM discount_codes 
  WHERE code = ? 
  AND active = 1 
  AND (valid_from IS NULL OR date('now') >= valid_from)
  AND (valid_until IS NULL OR date('now') <= valid_until)
  AND (usage_limit IS NULL OR used_count < usage_limit)
`;

db.get(query, ['SnowPink2526'], (err, row) => {
  if (err) {
    console.error('🚨 查詢錯誤:', err);
  } else {
    console.log('✅ 驗證查詢結果:', JSON.stringify(row, null, 2));
    console.log('🔍 是否找到記錄:', !!row);
  }
  
  // 檢查每個條件
  console.log('\n🧪 檢查各個條件:');
  db.get('SELECT code, active, valid_from, valid_until, usage_limit, used_count, date("now") as now FROM discount_codes WHERE code = ?', ['SnowPink2526'], (err, data) => {
    if (data) {
      console.log('- code =', data.code);
      console.log('- active =', data.active, '(需要 = 1)');
      console.log('- valid_from =', data.valid_from, ', now =', data.now, ', valid_from <= now:', data.valid_from <= data.now);
      console.log('- valid_until =', data.valid_until, ', now =', data.now, ', now <= valid_until:', data.now <= data.valid_until);
      console.log('- usage_limit =', data.usage_limit, ', used_count =', data.used_count);
    }
    db.close();
  });
});