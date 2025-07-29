# 雪具預約系統部署指南

## 功能概述

這個雪具預約系統包含以下主要功能：
- 完整的雪具預約流程（日期、人員、設備選擇）
- 折扣碼系統（百分比折扣和固定金額折扣）
- Google Sheets 整合（自動記錄預約資料）
- 響應式網頁設計
- 多語系支持（中文/日文介面）

## 部署架構

### 前端 (Vercel)
- 部署 URL: https://snow-equipment-reservation-frontend-gto3msy6m.vercel.app
- 技術棧: React + TypeScript + Vite
- 自動從 GitHub main 分支部署

### 後端 (Render)
- 部署 URL: https://snowforce-reservation.onrender.com
- 技術棧: Node.js + Express + SQLite
- 自動從 GitHub main 分支部署

### Google Sheets 整合
- 使用 Google Apps Script 接收預約資料
- 支援折扣碼記錄（R列）
- 自動格式化和資料驗證

## 部署步驟

### 1. GitHub 設置
```bash
git clone https://github.com/KateJC71/snow-equipment-reservation.git
cd snow-equipment-reservation
```

### 2. 前端部署 (Vercel)
1. 連結 GitHub repository 到 Vercel
2. 設置 build 指令：`cd frontend && npm run build`
3. 設置輸出目錄：`frontend/dist`
4. 環境變數設置：
   ```
   VITE_API_BASE_URL=https://snowforce-reservation.onrender.com
   ```

### 3. 後端部署 (Render)
1. 連結 GitHub repository 到 Render
2. 設置 build 指令：`cd backend && npm install && npm run build`
3. 設置啟動指令：`cd backend && npm start`
4. 環境變數設置：
   ```
   NODE_ENV=production
   PORT=3000
   GOOGLE_SHEETS_URL=<你的Google Apps Script URL>
   FRONTEND_URL=https://snow-equipment-reservation-frontend-gto3msy6m.vercel.app
   ```

### 4. Google Apps Script 設置
1. 打開 https://script.google.com
2. 創建新專案
3. 複製 `google-apps-script.js` 的內容
4. 替換 Spreadsheet ID 為你的 Google Sheets ID
5. 部署為網路應用程式
6. 複製部署 URL 到後端環境變數

## 環境變數說明

### 後端環境變數
- `NODE_ENV`: 運行環境 (production/development)
- `PORT`: 服務端口 (預設 3000)
- `GOOGLE_SHEETS_URL`: Google Apps Script 部署 URL
- `FRONTEND_URL`: 前端 URL (用於 CORS 設置)

### 前端環境變數
- `VITE_API_BASE_URL`: 後端 API base URL

## 折扣碼系統

### 支援的折扣碼類型
1. **百分比折扣**: 如 20% off
2. **固定金額折扣**: 如 ¥1000 off

### 預設折扣碼
- `EarlyBird2526`: 早鳥優惠 5% 折扣
- `SnowPink2526`: 粉雪特惠 ¥1400 折扣
- `SFSZ526`: 教練合作 ¥1400 折扣

### Google Sheets 欄位對應
- A列: 預約編號
- B列: 租借日期
- C列: 歸還日期
- ...
- P列: 總金額 (折扣後)
- Q列: 原始金額 (折扣前)
- R列: 折扣碼
- S列: 建立時間

## 故障排除

### CORS 錯誤
確保後端 `allowedOrigins` 包含所有前端域名：
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://snow-equipment-reservation-frontend-69ejvtmju.vercel.app',
  'https://snow-equipment-reservation-frontend.vercel.app',
  'https://snow-equipment-reservation-frontend-gto3msy6m.vercel.app'
];
```

### Google Sheets 連接失敗
1. 確認 Google Apps Script 已正確部署
2. 檢查 Spreadsheet ID 是否正確
3. 確認 Google Sheets 權限設置

### 折扣碼無效
1. 檢查資料庫中的折扣碼設置
2. 確認日期範圍和使用次數限制
3. 檢查後端 console 日誌

## 監控和維護

### 日誌監控
- 後端: Render dashboard 查看應用程式日誌
- 前端: Vercel dashboard 查看建置和運行日誌
- Google Sheets: Apps Script 編輯器查看執行日誌

### 資料庫維護
- 定期備份 SQLite 資料庫
- 監控折扣碼使用情況
- 清理過期的預約記錄

## 版本更新

1. 推送變更到 GitHub main 分支
2. 前後端會自動重新部署
3. 如有 Google Apps Script 變更，需手動更新
4. 確認所有環境變數設置正確

## 聯繫支援

如有技術問題，請檢查：
1. GitHub repository issues
2. 部署平台的日誌
3. Google Apps Script 執行日誌