import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.join(__dirname, '../.env');
console.log('🔍 Loading .env from:', envPath);
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  console.error('❌ Error loading .env file:', envResult.error);
} else {
  console.log('✅ .env file loaded successfully');
  console.log('🔍 GOOGLE_SHEETS_URL:', process.env.GOOGLE_SHEETS_URL);
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initDatabase } from './database/init';
import { googleSheetsService } from './services/googleSheets';

// 路由
import authRoutes from './routes/auth';
import equipmentRoutes from './routes/equipment';
import reservationRoutes from './routes/reservations';
import discountRoutes from './routes/discount';

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'https://final-form0730-frontend.vercel.app',
  'https://reservation.furano-snowforce.com'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/discount', discountRoutes);

// 健康檢查
app.get('/api/health', async (req, res) => {
  try {
    const sheetsConnected = await googleSheetsService.testConnection();
    res.json({ 
      status: 'OK', 
      message: '雪具預約系統 API 運行正常',
      googleSheets: sheetsConnected ? 'Connected' : 'Not configured',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      status: 'OK', 
      message: '雪具預約系統 API 運行正常',
      googleSheets: 'Connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// 錯誤處理中間件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: '伺服器內部錯誤' });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({ message: '路由不存在' });
});

// 啟動伺服器
async function startServer() {
  try {
    // 初始化資料庫
    await initDatabase();
    console.log('✅ 資料庫初始化完成');

    // 啟動伺服器
    app.listen(PORT, () => {
      console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
      console.log(`📊 API 文檔: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ 伺服器啟動失敗:', error);
    process.exit(1);
  }
}

startServer(); 