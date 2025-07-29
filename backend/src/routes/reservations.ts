import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { googleSheetsService } from '../services/googleSheets';
import { generateUniqueReservationNumber } from '../utils/reservationNumber';
import { recordDiscountUsage } from '../controllers/discountController';

interface Equipment {
  id: number;
  name: string;
  category: string;
  size: string;
  daily_rate: number;
  available_quantity: number;
  image_url?: string;
}

interface Reservation {
  id: number;
  user_id: number;
  equipment_id: number;
  start_date: string;
  end_date: string;
  pickup_date?: string;
  pickup_time?: string;
  total_price: number;
  status: string;
  notes?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  pickup_service?: boolean;
  pickup_location?: string;
  return_location?: string;
  reservation_number?: string;
  created_at: string;
}

const router = Router();

// 創建預約 (無需登入)
router.post('/', [
  body('equipment_id').isInt().withMessage('雪具ID必須是整數'),
  body('start_date').isDate().withMessage('開始日期格式無效'),
  body('end_date').isDate().withMessage('結束日期格式無效'),
  body('user_name').notEmpty().withMessage('姓名必填'),
  body('user_email').isEmail().withMessage('Email格式無效')
], async (req: Request, res: Response) => {
  console.log('📝 Received reservation request:', JSON.stringify(req.body, null, 2));
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { 
    equipment_id, 
    start_date, 
    end_date, 
    pickup_date,
    pickup_time,
    notes, 
    user_name, 
    user_email, 
    user_phone, 
    total_price,
    originalPrice,
    discountCode,
    discountAmount,
    pickup_service,
    pickup_location,
    return_location,
    pickupLocation,
    returnLocation
  } = req.body;
  const user_id = -1; // 使用 -1 表示匿名用戶 (避免 NULL 約束)
  
  console.log('✅ Processing reservation for:', user_name, user_email);

  // 檢查日期是否有效
  const start = new Date(start_date);
  const end = new Date(end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    return res.status(400).json({ message: '開始日期不能早於今天' });
  }

  if (end <= start) {
    return res.status(400).json({ message: '結束日期必須晚於開始日期' });
  }

  // 檢查雪具是否可用
  console.log('🔍 Checking equipment with ID:', equipment_id);
  db.get('SELECT * FROM equipment WHERE id = ?', [equipment_id], async (err, equipment: Equipment) => {
    if (err) {
      console.error('❌ Equipment query error:', err);
      return res.status(500).json({ message: '資料庫錯誤' });
    }
    if (!equipment) {
      console.error('❌ Equipment not found with ID:', equipment_id);
      return res.status(404).json({ message: '雪具不存在' });
    }
    console.log('✅ Equipment found:', equipment);
    // 移除庫存檢查 - 允許無限預約
    // 移除日期衝突檢查 - 允許同一天多個預約

    // 驗證折扣碼（如果有）
    let validatedDiscountAmount = 0;
    let finalTotalPrice = total_price;
    
    if (discountCode) {
      console.log('🎟️ Validating discount code:', discountCode);
      
      // 查詢折扣碼
      const discountQuery = `
        SELECT * FROM discount_codes 
        WHERE code = ? 
        AND active = 1 
        AND (valid_from IS NULL OR date('now') >= valid_from)
        AND (valid_until IS NULL OR date('now') <= valid_until)
        AND (usage_limit IS NULL OR used_count < usage_limit)
      `;
      
      const discountRow: any = await new Promise((resolve, reject) => {
        db.get(discountQuery, [discountCode], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (discountRow) {
        // 計算折扣金額
        const basePrice = originalPrice || total_price;
        if (discountRow.discount_type === 'percentage') {
          validatedDiscountAmount = Math.round(basePrice * (discountRow.discount_value / 100));
        } else {
          validatedDiscountAmount = Math.min(discountRow.discount_value, basePrice);
        }
        
        // 驗證前端傳來的折扣金額是否正確
        if (Math.abs(validatedDiscountAmount - discountAmount) > 1) {
          console.error('❌ Discount amount mismatch:', { client: discountAmount, server: validatedDiscountAmount });
          return res.status(400).json({ message: '折扣金額計算錯誤' });
        }
        
        finalTotalPrice = basePrice - validatedDiscountAmount;
        console.log('✅ Discount validated:', { code: discountCode, amount: validatedDiscountAmount, final: finalTotalPrice });
      } else {
        console.error('❌ Invalid discount code:', discountCode);
        return res.status(400).json({ message: '折扣碼無效或已過期' });
      }
    } else {
      // 沒有折扣碼，使用原始價格
      finalTotalPrice = total_price || equipment.daily_rate * Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    // 處理接送服務資料
    const finalPickupService = pickup_service || false;
    const finalPickupLocation = pickup_location || pickupLocation || '';
    const finalReturnLocation = return_location || returnLocation || '';
    
    console.log('🚗 Pickup service data:', {
      pickup_service: finalPickupService,
      pickup_location: finalPickupLocation,
      return_location: finalReturnLocation
    });
    
    console.log('📅 Date data before DB insert:', {
      start_date,
      end_date,
      start_type: typeof start_date,
      end_type: typeof end_date
    });

    // 生成預約編號
    let reservationNumber: string;
    try {
      reservationNumber = await generateUniqueReservationNumber();
      console.log('🔢 Generated reservation number:', reservationNumber);
    } catch (error) {
      console.error('❌ Failed to generate reservation number:', error);
      return res.status(500).json({ message: '生成預約編號失敗' });
    }

    // 創建預約 (包含訪客資訊和接送服務)
    const insertReservation = `
      INSERT INTO reservations (user_id, equipment_id, start_date, end_date, pickup_date, pickup_time, total_price, notes, guest_name, guest_email, guest_phone, pickup_service, pickup_location, return_location, reservation_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(insertReservation, [user_id, equipment_id, start_date, end_date, pickup_date, pickup_time, finalTotalPrice, notes, user_name, user_email, user_phone, finalPickupService, finalPickupLocation, finalReturnLocation, reservationNumber], async function(err) {
      if (err) {
        console.error('❌ Database insertion error:', err);
        return res.status(500).json({ message: '創建預約失敗' });
      }

      const reservationId = this.lastID;

      // 儲存多人租借者資料
      const persons = req.body.persons || [];
      if (persons.length > 0) {
        console.log('💾 Saving multiple persons data:', persons);
        
        const insertPersonSql = `
          INSERT INTO reservation_persons (reservation_id, name, age, gender, height, weight, footSize, level, skiType, boardType, equipType, clothingType, helmetOnly, fastWear)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const person of persons) {
          db.run(insertPersonSql, [
            reservationId,
            person.name || '',
            person.age || null,
            person.gender || '',
            person.height || null,
            person.weight || null,
            person.footSize || '',
            person.level || '',
            person.skiType || '',
            person.boardType || '',
            person.equipType || '',
            person.clothingType || '',
            person.helmetOnly || '',
            person.fastWear || ''
          ], function(err) {
            if (err) {
              console.error('❌ Error saving person data:', err);
            } else {
              console.log(`✅ Saved person data for reservation ${reservationId}`);
            }
          });
        }
      }

      // 移除庫存更新 - 不再減少可用數量

      // 記錄折扣碼使用（如果有）
      if (discountCode && validatedDiscountAmount > 0) {
        try {
          await recordDiscountUsage(
            reservationId,
            discountCode,
            originalPrice || finalTotalPrice + validatedDiscountAmount,
            validatedDiscountAmount,
            finalTotalPrice
          );
          console.log('✅ Discount usage recorded for reservation:', reservationId);
        } catch (error) {
          console.error('❌ Failed to record discount usage:', error);
          // 不影響預約創建，繼續執行
        }
      }

      // 發送資料到 Google Sheets (異步，不影響回應)
      try {
        // 使用完整的前端資料 (支援多人預約)
        const frontendData = req.body.frontendData || {
          applicant: {
            name: user_name,
            email: user_email,
            phone: user_phone,
            hotel: req.body.hotel || ''
          },
          persons: req.body.persons || [{
            name: user_name,
            age: req.body.age || 25,
            gender: req.body.gender || '未指定',
            height: req.body.height || 170,
            weight: req.body.weight || 65,
            shoeSize: req.body.shoeSize || 26
          }]
        };

        // 轉換為 GAS 格式並發送
        const gasData = googleSheetsService.convertReservationToGASFormat(
          {
            id: reservationId,
            reservation_number: reservationNumber,
            start_date,
            end_date,
            pickup_date,
            pickup_time,
            total_price: finalTotalPrice,
            original_price: originalPrice || finalTotalPrice + validatedDiscountAmount,
            discount_code: discountCode || '',
            discount_amount: validatedDiscountAmount,
            notes,
            pickupLocation: req.body.pickupLocation || '富良野店',
            returnLocation: req.body.returnLocation || '富良野店'
          },
          frontendData,
          equipment
        );
        
        console.log('📊 GAS Data being sent:', JSON.stringify(gasData, null, 2));

        const sheetsSuccess = await googleSheetsService.sendReservationToSheets(gasData);
        if (sheetsSuccess) {
          console.log(`✅ Reservation ${reservationId} synced to Google Sheets`);
        } else {
          console.log(`⚠️  Reservation ${reservationId} saved locally but failed to sync to Google Sheets`);
        }
      } catch (error) {
        console.error('❌ Error syncing to Google Sheets:', error);
      }

      res.status(201).json({
        message: '預約創建成功',
        reservation_id: reservationId,
        reservation_number: reservationNumber,
        total_price: finalTotalPrice,
        original_price: originalPrice || finalTotalPrice + validatedDiscountAmount,
        discount_code: discountCode || '',
        discount_amount: validatedDiscountAmount
      });
    });
  });
});

