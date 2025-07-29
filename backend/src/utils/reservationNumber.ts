import { db } from '../database/init';

/**
 * 生成預約編號格式：RSV + YYYYMMDD + 序號(001, 002...)
 * 例：RSV20240719001
 */
export async function generateReservationNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.getFullYear().toString() + 
                  (today.getMonth() + 1).toString().padStart(2, '0') + 
                  today.getDate().toString().padStart(2, '0');
  
  return new Promise((resolve, reject) => {
    // 查詢今天已有多少預約（用於生成序號）
    const prefix = `RSV${dateStr}`;
    const query = `
      SELECT COUNT(*) as count 
      FROM reservations 
      WHERE reservation_number LIKE ? 
      AND DATE(created_at) = DATE('now', 'localtime')
    `;
    
    db.get(query, [`${prefix}%`], (err, result: any) => {
      if (err) {
        reject(err);
        return;
      }
      
      const count = result.count || 0;
      const sequence = (count + 1).toString().padStart(3, '0');
      const reservationNumber = `${prefix}${sequence}`;
      
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
  let reservationNumber = await generateReservationNumber();
  let attempts = 0;
  const maxAttempts = 100;
  
  while (await isReservationNumberExists(reservationNumber) && attempts < maxAttempts) {
    attempts++;
    const today = new Date();
    const dateStr = today.getFullYear().toString() + 
                    (today.getMonth() + 1).toString().padStart(2, '0') + 
                    today.getDate().toString().padStart(2, '0');
    
    // 如果重複，使用微秒時間戳作為後綴
    const timestamp = Date.now().toString().slice(-3);
    reservationNumber = `RSV${dateStr}${timestamp}`;
  }
  
  if (attempts >= maxAttempts) {
    throw new Error('無法生成唯一的預約編號');
  }
  
  return reservationNumber;
}