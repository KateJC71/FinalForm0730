const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/snow_reservation.db');

console.log('📊 本地資料庫折扣碼統計:');
db.all('SELECT code, name FROM discount_codes ORDER BY code', [], (err, rows) => {
  if (err) {
    console.error('錯誤:', err);
  } else {
    console.log('總共', rows.length, '個折扣碼:');
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.code}: ${row.name}`);
    });
  }
  db.close();
});