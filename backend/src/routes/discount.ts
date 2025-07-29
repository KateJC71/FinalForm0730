import express from 'express';
import { validateDiscountCode, applyDiscount } from '../controllers/discountController';

const router = express.Router();

// POST /api/discount/validate - 驗證折扣碼
router.post('/validate', validateDiscountCode);

// POST /api/discount/calculate - 計算折扣後價格
router.post('/calculate', applyDiscount);

export default router;