// 獲取用戶預約
router.get('/my', authenticateToken, (req: AuthRequest, res: Response) => {
  const user_id = req.user!.id;
  
  const query = `
    SELECT r.*, e.name as equipment_name, e.category, e.size, e.image_url
    FROM reservations r
    JOIN equipment e ON r.equipment_id = e.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `;
  
  db.all(query, [user_id], (err, reservations) => {
    if (err) {
      return res.status(500).json({ message: '資料庫錯誤' });
    }
    res.json(reservations);
  });
});

// 獲取預約的多人租借者詳細資料
router.get('/:id/persons', (req: Request, res: Response) => {
  const { id } = req.params;
  
  const query = `
    SELECT rp.*, r.reservation_number, r.guest_name as applicant_name
    FROM reservation_persons rp
    JOIN reservations r ON rp.reservation_id = r.id
    WHERE rp.reservation_id = ?
    ORDER BY rp.id
  `;
  
  db.all(query, [id], (err, persons) => {
    if (err) {
      console.error('❌ Error fetching persons data:', err);
      return res.status(500).json({ message: '資料庫錯誤' });
    }
    res.json(persons);
  });
});

// 取消預約
router.patch('/:id/cancel', authenticateToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user_id = req.user!.id;

  // 檢查預約是否存在且屬於該用戶
  db.get('SELECT * FROM reservations WHERE id = ? AND user_id = ?', [id, user_id], (err, reservation: Reservation) => {
    if (err) {
      return res.status(500).json({ message: '資料庫錯誤' });
    }
    if (!reservation) {
      return res.status(404).json({ message: '預約不存在' });
    }
    if (reservation.status === 'cancelled') {
      return res.status(400).json({ message: '預約已被取消' });
    }
    if (reservation.status === 'completed') {
      return res.status(400).json({ message: '已完成的預約無法取消' });
    }

    // 取消預約
    db.run('UPDATE reservations SET status = ? WHERE id = ?', ['cancelled', id], function(err) {
      if (err) {
        return res.status(500).json({ message: '取消預約失敗' });
      }

      // 移除庫存恢復 - 不再增加可用數量

      res.json({ message: '預約取消成功' });
    });
  });
});

export default router; 