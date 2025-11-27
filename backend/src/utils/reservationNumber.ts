import { db } from '../database/init';

/**
 * 生成預約編號格式：RSV + YYYYMMDD + 序號(001, 002...)
 * 例：RSV20240719001
 */
export async function generateReservationNumber(): Promise<string> {
  // 使用日本時區 (UTC+9)
  const today = new Date();
  const japanTime = new Date(today.getTime() + (9 * 60 * 60 * 1000));
  const dateStr = japanTime.getFullYear().toString() +
                  (japanTime.getMonth() + 1).toString().padStart(2, '0') +
                  japanTime.getDate().toString().padStart(2, '0');

  return new Promise((resolve, reject) => {
    // 查詢當天預約號碼的最大序號
    const prefix = `RSV${dateStr}`;
    const query = `
      SELECT reservation_number
      FROM reservations
      WHERE reservation_number LIKE ?
      ORDER BY reservation_number DESC
      LIMIT 1
    `;

    db.get(query, [`${prefix}%`], (err, result: any) => {
      if (err) {
        reject(err);
        return;
      }

      let sequence = 1;
      if (result && result.reservation_number) {
        // 提取最後三位數字作為序號
        const lastNumber = result.reservation_number.slice(-3);
        const lastSequence = parseInt(lastNumber, 10);
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }

      const sequenceStr = sequence.toString().padStart(3, '0');
      const reservationNumber = `${prefix}${sequenceStr}`;

      resolve(reservationNumber);
    });
  });
}

/**
 * 檢查預約編號是否已存在
 */
export async function isReservationNumberExists(reservationNumber: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const query = 'SELECT COUNT(*) as count FROM reservations WHERE reservation_number = ?';
    
    db.get(query, [reservationNumber], (err, result: any) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(result.count > 0);
    });
  });
}

/**
 * 生成唯一的預約編號（確保不重複）
 */
export async function generateUniqueReservationNumber(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;
    const reservationNumber = await generateReservationNumber();

    // 檢查是否已存在
    const exists = await isReservationNumberExists(reservationNumber);

    if (!exists) {
      return reservationNumber;
    }

    // 如果存在，等待一小段時間後重試（避免競態條件）
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  throw new Error('無法生成唯一的預約編號');
}