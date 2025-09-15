import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { runMigrations } from './runMigrations';

const dbPath = path.join(__dirname, '../../data/snow_reservation.db');

// 確保資料目錄存在
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// 創建用戶表
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

// 創建雪具表
const createEquipmentTable = `
CREATE TABLE IF NOT EXISTS equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT CHECK(category IN ('ski', 'snowboard', 'boots', 'helmet', 'clothing')) NOT NULL,
  size TEXT NOT NULL,
  condition TEXT CHECK(condition IN ('excellent', 'good', 'fair', 'poor')) NOT NULL,
  daily_rate REAL NOT NULL,
  total_quantity INTEGER NOT NULL,
  available_quantity INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

// 創建預約表 (允許匿名預約)
const createReservationsTable = `
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  equipment_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price REAL NOT NULL,
  status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  notes TEXT,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (equipment_id) REFERENCES equipment (id)
)`;

// 插入示例雪具數據
const insertSampleEquipment = `
INSERT OR IGNORE INTO equipment (name, category, size, condition, daily_rate, total_quantity, available_quantity, description) VALUES
('Salomon 滑雪板', 'ski', '170cm', 'excellent', 800, 10, 10, '專業級滑雪板，適合中高級滑雪者'),
('Burton 雪板', 'snowboard', '158cm', 'good', 600, 8, 8, '全山型雪板，適合各種地形'),
('Leki 滑雪杖', 'ski', '120cm', 'excellent', 100, 20, 20, '輕量化鋁合金滑雪杖'),
('Salomon 滑雪靴', 'boots', '42', 'good', 400, 15, 15, '舒適保暖的滑雪靴'),
('POC 安全帽', 'helmet', 'M', 'excellent', 200, 25, 25, '高安全性滑雪安全帽'),
('Columbia 滑雪外套', 'clothing', 'L', 'good', 300, 12, 12, '防水透氣的滑雪外套'),
('North Face 滑雪褲', 'clothing', '32', 'good', 250, 15, 15, '保暖防水的滑雪褲'),
('Atomic 兒童滑雪板', 'ski', '120cm', 'excellent', 500, 5, 5, '適合兒童的輕量化滑雪板')
`;

async function initDatabase() {
  return new Promise<void>((resolve, reject) => {
    // 先刪除並重新創建折扣碼表格以確保乾淨的狀態
    db.run('DROP TABLE IF EXISTS discount_codes', (err) => {
      if (err) {
        console.log('⚠️  刪除舊折扣碼表格失敗（可能不存在）:', err.message);
      } else {
        console.log('🗑️  已清除舊折扣碼表格');
      }
    });
    
    db.serialize(() => {
      // 創建表
      db.run(createUsersTable, (err) => {
        if (err) {
          console.error('創建用戶表失敗:', err);
          reject(err);
          return;
        }
        console.log('✅ 用戶表創建成功');
      });

      db.run(createEquipmentTable, (err) => {
        if (err) {
          console.error('創建雪具表失敗:', err);
          reject(err);
          return;
        }
        console.log('✅ 雪具表創建成功');
      });

      // 先創建折扣碼表格
      db.run(`
        CREATE TABLE IF NOT EXISTS discount_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
          discount_value REAL NOT NULL,
          valid_from DATE,
          valid_until DATE,
          usage_limit INTEGER DEFAULT NULL,
          used_count INTEGER DEFAULT 0,
          active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('創建折扣碼表失敗:', err);
          reject(err);
          return;
        }
        console.log('✅ 折扣碼表創建成功');
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS reservation_discounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reservation_id INTEGER,
          discount_code_id INTEGER,
          original_amount REAL,
          discount_amount REAL,
          final_amount REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reservation_id) REFERENCES reservations(id),
          FOREIGN KEY (discount_code_id) REFERENCES discount_codes(id)
        )
      `, (err) => {
        if (err) {
          console.error('創建預約折扣記錄表失敗:', err);
          reject(err);
          return;
        }
        console.log('✅ 預約折扣記錄表創建成功');
      });

      // 創建多人租借者詳細資料表
      db.run(`
        CREATE TABLE IF NOT EXISTS reservation_persons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reservation_id INTEGER NOT NULL,
          name TEXT,
          age INTEGER,
          gender TEXT,
          height INTEGER,
          weight INTEGER,
          footSize TEXT,
          level TEXT,
          skiType TEXT,
          boardType TEXT,
          equipType TEXT,
          clothingType TEXT,
          helmetOnly TEXT,
          fastWear TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reservation_id) REFERENCES reservations(id)
        )
      `, (err) => {
        if (err) {
          console.error('創建租借者詳細資料表失敗:', err);
          reject(err);
          return;
        }
        console.log('✅ 租借者詳細資料表創建成功');
      });

      db.run(createReservationsTable, (err) => {
        if (err) {
          console.error('創建預約表失敗:', err);
          reject(err);
          return;
        }
        console.log('✅ 預約表創建成功');
        
        // 檢查並添加新欄位 (如果不存在)
        db.run('ALTER TABLE reservations ADD COLUMN guest_name TEXT', (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('添加 guest_name 欄位失敗:', err);
          } else {
            console.log('✅ guest_name 欄位已存在或已添加');
          }
        });
        
        db.run('ALTER TABLE reservations ADD COLUMN guest_email TEXT', (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('添加 guest_email 欄位失敗:', err);
          } else {
            console.log('✅ guest_email 欄位已存在或已添加');
          }
        });
        
        db.run('ALTER TABLE reservations ADD COLUMN guest_phone TEXT', (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('添加 guest_phone 欄位失敗:', err);
          } else {
            console.log('✅ guest_phone 欄位已存在或已添加');
          }
        });
        
        // 添加預約編號欄位
        db.run('ALTER TABLE reservations ADD COLUMN reservation_number TEXT', (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('添加 reservation_number 欄位失敗:', err);
          } else {
            console.log('✅ reservation_number 欄位已存在或已添加');
          }
        });
        
        // 添加接送服務相關欄位
        db.run('ALTER TABLE reservations ADD COLUMN pickup_service BOOLEAN DEFAULT 0', (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('添加 pickup_service 欄位失敗:', err);
          } else {
            console.log('✅ pickup_service 欄位已存在或已添加');
          }
        });
        
        db.run('ALTER TABLE reservations ADD COLUMN pickup_location TEXT', (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('添加 pickup_location 欄位失敗:', err);
          } else {
            console.log('✅ pickup_location 欄位已存在或已添加');
          }
        });
        
        db.run('ALTER TABLE reservations ADD COLUMN return_location TEXT', (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('添加 return_location 欄位失敗:', err);
          } else {
            console.log('✅ return_location 欄位已存在或已添加');
          }
        });
        
        db.run('ALTER TABLE reservations ADD COLUMN pickup_date TEXT', (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('添加 pickup_date 欄位失敗:', err);
          } else {
            console.log('✅ pickup_date 欄位已存在或已添加');
          }
        });
        
        db.run('ALTER TABLE reservations ADD COLUMN pickup_time TEXT', (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('添加 pickup_time 欄位失敗:', err);
          } else {
            console.log('✅ pickup_time 欄位已存在或已添加');
          }
        });
        
        // 修改 user_id 為可空值 (SQLite 限制，無法直接修改，但新插入的記錄可以使用 NULL)
        db.run('UPDATE sqlite_master SET sql = REPLACE(sql, "user_id INTEGER NOT NULL", "user_id INTEGER") WHERE name = "reservations"', (err) => {
          if (err) {
            console.log('⚠️  無法修改 user_id 約束，但插入 NULL 值仍可正常運作');
          }
        });

        // 折扣碼表格已在前面創建完成
      });

      // 插入示例數據
      db.run(insertSampleEquipment, (err) => {
        if (err) {
          console.error('插入示例數據失敗:', err);
          reject(err);
          return;
        }
        console.log('✅ 示例雪具數據插入成功');
        
        // 插入折扣碼 - 只更新有效期，保持原折扣值
        db.run(`
          INSERT OR REPLACE INTO discount_codes (code, name, discount_type, discount_value, valid_from, valid_until, active) VALUES
          ('EarlyBird2526', '早鳥優惠 2025-2026', 'percentage', 20, '2025-08-01', '2025-09-15', 1),
          ('EarlyPink26', '早鳥優惠 Pink', 'percentage', 20, '2025-08-01', '2025-09-15', 1),
          ('EarlySSW26', '早鳥優惠 SSW', 'percentage', 20, '2025-08-01', '2025-09-15', 1),
          ('EarlySL26', '早鳥優惠 SL', 'percentage', 20, '2025-08-01', '2025-09-15', 1),
          ('EarlyComma26', '早鳥優惠 Comma', 'percentage', 20, '2025-08-01', '2025-09-15', 1),
          ('SnowPink2526', 'Snow Pink 合作優惠', 'percentage', 5, '2024-01-01', '2026-05-31', 1),
          ('SSW2526', 'SSW 合作優惠', 'percentage', 5, '2024-01-01', '2026-05-31', 1),
          ('SFS2526', 'SFS 專屬優惠', 'percentage', 5, '2024-01-01', '2026-05-31', 1)
        `, (err) => {
          if (err) {
            console.error('❌ 插入折扣碼失敗:', err);
            reject(err);
          } else {
            console.log('✅ 折扣碼插入成功');
            
            // 驗證插入結果
            db.get('SELECT COUNT(*) as count FROM discount_codes', [], async (err, row: any) => {
              if (err) {
                console.error('❌ 驗證折扣碼失敗:', err);
              } else {
                console.log(`📊 折扣碼表格共有 ${row.count} 筆記錄`);
              }
              
              // Run migrations after initial setup
              try {
                console.log('🔄 Running database migrations...');
                await runMigrations(dbPath);
                console.log('✅ Migrations completed');
              } catch (migrationError) {
                console.error('❌ Migration failed:', migrationError);
              }
              
              resolve();
            });
          }
        });
      });
    });
  });
}

// 如果直接執行此文件
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('🎉 資料庫初始化完成！');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ 資料庫初始化失敗:', err);
      process.exit(1);
    });
}

export { db, initDatabase }; 
