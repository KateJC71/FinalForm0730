@echo off
echo 正在啟動雪具預約系統...
echo.

echo 1. 安裝依賴...
call npm run install:all

echo.
echo 2. 啟動開發伺服器...
call npm run dev

pause 